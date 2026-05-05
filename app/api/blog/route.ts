import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import { staticBlogPosts } from "@/lib/data/blog-posts"
import { checkCsrfOrigin, checkWriteRateLimit, proxyError } from "@/lib/api-helpers"
import { logger } from "@/lib/logger"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// Allowed query parameters for blog endpoint
const ALLOWED_BLOG_PARAMS = new Set(["page", "limit", "published", "search", "category", "tag"])

// GET /api/blog — public (auth forwarded when session present, backend may return drafts for admins)
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
  const session = await getSession()
  const { data, error } = await backendFetch<unknown>(path, { auth: !!session })

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

  const rawList: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>)?.data)
      ? (data as Record<string, unknown>).data as unknown[]
      : []

  const posts = rawList.map((p: unknown) => {
    const post = p as Record<string, unknown>
    return {
      ...post,
      content: post.content ?? post.body ?? "",
      imageUrl: resolveImageUrl((post.imageUrl ?? post.image_url ?? post.image ?? post.coverImage ?? post.cover) as string | null),
    }
  })

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
  const { data, error, status } = await backendFetch("/blog", { method: "POST", formData, auth: true })
  if (error) return proxyError(error, status)
  return NextResponse.json(data, { status: 201 })
}
