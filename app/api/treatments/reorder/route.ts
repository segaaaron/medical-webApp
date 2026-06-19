import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { checkCsrfOrigin, checkWriteRateLimit, proxyError } from "@/lib/api-helpers"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// PATCH /api/treatments/reorder
// Body: [{ id: string, order: number }, ...]
export async function PATCH(req: NextRequest) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr

  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  if (!Array.isArray(body) || body.some((item) => typeof item.id !== "string" || typeof item.order !== "number")) {
    return NextResponse.json({ error: "Invalid body: expected [{ id, order }]" }, { status: 400 })
  }

  const { data, error, status } = await backendFetch("/treatments/reorder", {
    method: "PATCH",
    body,
    auth: true,
  })

  if (error) return proxyError(error, status)

  // Refrescar las páginas públicas que dependen del orden (listado + home)
  revalidatePath("/tratamientos")
  revalidatePath("/")

  return NextResponse.json(data ?? { ok: true })
}
