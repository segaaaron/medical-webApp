import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { isValidId, invalidIdResponse, checkCsrfOrigin, checkWriteRateLimit, proxyError } from "@/lib/api-helpers"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// PUT /api/appointments/:id — update status (protected)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!isValidId(id)) return invalidIdResponse()

  const body = await req.json()
  const { data, error, status: putStatus } = await backendFetch(`/appointments/${id}`, { method: "PUT", body, auth: true })
  if (error) return proxyError(error, putStatus)
  return NextResponse.json(data)
}

// DELETE /api/appointments/:id — protected
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!isValidId(id)) return invalidIdResponse()

  const { error, status } = await backendFetch(`/appointments/${id}`, { method: "DELETE", auth: true })
  if (error) return proxyError(error, status)
  return new NextResponse(null, { status: 204 })
}
