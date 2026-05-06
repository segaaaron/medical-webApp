import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import { checkCsrfOrigin, checkWriteRateLimit, proxyError } from "@/lib/api-helpers"

// GET /api/about — public
export async function GET() {
  const { data, error, status } = await backendFetch("/about")
  if (error) return proxyError(error, status)
  if (data && typeof data === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any
    d.imageUrl = resolveImageUrl(d.imageUrl ?? d.image_url ?? d.image ?? null)
  }
  return NextResponse.json(data)
}

// PUT /api/about — protected (multipart/form-data or JSON)
export async function PUT(req: NextRequest) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const contentType = req.headers.get("content-type") ?? ""

  if (contentType.includes("multipart/form-data")) {
    const incoming = await req.formData()
    const formData = new FormData()

    for (const [key, val] of incoming.entries()) {
      if (key === "image") continue
      formData.append(key, val as string)
    }

    const imageEntry = incoming.get("image")
    if (imageEntry && imageEntry instanceof File && imageEntry.size > 0) {
      formData.append("image", imageEntry)
    }

    const { data, error, status } = await backendFetch("/about", { method: "PUT", formData, auth: true })
    if (error) return proxyError(error, status)
    return NextResponse.json(data)
  }

  const body = await req.json()
  const { data, error, status } = await backendFetch("/about", { method: "PUT", body, auth: true })
  if (error) return proxyError(error, status)
  return NextResponse.json(data)
}
