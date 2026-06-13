import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { proxyError, checkCsrfOrigin, checkWriteRateLimit } from "@/lib/api-helpers"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

const ALLOWED_STATUS = new Set(["pending", "used", "expired", "revoked"])

// GET /api/reviews/invites — admin only (list invites)
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const path =
    status && ALLOWED_STATUS.has(status)
      ? `/reviews/invites?status=${status}`
      : "/reviews/invites"

  const { data, error, status: httpStatus } = await backendFetch<unknown>(path, { auth: true })
  if (error) return proxyError(error, httpStatus)

  return NextResponse.json(data)
}

// POST /api/reviews/invites — admin only (create invite)
export async function POST(req: NextRequest) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateLimit = checkWriteRateLimit(req)
  if (rateLimit) return rateLimit
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 })
  }

  const { patient_name, patient_lastname, email, phone } = body as Record<string, unknown>

  if (
    !patient_name ||
    typeof patient_name !== "string" ||
    patient_name.trim().length < 2 ||
    patient_name.trim().length > 100
  ) {
    return NextResponse.json({ error: "Nombre inválido (2 a 100 caracteres)." }, { status: 400 })
  }
  if (
    !patient_lastname ||
    typeof patient_lastname !== "string" ||
    patient_lastname.trim().length < 2 ||
    patient_lastname.trim().length > 100
  ) {
    return NextResponse.json({ error: "Apellido inválido (2 a 100 caracteres)." }, { status: 400 })
  }
  if (email && typeof email === "string" && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Correo electrónico inválido." }, { status: 400 })
  }

  const payload = {
    patient_name: (patient_name as string).trim().slice(0, 100),
    patient_lastname: (patient_lastname as string).trim().slice(0, 100),
    ...(email && typeof email === "string" && email.trim() ? { email: (email as string).trim().slice(0, 150) } : {}),
    ...(phone && typeof phone === "string" && phone.trim() ? { phone: (phone as string).trim().slice(0, 20) } : {}),
  }

  const { data, error, status } = await backendFetch<unknown>("/reviews/invites", {
    method: "POST",
    body: payload,
    auth: true,
  })
  if (error) return proxyError(error, status)

  return NextResponse.json(data, { status: 201 })
}
