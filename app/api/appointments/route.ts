import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { proxyError } from "@/lib/api-helpers"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// Allowed query parameters for appointments endpoint
const ALLOWED_APPOINTMENT_PARAMS = new Set(["status", "page", "limit", "date", "from", "to"])

// GET /api/appointments — protected (admin only)
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filtered = new URLSearchParams()
  for (const [key, value] of searchParams.entries()) {
    if (ALLOWED_APPOINTMENT_PARAMS.has(key)) {
      filtered.set(key, value.slice(0, 200))
    }
  }
  const query = filtered.toString()
  const path = query ? `/appointments?${query}` : "/appointments"
  const { data, error, status } = await backendFetch<unknown>(path, { auth: true })
  if (error) return proxyError(error, status)

  const list = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>)?.data)
      ? (data as Record<string, unknown>).data
      : data

  return NextResponse.json(list)
}
