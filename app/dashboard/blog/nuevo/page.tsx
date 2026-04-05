"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Upload, X } from "lucide-react"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"

interface BlogForm {
  title: string
  excerpt: string
  content: string
  published: boolean
}

const EMPTY: BlogForm = {
  title: "",
  excerpt: "",
  content: "",
  published: false,
}

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#b5496a] focus:ring-1 focus:ring-[#b5496a] transition-colors"

export default function NuevoBlogPage() {
  const router = useRouter()
  const [form, setForm] = useState<BlogForm>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      setError("El titulo y contenido son obligatorios.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const fd = new FormData()
      fd.append("title", form.title)
      fd.append("excerpt", form.excerpt)
      fd.append("content", form.content)
      fd.append("published", String(form.published))
      if (imageFile) fd.append("image", imageFile)

      const res = await fetch("/api/blog", {
        method: "POST",
        body: fd,
      })

      if (res.ok) {
        router.push("/dashboard/blog")
      } else {
        const data = await res.json()
        setError(data.error ?? "Error al crear el articulo.")
      }
    } catch {
      setError("No se pudo conectar al servidor.")
    } finally {
      setSaving(false)
    }
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

      <h1 className="text-2xl font-bold text-gray-800 mb-1">Nuevo articulo</h1>
      <p className="text-sm text-gray-500 mb-6">Completa los campos para crear un nuevo articulo en el blog.</p>

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
              placeholder="5 beneficios del acido hialuronico"
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
              placeholder="Un breve resumen del articulo..."
            />
          </FormField>

          <FormField label="Imagen de portada" htmlFor="blog-image">
            <div className="space-y-2">
              <label
                htmlFor="blog-image"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:border-[#b5496a] hover:text-[#b5496a] transition-colors"
              >
                <Upload size={15} aria-hidden="true" />
                Seleccionar imagen (JPG, PNG, WebP, GIF)
                <input
                  id="blog-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImageFile(file)
                      setImagePreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </label>
              {imagePreview && (
                <div className="relative w-fit">
                  <img src={imagePreview} alt="Vista previa" className="h-32 rounded-lg object-cover border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(""); setImageFile(null) }}
                    className="absolute -top-2 -right-2 bg-white rounded-full border border-gray-200 p-0.5 hover:bg-red-50"
                    aria-label="Eliminar imagen"
                  >
                    <X size={12} className="text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </FormField>

          <FormField label="Contenido *" htmlFor="blog-content">
            <textarea
              id="blog-content"
              className={INPUT_CLS}
              rows={10}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Escribe aqui el contenido del articulo..."
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
              aria-label={saving ? "Guardando articulo" : "Crear articulo"}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: "#b5496a" }}
            >
              <Check size={15} aria-hidden="true" />
              {saving ? "Guardando..." : "Crear articulo"}
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
