import { NextResponse } from "next/server"
import { signToken, COOKIE_NAME } from "@/lib/auth/session"

const SESSION_MAX_AGE = 8 * 60 * 60 // 8 hours in seconds

// POST /api/auth — login
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const username: string = body.username ?? ""
    const password: string = body.password ?? ""

    const expectedUser = process.env.DASHBOARD_USER ?? "admin"
    const expectedPass = process.env.DASHBOARD_PASSWORD ?? "admin123"

    // Simple string comparison (credentials are low-sensitivity for a local CMS)
    if (username !== expectedUser || password !== expectedPass) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await signToken(username)

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })
    return response
  } catch (err) {
    console.error("[/api/auth POST]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE /api/auth — logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" })
  return response
}
