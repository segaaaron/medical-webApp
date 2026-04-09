import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"

// GET /api/promo-banner — public
export async function GET() {
  const { data, error } = await backendFetch("/promo-banner")
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data)
}

// PUT /api/promo-banner — protected, multipart/form-data
export async function PUT(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const { data, error } = await backendFetch("/promo-banner", {
    method: "PUT",
    formData,
    auth: true,
  })
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data)
}
