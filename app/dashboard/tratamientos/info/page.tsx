"use client"

import { useEffect, useState } from "react"
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

interface TreatmentsInfo {
  label: string
  title: string
  description: string
  descriptionHighlight: string
  consultationTitle: string
  consultationItems: string[]
  sidebarBadge: string
  doctorImage: string
  ctaTitle: string
  ctaSubtitle: string
  priceLabel: string
  priceDescription: string
  buttonText: string
  disclaimer: string
}

const DEFAULT: TreatmentsInfo = {
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
  const [form, setForm] = useState<TreatmentsInfo>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  // imagePreview = URL visible en el <img> (blob local o URL resuelta del backend)
  const [imagePreview, setImagePreview] = useState("")
  // imageFile = archivo pendiente de subir al backend
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/treatments/info")
        if (res.ok) {
          const data = await res.json()
          const merged: TreatmentsInfo = { ...DEFAULT, ...data }
          // Normalize: always store the raw backend path
          merged.doctorImage = toRawPath(merged.doctorImage)
          setForm(merged)
          // Resolve only for display
          if (merged.doctorImage) setImagePreview(resolveImageUrl(merged.doctorImage))
        }
      } catch {
        // use defaults silently
      }
      setLoading(false)
    }
    load()
  }, [])

  function setItem(index: number, value: string) {
    const items = [...form.consultationItems]
    items[index] = value
    setForm({ ...form, consultationItems: items })
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    // Muestra preview local inmediatamente sin alterar form.doctorImage
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      showToast("error", "El título principal es obligatorio.")
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("label", form.label)
      fd.append("title", form.title)
      fd.append("description", form.description)
      fd.append("descriptionHighlight", form.descriptionHighlight)
      fd.append("consultationTitle", form.consultationTitle)
      fd.append("consultationItems", JSON.stringify(form.consultationItems))
      fd.append("sidebarBadge", form.sidebarBadge)
      fd.append("doctorImage", form.doctorImage)
      fd.append("ctaTitle", form.ctaTitle)
      fd.append("ctaSubtitle", form.ctaSubtitle)
      fd.append("priceLabel", form.priceLabel)
      fd.append("priceDescription", form.priceDescription)
      fd.append("buttonText", form.buttonText)
      fd.append("disclaimer", form.disclaimer)

      if (imageFile) {
        fd.append("image", imageFile)
      }

      const res = await fetch("/api/treatments/info", {
        method: "PUT",
        body: fd,
      })
      if (res.ok) {
        const saved = await res.json()
        // Update form with any backend-resolved values (e.g. image path)
        const updatedValue = saved?.value ?? {}
        const merged = { ...form, ...updatedValue }
        if (updatedValue.doctorImage) {
          merged.doctorImage = toRawPath(updatedValue.doctorImage)
          setImagePreview(resolveImageUrl(merged.doctorImage))
        }
        setForm(merged)
        setImageFile(null)
        showToast("success", "¡Información actualizada exitosamente!")
      } else {
        const data = await res.json()
        showToast("error", data.error ?? "Error al guardar la información.")
      }
    } catch {
      showToast("error", "No se pudo conectar al servidor.")
    } finally {
      setSaving(false)
    }
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

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

        {/* Hero */}
        <EditorCard title="Sección principal">
          <FormField label="Etiqueta superior (label)" htmlFor="info-label">
            <input
              id="info-label"
              className={INPUT_CLS}
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="NUESTROS SERVICIOS"
            />
          </FormField>
          <FormField label="Título principal *" htmlFor="info-title">
            <input
              id="info-title"
              className={INPUT_CLS}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Descripción" htmlFor="info-description">
            <textarea
              id="info-description"
              className={INPUT_CLS}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>
          <FormField label="Texto resaltado dentro de la descripción" htmlFor="info-highlight">
            <input
              id="info-highlight"
              className={INPUT_CLS}
              value={form.descriptionHighlight}
              onChange={(e) => setForm({ ...form, descriptionHighlight: e.target.value })}
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
              value={form.consultationTitle}
              onChange={(e) => setForm({ ...form, consultationTitle: e.target.value })}
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {form.consultationItems.map((item, i) => (
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
              value={form.sidebarBadge}
              onChange={(e) => setForm({ ...form, sidebarBadge: e.target.value })}
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
                    onClick={() => { setImagePreview(""); setImageFile(null); setForm({ ...form, doctorImage: "" }) }}
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
              value={form.ctaTitle}
              onChange={(e) => setForm({ ...form, ctaTitle: e.target.value })}
            />
          </FormField>
          <FormField label="Subtítulo del CTA" htmlFor="info-cta-subtitle">
            <input
              id="info-cta-subtitle"
              className={INPUT_CLS}
              value={form.ctaSubtitle}
              onChange={(e) => setForm({ ...form, ctaSubtitle: e.target.value })}
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Precio destacado (priceLabel)" htmlFor="info-price-label">
              <input
                id="info-price-label"
                className={INPUT_CLS}
                value={form.priceLabel}
                onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
              />
            </FormField>
            <FormField label="Descripción del precio" htmlFor="info-price-desc">
              <input
                id="info-price-desc"
                className={INPUT_CLS}
                value={form.priceDescription}
                onChange={(e) => setForm({ ...form, priceDescription: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Texto del botón" htmlFor="info-button-text">
            <input
              id="info-button-text"
              className={INPUT_CLS}
              value={form.buttonText}
              onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
            />
          </FormField>
          <FormField label="Pie de tarjeta (disclaimer)" htmlFor="info-disclaimer">
            <input
              id="info-disclaimer"
              className={INPUT_CLS}
              value={form.disclaimer}
              onChange={(e) => setForm({ ...form, disclaimer: e.target.value })}
            />
          </FormField>
        </EditorCard>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "#b5496a" }}
          >
            <Check size={15} aria-hidden="true" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </>
  )
}
