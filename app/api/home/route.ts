import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { revalidateHome } from "@/lib/cache"
import { checkCsrfOrigin, checkWriteRateLimit, proxyError } from "@/lib/api-helpers"

// GET /api/home — public
export async function GET() {
  const { data, error, status } = await backendFetch("/home")
  if (error) return proxyError(error, status)
  return NextResponse.json(data)
}

// PUT /api/home — protected, JSON
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

  const body = await req.json()
  const { data, error, status } = await backendFetch("/home", { method: "PUT", body, auth: true })
  if (error) return proxyError(error, status)

  revalidateHome()

  return NextResponse.json(data)
}
