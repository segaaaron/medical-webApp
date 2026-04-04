"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"

interface BlogForm {
  title: string
  excerpt: string
  content: string
  imageUrl: string
  published: boolean
}

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#b5496a] focus:ring-1 focus:ring-[#b5496a] transition-colors"

export default function EditarBlogPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState<BlogForm>({ title: "", excerpt: "", content: "", imageUrl: "", published: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch("/api/blog")
        if (!res.ok) {
          setError("No se pudo cargar el articulo.")
          setLoading(false)
          return
        }
        const posts = await res.json()
        console.log("SERVICE BLOG DATA ===>", posts)

        const post = posts.find((p: { id: string }) => p.id === id)
        if (!post) {
          setError("Articulo no encontrado.")
          setLoading(false)
          return
        }
        setForm({
          title: post.title,
          excerpt: post.excerpt ?? "",
          content: post.content ?? post.body ?? "",
          imageUrl: post.imageUrl ?? "",
          published: post.published,
        })
      } catch {
        setError("No se pudo conectar al servidor.")
      }
      setLoading(false)
    }
    fetchPost()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      setError("El titulo y contenido son obligatorios.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        router.push("/dashboard/blog")
      } else {
        const data = await res.json()
        setError(data.error ?? "Error al guardar el articulo.")
      }
    } catch {
      setError("No se pudo conectar al servidor.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <nav aria-label="Volver" className="mb-6">
          <Link
            href="/dashboard/blog"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "#b5496a" }}
            aria-label="Volver a la lista de articulos"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Volver
          </Link>
        </nav>
        <p className="text-gray-400 text-sm" role="status" aria-live="polite">Cargando articulo...</p>
      </>
    )
  }

  return (
    <>
      <nav aria-label="Volver" className="mb-6">
        <Link
          href="/dashboard/blog"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "#b5496a" }}
          aria-label="Volver a la lista de articulos"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver
        </Link>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">Editar articulo</h1>
      <p className="text-sm text-gray-500 mb-6">Modifica los campos y guarda los cambios.</p>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <EditorCard title="Contenido del articulo">
          <FormField label="Titulo *" htmlFor="blog-title">
            <input
              id="blog-title"
              className={INPUT_CLS}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              aria-required="true"
            />
          </FormField>

          <FormField label="Extracto (resumen corto)" htmlFor="blog-excerpt">
            <input
              id="blog-excerpt"
              className={INPUT_CLS}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </FormField>

          <FormField label="URL de imagen de portada" htmlFor="blog-image">
            <input
              id="blog-image"
              className={INPUT_CLS}
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
              type="url"
            />
          </FormField>

          <FormField label="Contenido *" htmlFor="blog-content">
            <textarea
              id="blog-content"
              className={INPUT_CLS}
              rows={10}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              aria-required="true"
            />
          </FormField>

          <div className="flex items-center gap-3">
            <label htmlFor="blog-published" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                id="blog-published"
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded accent-[#b5496a]"
              />
              Publicar inmediatamente
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              aria-label={saving ? "Guardando articulo" : "Actualizar articulo"}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: "#b5496a" }}
            >
              <Check size={15} aria-hidden="true" />
              {saving ? "Guardando..." : "Actualizar"}
            </button>
            <Link
              href="/dashboard/blog"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </EditorCard>
      </form>
    </>
  )
}
