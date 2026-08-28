import { NextRequest, NextResponse } from "next/server"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"

function applySecurityHeaders(response: NextResponse, requestId?: string): NextResponse {
  if (requestId) response.headers.set("X-Request-Id", requestId)
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  // 'unsafe-eval' only in development (Next.js dev runtime needs it).
  // GA4 (googletagmanager), Meta Pixel (connect.facebook.net) and TikTok Pixel
  // (analytics.tiktok.com) need script-src + connect-src entries; pixel beacons
  // are covered by img-src https:.
  const isDev = process.env.NODE_ENV !== "production"
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://connect.facebook.net https://analytics.tiktok.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://analytics.tiktok.com https://*.tiktok.com https://*.byteoversea.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  )
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
  // crypto.randomUUID() is available globally in Edge Runtime (Web Crypto API)
  const requestId = crypto.randomUUID()

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

  let valid = false
  try {
    valid = (await verifyToken(token)) !== null
  } catch {
    valid = false
  }
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
