"use client"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import Link from "next/link"
import { Check, Upload, X } from "lucide-react"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import RichTextEditor from "@/components/dashboard/RichTextEditor"

const TAGS = ["POPULAR", "INNOVADOR", "RECOMENDADO", "DEFINITIVO", "ESENCIAL", "ESPECIALIZADO"]

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#B8973B] focus:ring-1 focus:ring-[#B8973B] transition-colors"

const treatmentSchema = Yup.object({
  name: Yup.string().min(5, "El nombre debe tener al menos 5 caracteres").required("El nombre debe tener al menos 5 caracteres"),
  description: Yup.string()
    .required("La descripción es obligatoria")
    .test("has-text", "La descripción debe tener al menos 5 caracteres", (val) => {
      if (!val) return false
      const text = val.replace(/<[^>]*>/g, "").trim()
      return text.length >= 5
    }),
  tag: Yup.string().default(""),
  price: Yup.string().default(""),
  active: Yup.boolean().default(false),
})

type TreatmentSchemaValues = Yup.InferType<typeof treatmentSchema>

export interface TreatmentFormValues extends TreatmentSchemaValues {
  imageFile: File | null
  imagePreview: string
  imageRemoved: boolean
}

const INITIAL_VALUES: TreatmentFormValues = {
  name: "",
  tag: "",
  description: "",
  price: "",
  active: false,
  imageFile: null,
  imagePreview: "",
  imageRemoved: false,
}

interface TreatmentFormProps {
  initialValues?: Partial<TreatmentFormValues>
  submitLabel: string
  savingLabel?: string
  onSubmit: (values: TreatmentFormValues) => Promise<void>
}

export function TreatmentForm({
  initialValues,
  submitLabel,
  savingLabel = "Guardando...",
  onSubmit,
}: TreatmentFormProps) {
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(initialValues?.imageFile ?? null)
  const [imagePreview, setImagePreview] = useState(initialValues?.imagePreview ?? "")
  const [imageRemoved, setImageRemoved] = useState(false)

  const formik = useFormik<TreatmentSchemaValues>({
    initialValues: {
      name: initialValues?.name ?? "",
      tag: initialValues?.tag ?? "",
      description: initialValues?.description ?? "",
      price: initialValues?.price ?? "",
      active: initialValues?.active ?? false,
    },
    validationSchema: treatmentSchema,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: async (data) => {
      setSaving(true)
      try {
        await onSubmit({
          ...data,
          tag: data.tag ?? "",
          price: data.price ?? "",
          imageFile,
          imagePreview,
          imageRemoved,
        })
      } finally {
        setSaving(false)
      }
    },
  })

  useEffect(() => {
    return () => { if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview) }
  }, [imagePreview])

  function handleImageSelect(file: File) {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setImageRemoved(false)
  }

  function handleImageRemove() {
    setImageFile(null)
    setImagePreview("")
    setImageRemoved(true)
  }

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <EditorCard title="Información del tratamiento">
        <FormField label="Nombre del tratamiento *" htmlFor="t-name">
          <input
            id="t-name"
            className={INPUT_CLS}
            {...formik.getFieldProps("name")}
            placeholder="Toxina Botulínica"
          />
          {formik.touched.name && formik.errors.name && <p className="text-xs text-red-500 mt-1">{formik.errors.name}</p>}
        </FormField>

        <FormField label="TAG (etiqueta)" htmlFor="t-tag">
          <div className="flex flex-col gap-2">
            <input
              id="t-tag"
              className={INPUT_CLS}
              value={formik.values.tag ?? ""}
              onChange={(e) => formik.setFieldValue("tag", e.target.value.toUpperCase())}
              onBlur={formik.handleBlur}
              name="tag"
              placeholder="POPULAR"
              maxLength={30}
            />
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => formik.setFieldValue("tag", t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    formik.values.tag === t
                      ? "bg-[#B8973B] text-white border-[#B8973B]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#B8973B] hover:text-[#B8973B]"
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:border-[#B8973B] hover:text-[#B8973B] transition-colors"
            >
              <Upload size={15} />
              {imagePreview ? "Cambiar imagen" : "Seleccionar imagen"} (JPG, PNG, WebP)
              <input
                id="t-image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageSelect(file)
                }}
              />
            </label>
            {imagePreview && (
              <div className="relative w-fit">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="h-32 rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
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
          <RichTextEditor
            value={formik.values.description}
            onChange={(html) => formik.setFieldValue("description", html)}
            onBlur={() => formik.setFieldTouched("description", true)}
            placeholder="Describe brevemente en qué consiste este tratamiento..."
            hasError={!!(formik.touched.description && formik.errors.description)}
          />
          {formik.touched.description && formik.errors.description && <p className="text-xs text-red-500 mt-1">{formik.errors.description}</p>}
        </FormField>

        <FormField label="Precio" htmlFor="t-price">
          <input
            id="t-price"
            className={INPUT_CLS}
            {...formik.getFieldProps("price")}
            placeholder="Ej: 1500 Bs"
          />
        </FormField>

        <div className="flex items-center gap-2">
          <input
            id="t-active"
            type="checkbox"
            name="active"
            checked={formik.values.active}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="rounded accent-[#B8973B]"
          />
          <label htmlFor="t-active" className="text-sm text-gray-700 cursor-pointer">
            Visible en el sitio
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !formik.isValid}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            style={{ backgroundColor: "#B8973B" }}
          >
            <Check size={15} />
            {saving ? savingLabel : submitLabel}
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
  )
}

export function buildTreatmentFormData(values: TreatmentFormValues): FormData {
  const fd = new FormData()
  fd.append("name", values.name)
  fd.append("tag", values.tag ?? "")
  fd.append("description", values.description)
  fd.append("price", values.price ?? "")
  fd.append("active", String(values.active))
  if (values.imageFile) fd.append("image", values.imageFile)
  else if (values.imageRemoved) fd.append("image", "")
  return fd
}
