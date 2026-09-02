import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import { revalidateAbout } from "@/lib/cache"
import { checkCsrfOrigin, checkWriteRateLimit, proxyError } from "@/lib/api-helpers"

// GET /api/about — public
export async function GET() {
  const { data, error, status } = await backendFetch("/about")
  if (error) return proxyError(error, status)
  if (data && typeof data === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any
    d.imageUrl = resolveImageUrl(d.imageUrl ?? d.image_url ?? d.image ?? null)
    const rawGallery = d.gallery ?? d.galleryImages ?? d.gallery_images
    if (Array.isArray(rawGallery)) {
      d.gallery = rawGallery
        .map((it: unknown) => {
          const url = typeof it === "string" ? it : (it as { url?: string; imageUrl?: string })?.url ?? (it as { imageUrl?: string })?.imageUrl
          return url ? resolveImageUrl(url) : ""
        })
        .filter(Boolean)
    }
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

    // Reenviar campos string y archivos (incluye image + galleryImage{N}); descartar files vacíos.
    for (const [key, val] of incoming.entries()) {
      if (val instanceof File) {
        if (val.size > 0) formData.append(key, val)
      } else {
        formData.append(key, val)
      }
    }

    const { data, error, status } = await backendFetch("/about", { method: "PUT", formData, auth: true })
    if (error) return proxyError(error, status)

    revalidateAbout()

    return NextResponse.json(data)
  }

  const body = await req.json()
  const { data, error, status } = await backendFetch("/about", { method: "PUT", body, auth: true })
  if (error) return proxyError(error, status)

  revalidateAbout()

  return NextResponse.json(data)
}
