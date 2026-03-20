import { NextResponse, type NextRequest } from "next/server"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page through
  if (pathname.startsWith("/dashboard/login")) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  const session = token ? await verifyToken(token) : null

  if (!session) {
    const loginUrl = new URL("/dashboard/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
