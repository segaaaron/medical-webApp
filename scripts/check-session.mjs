/**
 * Verifica la lógica del token de sesión del panel (`lib/auth/session.ts`):
 * inactividad 60 min, límite absoluto 8 h y compatibilidad con tokens antiguos.
 *
 *   npm run check:session
 */
import assert from "node:assert/strict"

process.env.DASHBOARD_SECRET ??= "x".repeat(48)
const { signToken, verifyToken, sessionCookieOptions, IDLE_TTL_MS, ABSOLUTE_TTL_MS } = await import(
  "../lib/auth/session.ts"
)

const MIN = 60 * 1000
const t0 = Date.UTC(2026, 8, 20, 20, 17)

// Token nuevo: válido dentro de la ventana de inactividad, inválido fuera.
const fresh = await signToken("doc@example.com", t0, t0)
assert.equal((await verifyToken(fresh, t0 + 59 * MIN))?.user, "doc@example.com")
assert.equal(await verifyToken(fresh, t0 + IDLE_TTL_MS + 1), null, "caduca tras 60 min sin renovar")

// Renovar corre la ventana, pero nunca más allá de iat + 8 h.
let token = fresh
let now = t0
for (let i = 0; i < 20; i++) {
  now += 50 * MIN
  const s = await verifyToken(token, now)
  if (!s) break
  token = await signToken(s.user, s.iat, now)
}
const last = await verifyToken(token, t0 + ABSOLUTE_TTL_MS - 1)
assert.ok(last, "renovando sigue viva hasta el límite absoluto")
assert.equal(last.idleExp, t0 + ABSOLUTE_TTL_MS, "la ventana se topa en iat + 8 h")
assert.equal(await verifyToken(token, t0 + ABSOLUTE_TTL_MS + 1), null, "límite absoluto de 8 h")

// maxAge de la cookie = lo que queda hasta el límite ABSOLUTO (no la inactividad),
// para que un token caducado por inactividad llegue al middleware → reason=expired.
const freshSession = await verifyToken(fresh, t0)
// (+24 h de gracia: tras el límite absoluto la cookie sigue llegando → reason=expired).
assert.equal(sessionCookieOptions(freshSession, t0).maxAge, 8 * 3600 + 24 * 3600)
assert.equal(sessionCookieOptions(freshSession, t0 + 7 * 60 * MIN).maxAge, 3600 + 24 * 3600)
assert.equal(sessionCookieOptions({ absExp: 0 }, t0).maxAge, 0, "logout borra la cookie")

// Token antiguo `user:exp` firmado igual: válido hasta su exp; renovado → v2 con iat = exp − 2 h.
const { createHmac } = await import("node:crypto")
const legacyExp = t0 + 2 * 60 * MIN
const payload = `doc@example.com:${legacyExp}`
const legacy = `${btoa(payload)}.${createHmac("sha256", process.env.DASHBOARD_SECRET).update(payload).digest("hex")}`
const legacySession = await verifyToken(legacy, t0 + 60 * MIN)
assert.equal(legacySession?.user, "doc@example.com", "token antiguo sigue válido")
assert.equal(await verifyToken(legacy, legacyExp + 1), null, "token antiguo caduca en su exp")
assert.equal(legacySession.iat, t0)
const upgraded = await verifyToken(await signToken(legacySession.user, legacySession.iat, t0 + 60 * MIN), t0 + 60 * MIN)
assert.equal(upgraded?.absExp, t0 + ABSOLUTE_TTL_MS)

// Firma alterada o formato raro → inválido.
assert.equal(await verifyToken(fresh.slice(0, -1) + (fresh.endsWith("0") ? "1" : "0"), t0), null)
const forged = `${btoa(`v2:doc@example.com:${t0}:${t0 + 99 * ABSOLUTE_TTL_MS}`)}.${fresh.split(".")[1]}`
assert.equal(await verifyToken(forged, t0), null)
assert.equal(await verifyToken("basura", t0), null)

console.log("✓ session token: idle 60 min, absoluto 8 h, compatibilidad con tokens antiguos")
