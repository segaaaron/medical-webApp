"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useRef, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Check, Tag, Image as ImageIcon, MessageCircle, ToggleLeft, ToggleRight } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { useToast } from "@/components/dashboard/Toast"
import { resolveImageUrl } from "@/lib/image-utils"

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#B8973B] focus:ring-1 focus:ring-[#B8973B] transition-colors"

const INPUT_ERROR_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-red-400 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"

interface PromoBannerForm {
  tag: string
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formik = useFormik<PromoBannerForm>({
    initialValues: EMPTY,
    validationSchema: promoBannerSchema,
    validateOnMount: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const fd = new FormData()
        Object.entries(values).forEach(([key, val]) => {
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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function inputCls(field: keyof PromoBannerForm) {
    return formik.touched[field] && formik.errors[field] ? INPUT_ERROR_CLS : INPUT_CLS
  }

  if (loading) return <p className="text-gray-400 text-sm" role="status">Cargando...</p>

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <PageHeader
        title="Promociones"
        description="Edita el banner de promoción que aparece en el sitio web."
        saving={formik.isSubmitting}
        saved={saved}
        onSave={() => formik.submitForm()}
        saveDisabled={!formik.isValid || formik.isSubmitting}
      />

      <div className="flex flex-col gap-6">
        {/* Identificación */}
        <EditorCard title="Nombre de la Promoción">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={16} className="text-pink-500" />
            <span className="text-sm text-gray-500">Etiqueta principal que identifica la promoción</span>
          </div>
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

            {/* Estado activo */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Estado del banner</p>
                <p className="text-xs text-gray-400">Activa o desactiva la visualización del banner</p>
              </div>
              <button
                type="button"
                onClick={() => formik.setFieldValue("active", !formik.values.active)}
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: formik.values.active ? "#B8973B" : "#9ca3af" }}
              >
                {formik.values.active ? (
                  <>
                    <ToggleRight size={22} />
                    Activo
                  </>
                ) : (
                  <>
                    <ToggleLeft size={22} />
                    Inactivo
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
        <EditorCard title="Botones">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={16} className="text-green-500" />
            <span className="text-sm text-gray-500">Configuración de los botones del banner</span>
          </div>
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
        <EditorCard title="Imagen del Banner">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon size={16} className="text-blue-500" />
            <span className="text-sm text-gray-500">Imagen que acompaña la promoción (opcional)</span>
          </div>
          <div className="flex flex-col gap-4">
            {imagePreview && (
              <div className="w-40 h-40 rounded-lg overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-fit px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {imageFile ? "Cambiar imagen" : "Subir imagen"}
              </button>
              {imageFile && <p className="text-xs text-gray-500">{imageFile.name}</p>}
              {!imageFile && formik.values.imageUrl && (
                <p className="text-xs text-gray-400">Imagen actual conservada del servidor</p>
              )}
            </div>
          </div>
        </EditorCard>

        {/* Save bottom */}
        <div className="flex justify-end pb-4">
          <button
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "#B8973B" }}
          >
            <Check size={15} />
            {formik.isSubmitting ? "Guardando..." : "Guardar promoción"}
          </button>
        </div>
      </div>
    </form>
  )
}
