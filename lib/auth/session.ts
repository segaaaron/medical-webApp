// Web Crypto API — compatible with Node.js 18+ (API routes) and Edge Runtime (middleware)

export const COOKIE_NAME = "jn_session"

// OWASP Session Management: timeout por inactividad + timeout absoluto.
// Antes el token vivía 2 h ABSOLUTAS y nunca se renovaba: la doctora escribió
// un artículo durante más de 2 h, pulsó Guardar y el servidor respondió 401.
// Ahora cada renovación (ver `/api/auth/session`) corre la ventana de
// inactividad, pero nunca más allá de `iat + ABSOLUTE_TTL_MS`.
export const IDLE_TTL_MS = 60 * 60 * 1000 // 60 min sin actividad
export const ABSOLUTE_TTL_MS = 8 * 60 * 60 * 1000 // 8 h desde el login
// Duración fija de los tokens antiguos (`user:exp`), para deducir su login.
const LEGACY_TTL_MS = 2 * 60 * 60 * 1000
// La cookie sobrevive un día al límite absoluto: un token caducado es inútil
// (verifyToken lo rechaza) pero, si el navegador lo borrara justo a las 8 h, al
// recargar el login aparecería sin «Tu sesión expiró».
const COOKIE_GRACE_MS = 24 * 60 * 60 * 1000

export interface Session {
  user: string
  /** Momento del login (ms). */
  iat: number
  /** Expira si no se renueva antes de este instante (ms). */
  idleExp: number
  /** Límite duro: iat + 8 h (ms). */
  absExp: number
}

function getSecret(): string {
  const secret = process.env.DASHBOARD_SECRET
  if (!secret) {
    throw new Error(
      "DASHBOARD_SECRET environment variable is not set. " +
        "Generate a secure secret with: node -e \"console.log(require('crypto').randomBytes(64).toString('base64'))\""
    )
  }
  if (secret.length < 32) {
    throw new Error("DASHBOARD_SECRET must be at least 32 characters long.")
  }
  return secret
}

async function hmac(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
  // Convert to hex string
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * Firma un token de sesión. `iat` = momento del login: al renovar se pasa el
 * original para que la ventana de inactividad nunca supere el límite absoluto.
 * Payload v2: `v2:user:iat:idleExp`.
 */
export async function signToken(user: string, iat = Date.now(), now = Date.now()): Promise<string> {
  const idleExp = Math.min(now + IDLE_TTL_MS, iat + ABSOLUTE_TTL_MS)
  const payload = `v2:${user}:${iat}:${idleExp}`
  const signature = await hmac(payload, getSecret())
  // Token = base64(payload) + "." + hex(signature)
  return `${btoa(payload)}.${signature}`
}

/**
 * Opciones de la cookie de sesión. Vive hasta el límite ABSOLUTO, no la ventana
 * de inactividad: así un token caducado por inactividad sigue llegando al
 * middleware, que lo rechaza (verifyToken aplica la inactividad) y manda al
 * login con `reason=expired` → «Tu sesión expiró». Si el navegador borrara la
 * cookie, el login aparecería sin explicación (de ahí también COOKIE_GRACE_MS).
 * Logout la borra (absExp 0).
 */
export function sessionCookieOptions(session: Pick<Session, "absExp">, now = Date.now()) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: session.absExp ? Math.max(0, Math.ceil((session.absExp + COOKIE_GRACE_MS - now) / 1000)) : 0,
  }
}

export async function verifyToken(token: string, now = Date.now()): Promise<Session | null> {
  try {
    const dotIndex = token.indexOf(".")
    if (dotIndex === -1) return null

    const payloadB64 = token.slice(0, dotIndex)
    const signature = token.slice(dotIndex + 1)

    const payload = atob(payloadB64)
    const expectedSig = await hmac(payload, getSecret())

    // Constant-time comparison — prevents timing side-channel attacks (Edge-compatible)
    if (expectedSig.length !== signature.length) return null
    let diff = 0
    for (let i = 0; i < expectedSig.length; i++) {
      diff |= expectedSig.charCodeAt(i) ^ signature.charCodeAt(i)
    }
    if (diff !== 0) return null

    const parts = payload.split(":")
    let session: Session
    if (parts.length === 4 && parts[0] === "v2") {
      const iat = Number(parts[2])
      const idleExp = Number(parts[3])
      session = { user: parts[1], iat, idleExp, absExp: iat + ABSOLUTE_TTL_MS }
    } else if (parts.length === 2) {
      // Token antiguo `user:exp` (2 h fijas): válido hasta su exp. Al renovarlo
      // se toma como login exp − 2 h, así también queda sujeto al límite de 8 h.
      const exp = Number(parts[1])
      session = { user: parts[0], iat: exp - LEGACY_TTL_MS, idleExp: exp, absExp: exp }
    } else {
      return null
    }

    const { user, iat, idleExp, absExp } = session
    if (!user || !Number.isFinite(iat) || !Number.isFinite(idleExp)) return null
    if (now > idleExp || now > absExp) return null

    return session
  } catch {
    return null
  }
}
