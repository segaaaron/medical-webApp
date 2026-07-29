"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Plus, Trash2, Pencil, X, ImageOff, ChevronLeft, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { DeleteBlogDialog } from "@/components/ui/DialogAlert"
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

export default function BlogDashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(0)

  // Paginación gobernada por el backend (page size, total y totalPages vienen del backend).
  // Si el backend aún no pagina (responde array), se muestra todo en una página: sin hardcode.
  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await guardedFetch(`/api/blog?page=${page}`)
      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json)) {
          setPosts(json)
          setTotalPages(1)
          setTotalCount(json.length)
          setPageSize(json.length)
        } else {
          const list = (json.data ?? []) as BlogPost[]
          setPosts(list)
          setTotalPages(Math.max(1, json.totalPages ?? (json.total && json.limit ? Math.ceil(json.total / json.limit) : 1)))
          setTotalCount(json.total ?? list.length)
          setPageSize(json.limit ?? list.length)
        }
      } else {
        setError("Backend no disponible. Mostrando articulos por defecto (solo lectura).")
      }
    } catch {
      setError("No se pudo conectar al servidor.")
    }
    setLoading(false)
  }, [page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga de datos en mount/cambio de página
    load()
  }, [load])

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      const res = await guardedFetch(`/api/blog/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) setError("Error al eliminar el articulo.")
    } catch {
      setError("No se pudo conectar al servidor.")
    }
    setDeleteTarget(null)
    await load()
  }

  function cancelDelete() {
    setDeleteTarget(null)
  }

  const currentPage = Math.min(page, totalPages)
  const visiblePosts = posts
  // Celdas fantasma para que la última página (más corta) conserve la altura del grid.
  const ghostCount = totalPages > 1 ? Math.max(0, pageSize - posts.length) : 0

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
          <p className="text-gray-400 text-sm" role="status" aria-live="polite">Cargando...</p>
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
                          backgroundColor: "rgba(255,255,255,0.9)",
                          color: p.published ? "#2f7a4f" : "#8a7d70",
                          letterSpacing: "0.08em",
                          backdropFilter: "blur(6px)",
                          boxShadow: "0 2px 8px rgba(58,15,32,0.2)",
                        }}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.published ? "bg-[#37a866]" : "bg-gray-400"}`} />
                        {p.published ? "Publicado" : "Borrador"}
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
                          onClick={() => setDeleteTarget(p)}
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
              {/* Celdas fantasma: replican la altura de una card (banner + cuerpo) para
                  mantener el grid constante en la última página. Auto-escalan por breakpoint. */}
              {Array.from({ length: ghostCount }).map((_, i) => (
                <div key={`ghost-${i}`} aria-hidden="true" className="flex flex-col rounded-2xl" style={{ visibility: "hidden" }}>
                  <div className="aspect-[16/10]" />
                  <div className="px-5 py-4 flex-1">
                    <p className="text-xs leading-relaxed">&nbsp;</p>
                    <p className="text-xs leading-relaxed">&nbsp;</p>
                    <p className="text-[11px] mt-3">&nbsp;</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Paginación de artículos">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:border-[var(--vintage-gold)] hover:text-[var(--vintage-gold)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    aria-current={pg === currentPage ? "page" : undefined}
                    className={`inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg text-sm font-semibold transition-colors ${
                      pg === currentPage
                        ? "text-white"
                        : "border border-gray-200 text-gray-500 hover:border-[var(--vintage-gold)] hover:text-[var(--vintage-gold)]"
                    }`}
                    style={pg === currentPage ? { backgroundColor: "var(--vintage-gold)" } : undefined}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:border-[var(--vintage-gold)] hover:text-[var(--vintage-gold)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      <DeleteBlogDialog
        open={deleteTarget !== null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        blogTitle={deleteTarget?.title ?? ""}
      />
    </>
  )
}
