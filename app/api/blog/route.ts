import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import { staticBlogPosts } from "@/lib/data/blog-posts"
import { checkCsrfOrigin, checkWriteRateLimit } from "@/lib/api-helpers"
import { logger } from "@/lib/logger"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// Allowed query parameters for blog endpoint
const ALLOWED_BLOG_PARAMS = new Set(["page", "limit", "published", "search", "category", "tag"])

// GET /api/blog — public, falls back to static posts if backend unavailable
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filtered = new URLSearchParams()
  for (const [key, value] of searchParams.entries()) {
    if (ALLOWED_BLOG_PARAMS.has(key)) {
      filtered.set(key, value.slice(0, 200))
    }
  }
  const query = filtered.toString()
  const path = query ? `/blog?${query}` : "/blog"
  const { data, error } = await backendFetch<unknown[]>(path)

  if (error) {
    logger.warn("backend.unavailable", { endpoint: "/api/blog", detail: error })
    return NextResponse.json(
      staticBlogPosts.map((p) => ({
        ...p,
        published: true,
        content: p.content,
        createdAt: p.publishedAt,
      }))
    )
  }

  // Normalize field names: backend may use different keys than the frontend expects
  const posts = Array.isArray(data)
    ? data.map((p: unknown) => {
        const post = p as Record<string, unknown>
        return {
          ...post,
          content: post.content ?? post.body ?? "",
          imageUrl: resolveImageUrl((post.imageUrl ?? post.image_url ?? post.image ?? post.coverImage ?? post.cover) as string | null),
        }
      })
    : data

  return NextResponse.json(posts)
}

// POST /api/blog — protected
export async function POST(req: NextRequest) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const { data, error } = await backendFetch("/blog", { method: "POST", formData, auth: true })
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data, { status: 201 })
}
