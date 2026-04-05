import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL ?? "https://service.drayasminmedrano-services.cloud"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const backendUrl = `${BACKEND_URL}/uploads/${path.join("/")}`

  const res = await fetch(backendUrl, { cache: "force-cache" })

  if (!res.ok) {
    return new NextResponse(null, { status: res.status })
  }

  const contentType = res.headers.get("content-type") ?? "application/octet-stream"
  const buffer = await res.arrayBuffer()

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  })
}
