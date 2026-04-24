import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { isValidId, invalidIdResponse, checkCsrfOrigin, checkWriteRateLimit } from "@/lib/api-helpers"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isValidId(id)) return invalidIdResponse()

  const { data, error } = await backendFetch(`/treatments/${id}`)

  if (!error && data) return NextResponse.json(data)

  // Fallback: fetch the list and find by id
  const { data: list } = await backendFetch<unknown[]>("/treatments")
  if (Array.isArray(list)) {
    const found = list.find((t) => (t as Record<string, unknown>).id === id)
    if (found) return NextResponse.json(found)
  }

  return NextResponse.json({ error: "Treatment not found" }, { status: 404 })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!isValidId(id)) return invalidIdResponse()

  const contentType = req.headers.get("content-type") ?? ""
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData()
    const { data, error } = await backendFetch(`/treatments/${id}`, { method: "PUT", formData, auth: true })
    if (error) return NextResponse.json({ error }, { status: 502 })
    return NextResponse.json(data)
  }

  const body = await req.json()
  const { data, error } = await backendFetch(`/treatments/${id}`, { method: "PUT", body, auth: true })
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!isValidId(id)) return invalidIdResponse()

  const { error } = await backendFetch(`/treatments/${id}`, { method: "DELETE", auth: true })
  if (error) return NextResponse.json({ error }, { status: 502 })
  return new NextResponse(null, { status: 204 })
}
