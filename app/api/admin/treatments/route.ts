import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import { proxyError } from "@/lib/api-helpers"

/**
 * Superficie de administración de tratamientos.
 *
 * Misma razón que `/api/admin/blog`: la ruta pública decide qué mostrar según
 * venga token o no, así que una sesión caducada degrada el panel a visitante y
 * le oculta los tratamientos inactivos. Aquí la sesión es obligatoria y la
 * lista siempre viene completa (sin paginación ni filtros de estado).
 */
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const session = token ? await verifyToken(token) : null
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error, status } = await backendFetch<unknown>("/admin/treatments", { auth: true })
  if (error) return proxyError(error, status)

  const rawList: unknown[] = Array.isArray(data) ? data : []
  const treatments = rawList.map((t) => {
    const item = t as Record<string, unknown>
    return {
      ...item,
      imageUrl: resolveImageUrl(
        (item.imageUrl ?? item.image_url ?? item.image ?? item.coverImage) as string | null
      ),
    }
  })

  return NextResponse.json(treatments)
}
