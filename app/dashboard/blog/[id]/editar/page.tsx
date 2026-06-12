"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useFormik } from "formik"
import * as Yup from "yup"
import Link from "next/link"
import { ArrowLeft, Check, Upload, X, ImageIcon } from "lucide-react"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { useToast } from "@/components/dashboard/Toast"
import { resolveImageUrl } from "@/lib/image-utils"
import RichTextEditor from "@/components/dashboard/RichTextEditor"

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[var(--vintage-gold)] focus:ring-1 focus:ring-[var(--vintage-gold)] transition-colors"

const blogSchema = Yup.object({
  title: Yup.string().required("El título es obligatorio"),
  excerpt: Yup.string().default(""),
  content: Yup.string().required("El contenido es obligatorio"),
  published: Yup.boolean().default(false),
})

type BlogValues = Yup.InferType<typeof blogSchema>

export default function EditarBlogPage() {
  const showToast = useToast()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [imageRemoved, setImageRemoved] = useState(false)

  useEffect(() => {
    return () => { if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview) }
  }, [imagePreview])
  const [formInitialValues, setFormInitialValues] = useState<BlogValues>({
    title: "", excerpt: "", content: "", published: false,
  })

  const formik = useFormik<BlogValues>({
    initialValues: formInitialValues,
    validationSchema: blogSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const fd = new FormData()
        fd.append("title", values.title)
        fd.append("excerpt", values.excerpt)
        fd.append("content", values.content)
        fd.append("published", String(values.published))
        if (imageFile) fd.append("image", imageFile)
        else if (imageRemoved) fd.append("image", "")

        const res = await guardedFetch(`/api/blog/${id}`, {
          method: "PUT",
          body: fd,
        })

        if (res.ok) {
          showToast("success", "¡Artículo actualizado exitosamente!")
          router.push("/dashboard/blog")
        } else {
          const data = await res.json()
          showToast("error", data.error ?? "Error al guardar el artículo.")
        }
      } catch {
        showToast("error", "No se pudo conectar al servidor.")
      }
    },
  })

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await guardedFetch(`/api/blog/${id}`)
        if (!res.ok) {
          showToast("error", "No se pudo cargar el artículo.")
          return
        }
        const post = await res.json()
        setFormInitialValues({
          title: post.title ?? "",
          excerpt: post.excerpt ?? "",
          content: post.content ?? "",
          published: post.published ?? false,
        })
        if (post.imageUrl) setImagePreview(resolveImageUrl(post.imageUrl))
      } catch {
        showToast("error", "No se pudo conectar al servidor.")
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return (
      <>
        <nav aria-label="Volver" className="mb-6">
          <Link
            href="/dashboard/blog"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--vintage-gold)" }}
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
          style={{ color: "var(--vintage-gold)" }}
          aria-label="Volver a la lista de articulos"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver
        </Link>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">Editar articulo</h1>
      <p className="text-sm text-gray-500 mb-6">Modifica los campos y guarda los cambios.</p>

      <form onSubmit={formik.handleSubmit} noValidate>
        <EditorCard title="Contenido del articulo">
          <FormField label="Titulo *" htmlFor="blog-title">
            <input
              id="blog-title"
              className={INPUT_CLS}
              {...formik.getFieldProps("title")}
              aria-required="true"
            />
            {formik.touched.title && formik.errors.title && <p className="text-xs text-red-500 mt-1">{formik.errors.title}</p>}
          </FormField>

          <FormField label="Extracto (resumen corto)" htmlFor="blog-excerpt">
            <input
              id="blog-excerpt"
              className={INPUT_CLS}
              {...formik.getFieldProps("excerpt")}
            />
          </FormField>

          <FormField label="Imagen de portada" htmlFor="blog-image">
            <div className="space-y-3">
              {/* Preview card */}
              <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style={{ minHeight: 180 }}>
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="w-full h-48 object-cover"
                      width={800}
                      height={192}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label
                        htmlFor="blog-image"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <Upload size={13} />
                        Cambiar
                      </label>
                      <button
                        type="button"
                        onClick={() => { setImagePreview(""); setImageFile(null); setImageRemoved(true) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 rounded-lg text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                        aria-label="Eliminar imagen"
                      >
                        <X size={13} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="blog-image"
                    className="flex flex-col items-center justify-center gap-2 h-44 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <ImageIcon size={32} className="text-gray-300" />
                    <span className="text-sm text-gray-400">Sin imagen seleccionada</span>
                    <span className="text-xs text-[var(--vintage-gold)] font-medium flex items-center gap-1">
                      <Upload size={12} /> Subir imagen
                    </span>
                  </label>
                )}
              </div>
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
                    setImageRemoved(false)
                  }
                }}
              />
              <p className="text-xs text-gray-400">Recomendado: 1200×630px. Formatos: JPG, PNG, WebP.</p>
            </div>
          </FormField>

          <FormField label="Contenido *" htmlFor="blog-content">
            <RichTextEditor
              value={formik.values.content}
              onChange={(html) => formik.setFieldValue("content", html)}
              onBlur={() => formik.setFieldTouched("content", true)}
              hasError={!!(formik.touched.content && formik.errors.content)}
            />
            {formik.touched.content && formik.errors.content && <p className="text-xs text-red-500 mt-1">{formik.errors.content}</p>}
          </FormField>

          <div className="flex items-center gap-3">
            <label htmlFor="blog-published" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                id="blog-published"
                type="checkbox"
                name="published"
                checked={formik.values.published}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="rounded accent-[var(--vintage-gold)]"
              />
              Publicar inmediatamente
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!formik.isValid || formik.isSubmitting}
              aria-label={formik.isSubmitting ? "Guardando articulo" : "Actualizar articulo"}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: "var(--vintage-gold)" }}
            >
              <Check size={15} aria-hidden="true" />
              {formik.isSubmitting ? "Guardando..." : "Actualizar"}
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
