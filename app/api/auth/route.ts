import { NextRequest, NextResponse } from "next/server"
import { signToken, verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { cookies } from "next/headers"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60, // 8 horas
}

// POST /api/auth — login
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    const validUser = process.env.DASHBOARD_USER ?? "admin"
    const validPass = process.env.DASHBOARD_PASSWORD

    if (!validPass) {
      console.error("DASHBOARD_PASSWORD no está configurado en las variables de entorno")
      return NextResponse.json({ error: "Servidor mal configurado" }, { status: 500 })
    }

    if (username !== validUser || password !== validPass) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    const token = await signToken(username)
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[POST /api/auth]", err)
    return NextResponse.json({ error: "Error en autenticación" }, { status: 500 })
  }
}

// DELETE /api/auth — logout
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 })
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
