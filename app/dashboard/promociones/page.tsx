"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Tag, Image as ImageIcon, MessageCircle, ToggleLeft, ToggleRight } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { SaveBar } from "@/components/dashboard/SaveBar"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { ImageDropzone } from "@/components/ui/ImageDropzone"
import { useToast } from "@/components/dashboard/Toast"
import { resolveImageUrl } from "@/lib/image-utils"

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[var(--vintage-gold)] focus:ring-1 focus:ring-[var(--vintage-gold)] transition-colors"

const INPUT_ERROR_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-red-400 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"

interface PromoBannerForm {
  tag: string
  badges: string
  title: string
  highlightedText: string
  description: string
  doctorName: string
  location: string
  whatsappText: string
  whatsappUrl: string
  dismissText: string
  imageUrl: string
  active: boolean
}

const EMPTY: PromoBannerForm = {
  tag: "",
  badges: "",
  title: "",
  highlightedText: "",
  description: "",
  doctorName: "",
  location: "",
  whatsappText: "",
  whatsappUrl: "",
  dismissText: "",
  imageUrl: "",
  active: true,
}

const promoBannerSchema = Yup.object({
  tag: Yup.string().required("El nombre / etiqueta es obligatorio"),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackend(raw: any): PromoBannerForm {
  return {
    tag: raw.tag ?? "",
    badges: raw.badges ?? "",
    title: raw.title ?? "",
    highlightedText: raw.highlightedText ?? "",
    description: raw.description ?? "",
    doctorName: raw.doctorName ?? "",
    location: raw.location ?? "",
    whatsappText: raw.whatsappText ?? "",
    whatsappUrl: raw.whatsappUrl ?? "",
    dismissText: raw.dismissText ?? "",
    imageUrl: raw.imageUrl ?? "",
    active: raw.active ?? true,
  }
}

export default function PromocionesPage() {
  const showToast = useToast()
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const formik = useFormik<PromoBannerForm>({
    initialValues: EMPTY,
    validationSchema: promoBannerSchema,
    validateOnMount: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const fd = new FormData()
        Object.entries(values).forEach(([key, val]) => {
          if (key === "imageUrl") return
          fd.append(key, String(val))
        })
        if (imageFile) {
          fd.append("image", imageFile)
        }

        const res = await guardedFetch("/api/promo-banner", { method: "PUT", body: fd })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        if (updated && !updated.error) formik.resetForm({ values: fromBackend(updated) })
        setImageFile(null)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        showToast("success", "¡Promoción guardada exitosamente!")
      } catch {
        showToast("error", "No se pudo guardar. Intenta de nuevo.")
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    fetch("/api/promo-banner")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          formik.resetForm({ values: fromBackend(data) })
          if (data.imageUrl) setImagePreview(resolveImageUrl(data.imageUrl))
        }
      })
      .catch(() => {
        showToast("error", "No se pudo conectar al servidor.")
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function inputCls(field: keyof PromoBannerForm) {
    return formik.touched[field] && formik.errors[field] ? INPUT_ERROR_CLS : INPUT_CLS
  }

  if (loading) return null

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <PageHeader
        title="Promociones"
        description="Edita el banner de promoción que aparece en el sitio web."
      />

      <div className="flex flex-col gap-6">
        {/* Identificación */}
        <EditorCard title="Nombre de la Promoción" icon={Tag} hint="Etiqueta principal que identifica la promoción">
          <div className="flex flex-col gap-4">
            <FormField label={<>Nombre / Etiqueta <span className="text-red-500">*</span></>} htmlFor="tag">
              <input
                id="tag"
                className={inputCls("tag")}
                {...formik.getFieldProps("tag")}
                placeholder='Ej: "PROMOCIÓN ESPECIAL · MEDSKIN"'
              />
              {formik.touched.tag && formik.errors.tag && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.tag}</p>
              )}
            </FormField>

            <FormField label="Tags de oferta (separados por coma)" htmlFor="badges">
              <input
                id="badges"
                className={inputCls("badges")}
                {...formik.getFieldProps("badges")}
                placeholder="Ej: 10% DESCUENTO, OFERTA DEL MES, CUPOS LIMITADOS"
              />
              <p className="text-xs text-gray-400 mt-1">Se muestran como chips dorados en el banner. Déjalo vacío para no mostrar ninguno.</p>
            </FormField>

            {/* Publicar banner */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Publicar banner</p>
                <p className="text-xs text-gray-400">Si está publicado, el banner se muestra en la web; si no, queda oculto.</p>
              </div>
              <button
                type="button"
                onClick={() => formik.setFieldValue("active", !formik.values.active)}
                aria-pressed={formik.values.active}
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: formik.values.active ? "var(--vintage-gold)" : "#9ca3af" }}
              >
                {formik.values.active ? (
                  <>
                    <ToggleRight size={22} />
                    Publicado
                  </>
                ) : (
                  <>
                    <ToggleLeft size={22} />
                    No publicado
                  </>
                )}
              </button>
            </div>
          </div>
        </EditorCard>

        {/* Contenido del banner */}
        <EditorCard title="Contenido del Banner">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Título principal" htmlFor="title">
                <input
                  id="title"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("title")}
                  placeholder='Ej: "Biorevitalización con"'
                />
              </FormField>
              <FormField label="Texto resaltado" htmlFor="highlightedText">
                <input
                  id="highlightedText"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("highlightedText")}
                  placeholder='Ej: "NCTF 135 HA"'
                />
              </FormField>
            </div>
            <FormField label="Descripción" htmlFor="description">
              <textarea
                id="description"
                className={INPUT_CLS}
                rows={3}
                {...formik.getFieldProps("description")}
                placeholder="Renueva e hidrata tu piel profundamente..."
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Nombre del doctor" htmlFor="doctorName">
                <input
                  id="doctorName"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("doctorName")}
                  placeholder="Dra. Yasmin Medrano Avila"
                />
              </FormField>
              <FormField label="Ubicación" htmlFor="location">
                <input
                  id="location"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("location")}
                  placeholder="Ciudad Cochabamba"
                />
              </FormField>
            </div>
          </div>
        </EditorCard>

        {/* WhatsApp y cierre */}
        <EditorCard title="Botones" icon={MessageCircle} hint="Configuración de los botones del banner">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Texto botón WhatsApp" htmlFor="whatsappText">
                <input
                  id="whatsappText"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("whatsappText")}
                  placeholder="RESERVAR POR WHATSAPP"
                />
              </FormField>
              <FormField label="URL de WhatsApp" htmlFor="whatsappUrl">
                <input
                  id="whatsappUrl"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("whatsappUrl")}
                  placeholder="https://wa.me/591..."
                />
              </FormField>
            </div>
            <FormField label="Texto botón de cierre" htmlFor="dismissText">
              <input
                id="dismissText"
                className={INPUT_CLS}
                {...formik.getFieldProps("dismissText")}
                placeholder="QUIZÁS DESPUÉS"
              />
            </FormField>
          </div>
        </EditorCard>

        {/* Imagen */}
        <EditorCard title="Imagen del Banner" icon={ImageIcon} hint="Imagen que acompaña la promoción (opcional)">
          <div className="flex flex-col gap-2">
            <ImageDropzone
              preview={imagePreview ?? ""}
              onFile={(file) => { setImageFile(file); setImagePreview(URL.createObjectURL(file)) }}
              hint="(opcional)"
              previewClassName="w-40 h-40 rounded-lg object-cover border border-gray-200"
            />
            {imageFile && <p className="text-xs text-gray-500">{imageFile.name}</p>}
            {!imageFile && formik.values.imageUrl && (
              <p className="text-xs text-gray-400">Imagen actual conservada del servidor</p>
            )}
          </div>
        </EditorCard>

        <SaveBar
          dirty={formik.dirty}
          saving={formik.isSubmitting}
          saved={saved}
          onSave={() => formik.submitForm()}
          onReset={() => formik.resetForm()}
        />
      </div>
    </form>
  )
}
