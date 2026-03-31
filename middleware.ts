import { NextRequest, NextResponse } from "next/server"

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
    const secret =
      process.env.DASHBOARD_SECRET ??
      "dev_fallback_secret_set_DASHBOARD_SECRET_in_env"

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow /dashboard/login through without auth check
  if (pathname === "/dashboard/login") {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    const loginUrl = new URL("/dashboard/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const valid = await verifyToken(token)
  if (!valid) {
    const loginUrl = new URL("/dashboard/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
