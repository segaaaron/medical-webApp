import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { DEFAULTS } from "@/lib/store/content-store"
import type { ContentStore, ContentOverride } from "@/types/content"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

/**
 * Merge: backend partial overrides on top of local DEFAULTS.
 * This guarantees every field exists even if the backend only stores a subset.
 */
function mergeWithDefaults(override: ContentOverride | null): ContentStore {
  if (!override) return DEFAULTS
  return { ...DEFAULTS, ...override } as ContentStore
}

// GET /api/content — public
export async function GET() {
  const { data, error } = await backendFetch<ContentOverride>("/content")

  // If backend is unreachable or returns error, serve DEFAULTS so the
  // dashboard always renders the forms and the public site keeps working.
  if (error) {
    console.warn("[GET /api/content] Backend unavailable, serving defaults:", error)
    return NextResponse.json(DEFAULTS)
  }

  return NextResponse.json(mergeWithDefaults(data))
}

// POST /api/content — protected
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { data, error } = await backendFetch("/content", { method: "POST", body, auth: true })
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data ?? { ok: true })
}
