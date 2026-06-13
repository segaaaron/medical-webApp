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

const ALLOWED_PARAMS = new Set(["status", "page", "limit"])

// GET /api/reviews — protected (admin only)
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filtered = new URLSearchParams()
  for (const [key, value] of searchParams.entries()) {
    if (ALLOWED_PARAMS.has(key)) filtered.set(key, value.slice(0, 100))
  }
  const query = filtered.toString()
  const path = query ? `/reviews?${query}` : "/reviews"
  const { data, error, status } = await backendFetch<unknown>(path, { auth: true })
  if (error) return proxyError(error, status)

  const obj = data as Record<string, unknown> | null
  const list = Array.isArray(data)
    ? data
    : Array.isArray(obj?.reviews)
      ? obj!.reviews
      : Array.isArray(obj?.data)
        ? obj!.data
        : data

  return NextResponse.json(list)
}
