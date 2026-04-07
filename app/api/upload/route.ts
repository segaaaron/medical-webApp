import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// POST /api/upload — proxies to POST /site-content/upload-image
// Field name expected by backend: "image"
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const { data, error } = await backendFetch<{ imageUrl: string }>(
    "/site-content/upload-image",
    { method: "POST", formData, auth: true }
  )
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data)
}
