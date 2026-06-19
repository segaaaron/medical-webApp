import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL ?? "https://service.drayasminmedrano-services.cloud"

const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_\-\.]+$/

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "video/mp4",
  "video/webm",
  "application/pdf",
])

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params

  for (const segment of path) {
    if (!SAFE_PATH_SEGMENT.test(segment) || segment === ".." || segment === ".") {
      return new NextResponse("Bad Request", { status: 400 })
    }
  }

  const backendUrl = `${BACKEND_URL}/uploads/${path.join("/")}`

  let res: Response
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    res = await fetch(backendUrl, {
      // no-store: never cache error responses; images are versioned by filename
      cache: "no-store",
      signal: controller.signal,
    })
    clearTimeout(timeout)
  } catch {
    return new NextResponse("Gateway Timeout", { status: 504 })
  }

  if (!res.ok) {
    // Return the upstream status so clients/CDN don't cache a stale error
    return new NextResponse("Not Found", { status: res.status === 404 ? 404 : 502 })
  }

  const contentType = res.headers.get("content-type")?.split(";")[0].trim() ?? ""

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return new NextResponse("Unsupported Media Type", { status: 415 })
  }

  // Stream del cuerpo (sin bufferear en memoria) → evita presión de memoria
  // con muchas imágenes/usuarios concurrentes. Cae a buffer si no hay stream.
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "X-Content-Type-Options": "nosniff",
  }
  const contentLength = res.headers.get("content-length")
  if (contentLength) headers["Content-Length"] = contentLength

  if (res.body) {
    return new NextResponse(res.body, { status: 200, headers })
  }
  return new NextResponse(await res.arrayBuffer(), { status: 200, headers })
}
