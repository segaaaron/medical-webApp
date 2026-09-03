"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Plus, Trash2, Pencil, X, ImageOff } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { DashboardPagination } from "@/components/dashboard/DashboardPagination"
import { useConfirm } from "@/components/dashboard/ConfirmDialog"
import { resolveImageUrl } from "@/lib/image-utils"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  imageUrl: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
}

/** Convierte HTML enriquecido en texto plano para el preview. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })
}

/** Tamaño de página del panel. La lista llega completa; paginar es presentación. */
const PAGE_SIZE = 20

export default function BlogDashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const confirm = useConfirm()
  const [page, setPage] = useState(1)

  /**
   * Lista completa desde la superficie de administración.
   *
   * Antes pedía `/api/blog?page=N`, la misma ruta que sirve al sitio público:
   * esa ruta no reenvía el token, así que el backend respondía como visitante y
   * los borradores no aparecían en el panel — sin error, simplemente faltaban.
   * `/api/admin/blog` exige sesión y devuelve todo; paginar es cosa de la vista.
   */
  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await guardedFetch("/api/admin/blog")
      if (res.ok) {
        const json = await res.json()
        setPosts(Array.isArray(json) ? json : [])
      } else {
        setError("No se pudieron cargar los articulos.")
      }
    } catch {
      setError("No se pudo conectar al servidor.")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga de datos en mount
    load()
  }, [load])

  async function handleDelete(post: BlogPost) {
    const ok = await confirm({
      title: "¿Eliminar artículo?",
      description: `Se borrará "${post.title}" de forma permanente. Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar artículo",
    })
    if (!ok) return
    try {
      const res = await guardedFetch(`/api/blog/${post.id}`, { method: "DELETE" })
      if (!res.ok) setError("Error al eliminar el articulo.")
    } catch {
      setError("No se pudo conectar al servidor.")
    }
    await load()
  }

  const totalCount = posts.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visiblePosts = posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <>
      <PageHeader
        title="Blog"
        description="Crea y gestiona los articulos del blog."
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center justify-between" role="alert">
          {error}
          <button onClick={() => setError("")} aria-label="Cerrar mensaje de error"><X size={14} aria-hidden="true" /></button>
        </div>
      )}

      {/* List */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <p className="text-sm text-gray-500">
            {totalCount} artículo{totalCount === 1 ? "" : "s"}
            {totalPages > 1 && <span className="text-gray-400"> · página {currentPage} de {totalPages}</span>}
          </p>
          <Link
            href="/dashboard/blog/nuevo"
            aria-label="Crear nuevo articulo"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--vintage-gold)" }}
          >
            <Plus size={15} aria-hidden="true" />
            Nuevo artículo
          </Link>
        </div>

        {loading && posts.length === 0 ? (
          null
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p className="text-gray-400 text-sm">No hay artículos. Crea el primero.</p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-5 transition-opacity duration-200"
              style={{ opacity: loading ? 0.6 : 1 }}
              aria-busy={loading}
            >
              {visiblePosts.map((p) => {
                const preview = p.excerpt?.trim() || (p.content ? stripHtml(p.content) : "")
                return (
                  <div
                    key={p.id}
                    className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[rgba(184,151,59,0.18)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Banner */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- imagen subida desde CMS (host arbitrario, admin-only): next/image rompería por remotePattern no configurado
                        <img
                          src={resolveImageUrl(p.imageUrl)}
                          alt={p.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ background: "linear-gradient(150deg, var(--primary-darker, #5c1f35) 0%, var(--primary-darkest, #3a0f20) 100%)" }}
                        >
                          <ImageOff size={26} style={{ color: "rgba(184,151,59,0.5)" }} />
                        </div>
                      )}

                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "linear-gradient(to top, rgba(58,15,32,0.92) 0%, rgba(58,15,32,0.35) 38%, rgba(58,15,32,0) 65%)" }}
                        aria-hidden="true"
                      />

                      {/* Estado */}
                      <span
                        className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                        style={{
                          // Fondo semántico: verde = en la web, gris cálido = todavía no. El
                          // gris no compite con el dorado de los botones de acción.
                          backgroundColor: p.published ? "#1f7a52" : "#6f635a",
                          color: "#fff",
                          letterSpacing: "0.08em",
                          boxShadow: "0 2px 8px rgba(58,15,32,0.25)",
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.85)" }} />
                        {p.published ? "Publicado" : "Sin publicar"}
                      </span>

                      {/* Acciones */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Link
                          href={`/dashboard/blog/${p.id}/editar`}
                          aria-label={`Editar "${p.title}"`}
                          className="flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-bold text-white hover:brightness-110 transition-[filter,box-shadow]"
                          style={{ backgroundColor: "var(--vintage-gold)", boxShadow: "0 4px 14px rgba(58,15,32,0.35)" }}
                        >
                          <Pencil size={14} aria-hidden="true" />
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          aria-label={`Eliminar "${p.title}"`}
                          className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:scale-105 transition-transform"
                          style={{ backgroundColor: "#d1455f", boxShadow: "0 4px 14px rgba(58,15,32,0.35)" }}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>

                      {/* Título */}
                      <div className="absolute inset-x-0 bottom-0 p-4 pt-8">
                        <h3
                          className="text-white text-lg leading-tight line-clamp-2"
                          style={{ fontFamily: "var(--font-heading, Georgia, serif)", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
                        >
                          {p.title}
                        </h3>
                      </div>
                    </div>

                    {/* Cuerpo */}
                    <div className="px-5 py-4 flex-1 flex flex-col">
                      {preview ? (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{preview}</p>
                      ) : (
                        <p className="text-xs text-gray-300 italic">Sin extracto</p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-3" style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>
                        {formatDate(p.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <DashboardPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              label="Paginación de artículos"
            />
          </>
        )}
      </div>


    </>
  )
}
