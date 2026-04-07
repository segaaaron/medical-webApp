"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Upload, X } from "lucide-react"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { useToast } from "@/components/dashboard/Toast"

const TAGS = ["POPULAR", "INNOVADOR", "RECOMENDADO", "DEFINITIVO", "ESENCIAL", "ESPECIALIZADO"]

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#b5496a] focus:ring-1 focus:ring-[#b5496a] transition-colors"

export default function NuevoTratamientoPage() {
  const showToast = useToast()
  const router = useRouter()
  const [name, setName] = useState("")
  const [tag, setTag] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      showToast("error", "El nombre del tratamiento es obligatorio.")
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("name", name)
      fd.append("category", tag)
      fd.append("description", description)
      fd.append("active", String(active))
      fd.append("image", imageFile ?? "")

      const res = await fetch("/api/treatments", { method: "POST", body: fd })

      if (res.ok) {
        showToast("success", "¡Tratamiento creado exitosamente!")
        router.push("/dashboard/tratamientos")
      } else {
        const data = await res.json()
        showToast("error", data.error ?? "Error al crear el tratamiento.")
      }
    } catch {
      showToast("error", "No se pudo conectar al servidor.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <nav aria-label="Volver" className="mb-6">
        <Link
          href="/dashboard/tratamientos"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "#b5496a" }}
        >
          <ArrowLeft size={16} />
          Volver
        </Link>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">Nuevo tratamiento</h1>
      <p className="text-sm text-gray-500 mb-6">Completa los campos para agregar un tratamiento al catálogo.</p>

      <form onSubmit={handleSubmit} noValidate>
        <EditorCard title="Información del tratamiento">
          <FormField label="Nombre del tratamiento *" htmlFor="t-name">
            <input
              id="t-name"
              className={INPUT_CLS}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Toxina Botulínica"
              required
            />
          </FormField>

          <FormField label="TAG (etiqueta)" htmlFor="t-tag">
            <div className="flex flex-col gap-2">
              <input
                id="t-tag"
                className={INPUT_CLS}
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                placeholder="POPULAR"
                maxLength={30}
              />
              <div className="flex flex-wrap gap-2">
                {TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      tag === t
                        ? "bg-[#b5496a] text-white border-[#b5496a]"
                        : "bg-white text-gray-500 border-gray-200 hover:border-[#b5496a] hover:text-[#b5496a]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </FormField>

          <FormField label="Imagen de portada" htmlFor="t-image">
            <div className="space-y-2">
              <label
                htmlFor="t-image"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:border-[#b5496a] hover:text-[#b5496a] transition-colors"
              >
                <Upload size={15} />
                Seleccionar imagen (JPG, PNG, WebP)
                <input
                  id="t-image"
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

          <FormField label="Descripción del tratamiento" htmlFor="t-desc">
            <textarea
              id="t-desc"
              className={INPUT_CLS}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente en qué consiste este tratamiento..."
            />
          </FormField>

          <div className="flex items-center gap-2">
            <input
              id="t-active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded accent-[#b5496a]"
            />
            <label htmlFor="t-active" className="text-sm text-gray-700 cursor-pointer">
              Visible en el sitio
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: "#b5496a" }}
            >
              <Check size={15} />
              {saving ? "Guardando..." : "Crear tratamiento"}
            </button>
            <Link
              href="/dashboard/tratamientos"
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
