import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { staticBlogPosts } from "@/lib/data/blog-posts"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/blog — public, falls back to static posts if backend unavailable
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.toString()
  const path = query ? `/blog?${query}` : "/blog"
  const { data, error } = await backendFetch<unknown[]>(path)

  if (error) {
    console.warn("[GET /api/blog] Backend unavailable, serving static posts:", error)
    return NextResponse.json(
      staticBlogPosts.map((p) => ({
        ...p,
        published: true,
        content: p.content,
        createdAt: p.publishedAt,
      }))
    )
  }

  // Normalize: backend may use "body" instead of "content"
  const posts = Array.isArray(data)
    ? data.map((p: unknown) => {
        const post = p as Record<string, unknown>
        return {
          ...post,
          content: post.content ?? post.body ?? "",
        }
      })
    : data

  return NextResponse.json(posts)
}

// POST /api/blog — protected
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { data, error } = await backendFetch("/blog", { method: "POST", body, auth: true })
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data, { status: 201 })
}
