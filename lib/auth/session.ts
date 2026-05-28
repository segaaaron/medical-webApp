// Web Crypto API — compatible with Node.js 18+ (API routes) and Edge Runtime (middleware)

export const COOKIE_NAME = "jn_session"
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000 // 2 hours

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

export async function signToken(user: string): Promise<string> {
  const exp = Date.now() + TOKEN_TTL_MS
  const payload = `${user}:${exp}`
  const signature = await hmac(payload, getSecret())
  // Token = base64(payload) + "." + hex(signature)
  return `${btoa(payload)}.${signature}`
}

export async function verifyToken(token: string): Promise<{ user: string } | null> {
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

    const [user, expStr] = payload.split(":")
    const exp = Number(expStr)
    if (!user || isNaN(exp) || Date.now() > exp) return null

    return { user }
  } catch {
    return null
  }
}
