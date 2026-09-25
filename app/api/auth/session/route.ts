import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { signToken, verifyToken, sessionCookieOptions, COOKIE_NAME, type Session } from "@/lib/auth/session"
import { checkCsrfOrigin } from "@/lib/api-helpers"

// Estado de la sesión del panel para `SessionKeeper` (components/dashboard).
// GET  → consulta sin renovar (pre-flight antes de guardar/subir).
// POST → renueva la ventana de inactividad, nunca más allá del límite absoluto.
// Ambos responden 401 si la sesión ya no es válida.

function body(session: Session) {
  return { idleExpiresAt: session.idleExp, absoluteExpiresAt: session.absExp, now: Date.now() }
}

async function currentSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  return token ? verifyToken(token) : null
}

const expired = () => NextResponse.json({ error: "Sesión expirada" }, { status: 401 })

export async function GET() {
  const session = await currentSession()
  return session ? NextResponse.json(body(session)) : expired()
}

export async function POST(req: NextRequest) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr

  const session = await currentSession()
  if (!session) return expired()

  const token = await signToken(session.user, session.iat)
  const renewed = await verifyToken(token)
  if (!renewed) return expired()
  ;(await cookies()).set(COOKIE_NAME, token, sessionCookieOptions(renewed))
  return NextResponse.json(body(renewed))
}
