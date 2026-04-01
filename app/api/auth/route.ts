import { NextRequest, NextResponse } from "next/server"
import { signToken, verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import {
  BACKEND_ACCESS_COOKIE,
  BACKEND_REFRESH_COOKIE,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
  CLEAR_COOKIE_OPTIONS,
  revokeBackendRefreshToken,
} from "@/lib/auth/backend-tokens"
import { cookies } from "next/headers"

const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://service.drayasminmedrano-services.cloud"

// In-memory rate limiter: max 5 login attempts per IP per 15 minutes
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

interface RateLimitEntry {
  count: number
  windowStart: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true
  }

  entry.count += 1
  return false
}

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60, // 8 horas
}

// POST /api/auth — login
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown"

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Intenta nuevamente en 15 minutos." },
        { status: 429 }
      )
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos." },
        { status: 400 }
      )
    }

    // Validate credentials against backend
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!backendRes.ok) {
      const body = await backendRes.json().catch(() => ({}))
      const message =
        backendRes.status === 401
          ? "Credenciales incorrectas."
          : body.error ?? "Error al autenticar."
      return NextResponse.json({ error: message }, { status: backendRes.status })
    }

    const { accessToken, refreshToken, user } = await backendRes.json()

    // Create dashboard session cookie (HMAC-based, compatible with middleware)
    const sessionToken = await signToken(user.email)
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS)

    // Store backend JWT tokens for use in API routes
    cookieStore.set(BACKEND_ACCESS_COOKIE, accessToken, ACCESS_COOKIE_OPTIONS)
    cookieStore.set(BACKEND_REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS)

    return NextResponse.json({ ok: true, user: { email: user.email, name: user.name } })
  } catch (err) {
    console.error("[POST /api/auth]", err)
    return NextResponse.json({ error: "Error en autenticación" }, { status: 500 })
  }
}

// DELETE /api/auth — logout
export async function DELETE() {
  const cookieStore = await cookies()

  // Revoke backend refresh token before clearing cookies
  const refreshToken = cookieStore.get(BACKEND_REFRESH_COOKIE)?.value
  if (refreshToken) {
    await revokeBackendRefreshToken(refreshToken)
  }

  cookieStore.set(COOKIE_NAME, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 })
  cookieStore.set(BACKEND_ACCESS_COOKIE, "", CLEAR_COOKIE_OPTIONS)
  cookieStore.set(BACKEND_REFRESH_COOKIE, "", CLEAR_COOKIE_OPTIONS)

  return NextResponse.json({ ok: true })
}

// GET /api/auth — verificar sesión activa
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ authenticated: false })
  const session = await verifyToken(token)
  return NextResponse.json({ authenticated: session !== null })
}
