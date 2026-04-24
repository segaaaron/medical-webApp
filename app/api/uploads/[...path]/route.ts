import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL ?? "https://service.drayasminmedrano-services.cloud"

// Only allow safe filename characters — no path traversal, no absolute paths
const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_\-\.]+$/

// Allowed MIME types for uploaded assets
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

  // Validate every path segment to prevent traversal attacks
  for (const segment of path) {
    if (!SAFE_PATH_SEGMENT.test(segment) || segment === ".." || segment === ".") {
      return new NextResponse(null, { status: 400 })
    }
  }

  const backendUrl = `${BACKEND_URL}/uploads/${path.join("/")}`

  const res = await fetch(backendUrl, { cache: "force-cache" })

  if (!res.ok) {
    return new NextResponse(null, { status: res.status })
  }

  const contentType = res.headers.get("content-type")?.split(";")[0].trim() ?? ""

  // Reject responses with disallowed content types to prevent content-sniffing attacks
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return new NextResponse(null, { status: 415 })
  }

  const buffer = await res.arrayBuffer()

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // Reduced cache TTL — not immutable to allow future revocation
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
