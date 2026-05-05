"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Trash2, Pencil, X, ImageIcon } from "lucide-react"
import { useRole } from "@/lib/hooks/use-role"
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

export default function BlogDashboardPage() {
  const role = useRole()
  const isAdmin = role === "ADMIN" || role === null
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)

  async function load() {
    setLoading(true)
    setError("")
    try {
      const res = await guardedFetch("/api/blog")
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      } else {
        setError("Backend no disponible. Mostrando articulos por defecto (solo lectura).")
      }
    } catch {
      setError("No se pudo conectar al servidor.")
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

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
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{posts.length} articulo(s)</p>
          {isAdmin && (
            <Link
              href="/dashboard/blog/nuevo"
              aria-label="Crear nuevo articulo"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#b5496a" }}
            >
              <Plus size={15} aria-hidden="true" />
              Nuevo articulo
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm" role="status" aria-live="polite">Cargando...</p>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p className="text-gray-400 text-sm">No hay articulos. Crea el primero.</p>
          </div>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 pr-4 overflow-hidden">
              {/* Image preview */}
              <div className="w-24 h-20 shrink-0 bg-gray-100 overflow-hidden">
                {p.imageUrl ? (
                  <img
                    src={resolveImageUrl(p.imageUrl)}
                    alt={p.title}
                    width={96}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={20} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800 text-sm truncate">{p.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${p.published ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {p.published ? "Publicado" : "Borrador"}
                  </span>
                </div>
                {p.excerpt && <p className="text-xs text-gray-500 truncate">{p.excerpt}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString("es-BO")}</p>
              </div>

              {/* Actions */}
              {isAdmin && (
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/dashboard/blog/${p.id}/editar`}
                    aria-label={`Editar "${p.title}"`}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-[#b5496a]/50 hover:text-[#b5496a] transition-colors"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    aria-label={`Eliminar "${p.title}"`}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          ))
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
