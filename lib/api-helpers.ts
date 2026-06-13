/**
 * Shared security helpers for API route handlers.
 */

import { NextRequest, NextResponse } from "next/server"

// ── Backend Error Forwarding ──────────────────────────────────────────────────

/**
 * Maps a backend error to a NextResponse.
 * 4xx errors are forwarded as-is; 5xx / unreachable become 502.
 */
export function proxyError(error: string | null, backendStatus: number): NextResponse {
  const status = backendStatus >= 400 && backendStatus < 500 ? backendStatus : 502
  return NextResponse.json({ error: error ?? "Error del servidor" }, { status })
}

// ── ID Validation ─────────────────────────────────────────────────────────────

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const NUMERIC_RE = /^\d{1,19}$/
const SLUG_RE = /^[a-zA-Z0-9_\-]{1,128}$/

/**
 * Validates a resource ID — accepts numeric IDs, UUIDs, or slug-style strings.
 * Rejects anything that could be used for path traversal or injection.
 */
export function isValidId(id: string): boolean {
  return NUMERIC_RE.test(id) || UUID_RE.test(id) || SLUG_RE.test(id)
}

export function invalidIdResponse() {
  return NextResponse.json({ error: "Invalid resource ID" }, { status: 400 })
}

/**
 * Invitation token shape — base64url (CSPRNG), 20–64 chars.
 * Used to reject malformed tokens before hitting the backend.
 */
export const INVITE_TOKEN_RE = /^[A-Za-z0-9_-]{20,64}$/

// ── CSRF Origin Check ─────────────────────────────────────────────────────────

/**
 * Validates the Origin or Referer header on state-changing requests
 * (POST, PUT, DELETE, PATCH) to mitigate CSRF.
 *
 * Returns a 403 response if the origin is not trusted, or null if it is OK.
 */
export function checkCsrfOrigin(req: NextRequest): NextResponse | null {
  const method = req.method.toUpperCase()
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) return null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""
  const origin = req.headers.get("origin")
  const referer = req.headers.get("referer")

  // In development allow localhost origins
  const allowedOrigins: string[] = []
  if (siteUrl) allowedOrigins.push(new URL(siteUrl).origin)
  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.push("http://localhost:3000")
    allowedOrigins.push("http://127.0.0.1:3000")
  }

  // If no allowed origins are configured, skip the check (avoid hard lockout)
  if (allowedOrigins.length === 0) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[SECURITY] CSRF check disabled — NEXT_PUBLIC_SITE_URL not set in production")
    }
    return null
  }

  const source = origin ?? (referer ? new URL(referer).origin : null)
  if (!source || !allowedOrigins.includes(source)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return null
}

// ── Write Rate Limiter ────────────────────────────────────────────────────────

const WRITE_RATE_LIMIT_MAX = 30
const WRITE_RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

interface RateLimitEntry {
  count: number
  windowStart: number
}

const writeRateLimitMap = new Map<string, RateLimitEntry>()

// Evict expired entries every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of writeRateLimitMap.entries()) {
    if (now - entry.windowStart > WRITE_RATE_LIMIT_WINDOW_MS) writeRateLimitMap.delete(ip)
  }
}, 5 * 60 * 1000)

/**
 * Rate limits write operations (POST/PUT/DELETE) by IP.
 * Returns a 429 response if the limit is exceeded, or null if OK.
 */
export function checkWriteRateLimit(req: NextRequest): NextResponse | null {
  const method = req.method.toUpperCase()
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) return null

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  const now = Date.now()
  const entry = writeRateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > WRITE_RATE_LIMIT_WINDOW_MS) {
    writeRateLimitMap.set(ip, { count: 1, windowStart: now })
    return null
  }

  if (entry.count >= WRITE_RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      }
    )
  }

  entry.count += 1
  return null
}
