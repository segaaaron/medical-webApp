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

  // Try fetching by id directly
  const { data, error } = await backendFetch<Record<string, unknown>>(`/blog/${id}`)

  let post: Record<string, unknown> | null = null

  if (!error && data) {
    post = data as Record<string, unknown>
  } else {
    // Fallback: fetch the list and find by id
    const { data: listData } = await backendFetch<unknown>("/blog")
    const list: unknown[] = Array.isArray(listData)
      ? listData
      : Array.isArray((listData as Record<string, unknown>)?.data)
        ? (listData as Record<string, unknown>).data as unknown[]
        : []
    const found = list.find((p) => (p as Record<string, unknown>).id === id)
    if (found) post = found as Record<string, unknown>
  }

  if (!post) return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })

  return NextResponse.json({
    ...post,
    content: post.content ?? post.body ?? "",
    imageUrl: resolveImageUrl((post.imageUrl ?? post.image_url ?? post.image ?? post.coverImage ?? post.cover) as string | null),
  })
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

  const formData = await req.formData()
  const { data, error, status: putStatus } = await backendFetch(`/blog/${id}`, { method: "PUT", formData, auth: true })
  if (error) return proxyError(error, putStatus)
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

  const { error, status } = await backendFetch(`/blog/${id}`, { method: "DELETE", auth: true })
  if (error) return proxyError(error, status)
  return new NextResponse(null, { status: 204 })
}
