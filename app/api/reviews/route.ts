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

const ALLOWED_PARAMS = new Set(["status", "page", "limit"])

// GET /api/reviews — protected (admin only)
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filtered = new URLSearchParams()
  for (const [key, value] of searchParams.entries()) {
    if (ALLOWED_PARAMS.has(key)) filtered.set(key, value.slice(0, 100))
  }
  const query = filtered.toString()
  const path = query ? `/reviews?${query}` : "/reviews"
  const { data, error, status } = await backendFetch<unknown>(path, { auth: true })
  if (error) return proxyError(error, status)

  const list = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>)?.data)
      ? (data as Record<string, unknown>).data
      : data

  return NextResponse.json(list)
}

// POST /api/reviews — public (patient submits review)
export async function POST(req: NextRequest) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateLimit = checkWriteRateLimit(req)
  if (rateLimit) return rateLimit

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 })
  }

  const { patient_name, treatment, body: reviewBody, rating } = body as Record<string, unknown>

  if (!patient_name || typeof patient_name !== "string" || patient_name.trim().length < 2) {
    return NextResponse.json({ error: "Nombre inválido." }, { status: 400 })
  }
  if (!reviewBody || typeof reviewBody !== "string" || reviewBody.trim().length < 20) {
    return NextResponse.json({ error: "La reseña debe tener al menos 20 caracteres." }, { status: 400 })
  }
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Calificación inválida." }, { status: 400 })
  }

  const payload = {
    patient_name: (patient_name as string).trim().slice(0, 100),
    body: (reviewBody as string).trim().slice(0, 800),
    rating: Math.round(rating as number),
    ...(treatment && typeof treatment === "string" ? { treatment: treatment.trim().slice(0, 150) } : {}),
  }

  const { data, error, status } = await backendFetch<unknown>("/reviews", {
    method: "POST",
    body: payload,
  })
  if (error) return proxyError(error, status)

  return NextResponse.json(data, { status: 201 })
}
