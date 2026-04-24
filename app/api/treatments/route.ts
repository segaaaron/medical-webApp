import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import { checkCsrfOrigin, checkWriteRateLimit } from "@/lib/api-helpers"

// Allowed query parameters for treatments endpoint
const ALLOWED_TREATMENT_PARAMS = new Set(["category", "page", "limit", "search", "active"])

// GET /api/treatments — public
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filtered = new URLSearchParams()
  for (const [key, value] of searchParams.entries()) {
    if (ALLOWED_TREATMENT_PARAMS.has(key)) {
      // Limit value length to prevent injection via query params
      filtered.set(key, value.slice(0, 200))
    }
  }
  const query = filtered.toString()
  const path = query ? `/treatments?${query}` : "/treatments"
  const { data, error } = await backendFetch<unknown[]>(path)
  if (error) return NextResponse.json({ error }, { status: 502 })

  const treatments = Array.isArray(data)
    ? data.map((t: unknown) => {
        const item = t as Record<string, unknown>
        return {
          ...item,
          imageUrl: resolveImageUrl(
            (item.imageUrl ?? item.image_url ?? item.image ?? item.coverImage) as string | null
          ),
        }
      })
    : data

  return NextResponse.json(treatments)
}

// POST /api/treatments — protected
export async function POST(req: NextRequest) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const contentType = req.headers.get("content-type") ?? ""
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData()
    const { data, error } = await backendFetch("/treatments", { method: "POST", formData, auth: true })
    if (error) return NextResponse.json({ error }, { status: 502 })
    return NextResponse.json(data, { status: 201 })
  }

  const body = await req.json()
  const { data, error } = await backendFetch("/treatments", { method: "POST", body, auth: true })
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data, { status: 201 })
}

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}
