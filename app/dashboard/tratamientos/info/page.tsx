"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Check, Upload, X } from "lucide-react"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { useToast } from "@/components/dashboard/Toast"
import { resolveImageUrl } from "@/lib/image-utils"

/** Strips the `/api` proxy prefix so we always store the raw backend path. */
function toRawPath(url: string): string {
  if (url.startsWith("/api/uploads/")) return url.replace(/^\/api/, "")
  return url
}

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#b5496a] focus:ring-1 focus:ring-[#b5496a] transition-colors"

const infoSchema = Yup.object({
  label: Yup.string().default(""),
  title: Yup.string().required("El título principal es obligatorio"),
  description: Yup.string().default(""),
  descriptionHighlight: Yup.string().default(""),
  consultationTitle: Yup.string().default(""),
  consultationItems: Yup.array().of(Yup.string().defined()).default([]),
  sidebarBadge: Yup.string().default(""),
  doctorImage: Yup.string().default(""),
  ctaTitle: Yup.string().default(""),
  ctaSubtitle: Yup.string().default(""),
  priceLabel: Yup.string().default(""),
  priceDescription: Yup.string().default(""),
  buttonText: Yup.string().default(""),
  disclaimer: Yup.string().default(""),
})

type InfoValues = Yup.InferType<typeof infoSchema>

const DEFAULT: InfoValues = {
  label: "NUESTROS SERVICIOS",
  title: "Tratamientos de Medicina Estética",
  description:
    "Ofrecemos una amplia gama de tratamientos faciales y corporales con tecnología de vanguardia y los más altos estándares de seguridad médica.",
  descriptionHighlight: "tecnología de vanguardia",
  consultationTitle: "Lo Que Incluye Cada Consulta",
  consultationItems: [
    "Consulta de valoración personalizada",
    "Seguimiento post-tratamiento",
    "Tecnología de última generación",
    "Plan de tratamiento individualizado",
    "Productos de calidad certificada",
    "Atención médica especializada",
  ],
  sidebarBadge: "✨ CONSULTA DE VALORACIÓN GRATIS",
  doctorImage: "",
  ctaTitle: "Agenda tu Cita",
  ctaSubtitle: "Consulta personalizada con la Dra. Yasmin",
  priceLabel: "GRATIS",
  priceDescription: "Valoración inicial sin costo — oferta de este mes",
  buttonText: "RESERVAR MI CONSULTA",
  disclaimer: "Sin compromiso · Atención personalizada garantizada",
}

export default function TratamientosInfoPage() {
  const showToast = useToast()
  const [loading, setLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  const formik = useFormik<InfoValues>({
    initialValues: DEFAULT,
    validationSchema: infoSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const responseData = new FormData()
        responseData.append("label", values.label)
        responseData.append("title", values.title)
        responseData.append("description", values.description)
        responseData.append("descriptionHighlight", values.descriptionHighlight)
        responseData.append("consultationTitle", values.consultationTitle)
        responseData.append("consultationItems", JSON.stringify(values.consultationItems))
        responseData.append("sidebarBadge", values.sidebarBadge)
        if (imageFile) {
          responseData.append("doctorImage", imageFile)
        } else {
          responseData.append("doctorImage", "")
        }
        responseData.append("ctaTitle", values.ctaTitle)
        responseData.append("ctaSubtitle", values.ctaSubtitle)
        responseData.append("priceLabel", values.priceLabel)
        responseData.append("priceDescription", values.priceDescription)
        responseData.append("buttonText", values.buttonText)
        responseData.append("disclaimer", values.disclaimer)

        const res = await guardedFetch("/api/treatments/info", {
          method: "PUT",
          body: responseData,
        })
        if (res.ok) {
          const saved = await res.json()
          const updatedValue = saved?.value ?? {}
          const merged = { ...values, ...updatedValue }
          if (updatedValue.doctorImage) {
            merged.doctorImage = toRawPath(updatedValue.doctorImage)
            setImagePreview(resolveImageUrl(merged.doctorImage))
          }
          formik.resetForm({ values: merged })
          setImageFile(null)
          showToast("success", "¡Información actualizada exitosamente!")
        } else {
          const data = await res.json()
          showToast("error", data.error ?? "Error al guardar la información.")
        }
      } catch {
        showToast("error", "No se pudo conectar al servidor.")
      }
    },
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await guardedFetch("/api/treatments/info")
        if (res.ok) {
          const data = await res.json()
          const merged: InfoValues = { ...DEFAULT, ...data }
          merged.doctorImage = toRawPath(merged.doctorImage)
          formik.resetForm({ values: merged })
          if (merged.doctorImage) setImagePreview(resolveImageUrl(merged.doctorImage))
        }
      } catch {
        // use defaults silently
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setItem(index: number, value: string) {
    const items = [...formik.values.consultationItems]
    items[index] = value
    formik.setFieldValue("consultationItems", items)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  if (loading) {
    return <p className="text-gray-400 text-sm" role="status">Cargando información...</p>
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Info de Tratamientos</h1>
      <p className="text-sm text-gray-500 mb-6">
        Edita los textos que se muestran en la página pública de tratamientos.
      </p>

      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-6">

        {/* Hero */}
        <EditorCard title="Sección principal">
          <FormField label="Etiqueta superior (label)" htmlFor="info-label">
            <input
              id="info-label"
              className={INPUT_CLS}
              {...formik.getFieldProps("label")}
              placeholder="NUESTROS SERVICIOS"
            />
          </FormField>
          <FormField label="Título principal *" htmlFor="info-title">
            <input
              id="info-title"
              className={INPUT_CLS}
              {...formik.getFieldProps("title")}
              required
            />
            {formik.touched.title && formik.errors.title && <p className="text-xs text-red-500 mt-1">{formik.errors.title}</p>}
          </FormField>
          <FormField label="Descripción" htmlFor="info-description">
            <textarea
              id="info-description"
              className={INPUT_CLS}
              rows={3}
              {...formik.getFieldProps("description")}
            />
          </FormField>
          <FormField label="Texto resaltado dentro de la descripción" htmlFor="info-highlight">
            <input
              id="info-highlight"
              className={INPUT_CLS}
              {...formik.getFieldProps("descriptionHighlight")}
              placeholder="tecnología de vanguardia"
            />
          </FormField>
        </EditorCard>

        {/* Consulta items */}
        <EditorCard title="Lo que incluye cada consulta">
          <FormField label="Título de sección" htmlFor="info-consultation-title">
            <input
              id="info-consultation-title"
              className={INPUT_CLS}
              {...formik.getFieldProps("consultationTitle")}
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formik.values.consultationItems.map((item, i) => (
              <FormField key={i} label={`Elemento ${i + 1}`} htmlFor={`info-item-${i}`}>
                <input
                  id={`info-item-${i}`}
                  className={INPUT_CLS}
                  value={item}
                  onChange={(e) => setItem(i, e.target.value)}
                  placeholder={`Elemento ${i + 1}`}
                />
              </FormField>
            ))}
          </div>
        </EditorCard>

        {/* Card lateral */}
        <EditorCard title="Tarjeta de cita (lateral)">
          <FormField label="Badge superior" htmlFor="info-sidebar-badge">
            <input
              id="info-sidebar-badge"
              className={INPUT_CLS}
              {...formik.getFieldProps("sidebarBadge")}
            />
          </FormField>

          <FormField label="Imagen del doctor" htmlFor="info-doctor-image">
            <div className="space-y-2">
              <label
                htmlFor="info-doctor-image"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:border-[#b5496a] hover:text-[#b5496a] transition-colors"
              >
                <Upload size={15} aria-hidden="true" />
                {imagePreview ? "Cambiar imagen" : "Seleccionar imagen"} (JPG, PNG, WebP)
                <input
                  id="info-doctor-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>
              {imagePreview && (
                <div className="relative w-fit">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-32 rounded-lg object-cover border border-gray-200"
                    onError={() => setImagePreview("")}
                  />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(""); setImageFile(null); formik.setFieldValue("doctorImage", "") }}
                    className="absolute -top-2 -right-2 bg-white rounded-full border border-gray-200 p-0.5 hover:bg-red-50"
                    aria-label="Eliminar imagen"
                  >
                    <X size={12} className="text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </FormField>

          <FormField label="Título del CTA" htmlFor="info-cta-title">
            <input
              id="info-cta-title"
              className={INPUT_CLS}
              {...formik.getFieldProps("ctaTitle")}
            />
          </FormField>
          <FormField label="Subtítulo del CTA" htmlFor="info-cta-subtitle">
            <input
              id="info-cta-subtitle"
              className={INPUT_CLS}
              {...formik.getFieldProps("ctaSubtitle")}
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Precio destacado (priceLabel)" htmlFor="info-price-label">
              <input
                id="info-price-label"
                className={INPUT_CLS}
                {...formik.getFieldProps("priceLabel")}
              />
            </FormField>
            <FormField label="Descripción del precio" htmlFor="info-price-desc">
              <input
                id="info-price-desc"
                className={INPUT_CLS}
                {...formik.getFieldProps("priceDescription")}
              />
            </FormField>
          </div>
          <FormField label="Texto del botón" htmlFor="info-button-text">
            <input
              id="info-button-text"
              className={INPUT_CLS}
              {...formik.getFieldProps("buttonText")}
            />
          </FormField>
          <FormField label="Pie de tarjeta (disclaimer)" htmlFor="info-disclaimer">
            <input
              id="info-disclaimer"
              className={INPUT_CLS}
              {...formik.getFieldProps("disclaimer")}
            />
          </FormField>
        </EditorCard>

        <div>
          <button
            type="submit"
            disabled={!formik.isValid || (!formik.dirty && !imageFile) || formik.isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "#b5496a" }}
          >
            <Check size={15} aria-hidden="true" />
            {formik.isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </>
  )
}
