import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

const COOKIE_NAME = "jn_session"

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
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.DASHBOARD_SECRET
    if (!secret || secret.length < 32) return false

    const dotIndex = token.indexOf(".")
    if (dotIndex === -1) return false

    const payloadB64 = token.slice(0, dotIndex)
    const signature = token.slice(dotIndex + 1)

    const payload = atob(payloadB64)
    const expectedSig = await hmac(payload, secret)

    if (expectedSig !== signature) return false

    const [user, expStr] = payload.split(":")
    const exp = Number(expStr)
    if (!user || isNaN(exp) || Date.now() > exp) return false

    return true
  } catch {
    return false
  }
}

function applySecurityHeaders(response: NextResponse, requestId?: string): NextResponse {
  if (requestId) response.headers.set("X-Request-Id", requestId)
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    )
  }
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const requestId = randomUUID()

  // Allow /dashboard/login through without auth check
  if (pathname === "/dashboard/login") {
    return applySecurityHeaders(NextResponse.next(), requestId)
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    const loginUrl = new URL("/dashboard/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return applySecurityHeaders(NextResponse.redirect(loginUrl), requestId)
  }

  const valid = await verifyToken(token)
  if (!valid) {
    const loginUrl = new URL("/dashboard/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return applySecurityHeaders(NextResponse.redirect(loginUrl), requestId)
  }

  return applySecurityHeaders(NextResponse.next(), requestId)
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
