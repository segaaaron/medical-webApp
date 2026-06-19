import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import { checkCsrfOrigin, checkWriteRateLimit, proxyError } from "@/lib/api-helpers"

// Allowed query parameters for treatments endpoint
const ALLOWED_TREATMENT_PARAMS = new Set(["category", "page", "limit", "search", "active"])

// GET /api/treatments — public (auth forwarded when session present, backend may return all for admins)
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
  const { data, error, status } = await backendFetch<unknown>(path)
  if (error) return proxyError(error, status)

  const isPaginated =
    !!data && typeof data === "object" && !Array.isArray(data) &&
    Array.isArray((data as Record<string, unknown>).data)
  const rawList: unknown[] = Array.isArray(data)
    ? data
    : isPaginated
      ? (data as Record<string, unknown>).data as unknown[]
      : []

  const treatments = rawList.map((t: unknown) => {
    const item = t as Record<string, unknown>
    return {
      ...item,
      imageUrl: resolveImageUrl(
        (item.imageUrl ?? item.image_url ?? item.image ?? item.coverImage) as string | null
      ),
    }
  })

  // Si el backend pagina ({data,total,page,limit,totalPages}), conservar la metadata
  // para que el cliente la use; si devuelve un array suelto, mantener el contrato actual.
  if (isPaginated) {
    return NextResponse.json({ ...(data as Record<string, unknown>), data: treatments })
  }
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
    const { data, error, status: s1 } = await backendFetch("/treatments", { method: "POST", formData, auth: true })
    if (error) return proxyError(error, s1)
    return NextResponse.json(data, { status: 201 })
  }

  const body = await req.json()
  const { data, error, status: s2 } = await backendFetch("/treatments", { method: "POST", body, auth: true })
  if (error) return proxyError(error, s2)
  return NextResponse.json(data, { status: 201 })
}

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}
