"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Check, Search } from "lucide-react"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { useToast } from "@/components/dashboard/Toast"
import {
  CountedField,
  SEO_DESCRIPTION_MAX,
  SEO_DESCRIPTION_RECOMMENDED,
  SEO_TITLE_MAX,
  SEO_TITLE_RECOMMENDED,
  seoDescriptionSchema,
  seoTitleSchema,
} from "@/components/dashboard/SeoFields"

/**
 * Título y descripción que Google muestra para cada página fija del sitio.
 * Vacío = la página no declara el suyo y hereda el general del sitio (Inicio:
 * se deriva de los tratamientos activos). Nunca se rellena con texto del código.
 */

const PAGES = [
  { key: "home", label: "Inicio" },
  { key: "nosotros", label: "Nosotros" },
  { key: "tratamientos", label: "Tratamientos" },
  { key: "contacto", label: "Contacto" },
  { key: "blog", label: "Blog" },
] as const

const entry = Yup.object({ title: seoTitleSchema, description: seoDescriptionSchema })
const seoSchema = Yup.object({
  home: entry,
  nosotros: entry,
  tratamientos: entry,
  contacto: entry,
  blog: entry,
})

type SeoValues = Yup.InferType<typeof seoSchema>

const EMPTY_ENTRY = { title: "", description: "" }
const EMPTY: SeoValues = {
  home: EMPTY_ENTRY,
  nosotros: EMPTY_ENTRY,
  tratamientos: EMPTY_ENTRY,
  contacto: EMPTY_ENTRY,
  blog: EMPTY_ENTRY,
}

export default function SeoPage() {
  const showToast = useToast()
  const [loading, setLoading] = useState(true)

  const formik = useFormik<SeoValues>({
    initialValues: EMPTY,
    validationSchema: seoSchema,
    onSubmit: async (values) => {
      try {
        const res = await guardedFetch("/api/seo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        if (res.ok) {
          formik.resetForm({ values })
          showToast("success", "¡SEO actualizado exitosamente!")
        } else {
          const data = await res.json()
          showToast("error", data.error ?? "Error al guardar el SEO.")
        }
      } catch {
        showToast("error", "No se pudo conectar al servidor.")
      }
    },
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await guardedFetch("/api/seo")
        if (res.ok) formik.resetForm({ values: await res.json() })
        else showToast("error", "No se pudo cargar el SEO.")
      } catch {
        showToast("error", "No se pudo conectar al servidor.")
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return null

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">SEO / Google</h1>
      <p className="text-sm text-gray-500 mb-6">
        Título y descripción que Google muestra para cada página fija. Vacío = la página usa el título y la descripción generales del sitio (en Inicio, se derivan de los tratamientos activos).
      </p>

      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-6">
        {PAGES.map(({ key, label }) => (
          <EditorCard key={key} title={label} icon={Search}>
            <CountedField
              id={`seo-${key}-title`}
              label="Título en Google"
              hint="Título completo tal como aparece en Google (sin añadir la marca)."
              max={SEO_TITLE_MAX}
              recommended={SEO_TITLE_RECOMMENDED}
              field={formik.getFieldProps(`${key}.title`)}
              error={formik.errors[key]?.title}
            />
            <CountedField
              id={`seo-${key}-description`}
              label="Descripción en Google"
              max={SEO_DESCRIPTION_MAX}
              recommended={SEO_DESCRIPTION_RECOMMENDED}
              field={formik.getFieldProps(`${key}.description`)}
              error={formik.errors[key]?.description}
              multiline
            />
          </EditorCard>
        ))}

        <div>
          <button
            type="submit"
            disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "var(--vintage-gold)" }}
          >
            <Check size={15} aria-hidden="true" />
            Guardar cambios
          </button>
        </div>
      </form>
    </>
  )
}
