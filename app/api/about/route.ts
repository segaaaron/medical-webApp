import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch, resolveImageUrl } from "@/lib/backend-client"

// GET /api/about — public
export async function GET() {
  const { data, error } = await backendFetch("/about")
  if (error) return NextResponse.json({ error }, { status: 502 })
  if (data && typeof data === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any
    d.imageUrl = resolveImageUrl(d.imageUrl ?? d.image_url ?? d.image ?? null)
  }
  return NextResponse.json(data)
}

// PUT /api/about — protected (multipart/form-data or JSON)
export async function PUT(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !verifyToken(token)) {
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

    const { data, error } = await backendFetch("/about", { method: "PUT", formData, auth: true })
    if (error) return NextResponse.json({ error }, { status: 502 })
    return NextResponse.json(data)
  }

  const body = await req.json()
  const { data, error } = await backendFetch("/about", { method: "PUT", body, auth: true })
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data)
}
