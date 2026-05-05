import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { checkCsrfOrigin, checkWriteRateLimit, proxyError } from "@/lib/api-helpers"

// GET /api/contact — public
export async function GET() {
  const { data, error, status } = await backendFetch("/contact")
  if (error) return proxyError(error, status)
  return NextResponse.json(data)
}

// PUT /api/contact — protected
export async function PUT(req: NextRequest) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { data, error, status } = await backendFetch("/contact", { method: "PUT", body, auth: true })
  if (error) return proxyError(error, status)
  return NextResponse.json(data)
}
