import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import { isValidId, invalidIdResponse, checkCsrfOrigin, checkWriteRateLimit, proxyError } from "@/lib/api-helpers"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isValidId(id)) return invalidIdResponse()

  const session = await getSession()
  const useAuth = !!session
  const { data, error } = await backendFetch<Record<string, unknown>>(`/treatments/${id}`, { auth: useAuth })

  function normalize(t: Record<string, unknown>) {
    return {
      ...t,
      imageUrl: resolveImageUrl(
        (t.imageUrl ?? t.image_url ?? t.image ?? t.coverImage) as string | null
      ),
    }
  }

  if (!error && data) return NextResponse.json(normalize(data))

  // Fallback: fetch the list and find by id
  const { data: listData } = await backendFetch<unknown>("/treatments", { auth: useAuth })
  const list: unknown[] = Array.isArray(listData)
    ? listData
    : Array.isArray((listData as Record<string, unknown>)?.data)
      ? (listData as Record<string, unknown>).data as unknown[]
      : []
  const found = list.find((t) => (t as Record<string, unknown>).id === id)
  if (found) return NextResponse.json(normalize(found as Record<string, unknown>))

  return NextResponse.json({ error: "Tratamiento no encontrado" }, { status: 404 })
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
    const { data, error, status: s1 } = await backendFetch(`/treatments/${id}`, { method: "PUT", formData, auth: true })
    if (error) return proxyError(error, s1)
    return NextResponse.json(data)
  }

  const body = await req.json()
  const { data, error, status: s2 } = await backendFetch(`/treatments/${id}`, { method: "PUT", body, auth: true })
  if (error) return proxyError(error, s2)
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

  const { error, status } = await backendFetch(`/treatments/${id}`, { method: "DELETE", auth: true })
  if (error) return proxyError(error, status)
  return new NextResponse(null, { status: 204 })
}
