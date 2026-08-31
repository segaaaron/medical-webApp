import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import { proxyError } from "@/lib/api-helpers"

/**
 * Superficie de administración del blog.
 *
 * `/api/blog` sirve al sitio público y al panel a la vez y decide qué devolver
 * según llegue token o no — sin `auth: true` el backend responde como visitante
 * y los borradores desaparecen del dashboard sin ningún error visible. Aquí la
 * sesión es obligatoria: o se devuelve todo, o un 401 explícito.
 */
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const session = token ? await verifyToken(token) : null
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error, status } = await backendFetch<unknown>("/admin/blog", { auth: true })
  if (error) return proxyError(error, status)

  const rawList: unknown[] = Array.isArray(data) ? data : []
  const posts = rawList.map((p) => {
    const post = p as Record<string, unknown>
    return {
      ...post,
      content: post.content ?? post.body ?? "",
      imageUrl: resolveImageUrl(
        (post.imageUrl ?? post.image_url ?? post.image ?? post.coverImage ?? post.cover) as string | null
      ),
    }
  })

  return NextResponse.json(posts)
}
