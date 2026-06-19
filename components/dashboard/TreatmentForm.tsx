"use client"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import Link from "next/link"
import { Check } from "lucide-react"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { ImageDropzone } from "@/components/ui/ImageDropzone"
import RichTextEditor from "@/components/dashboard/RichTextEditor"

const TAGS = ["POPULAR", "INNOVADOR", "RECOMENDADO", "DEFINITIVO", "ESENCIAL", "ESPECIALIZADO"]

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[var(--vintage-gold)] focus:ring-1 focus:ring-[var(--vintage-gold)] transition-colors"

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
  beforeImageFile: File | null
  beforeImagePreview: string
  beforeImageRemoved: boolean
  afterImageFile: File | null
  afterImagePreview: string
  afterImageRemoved: boolean
}

interface TreatmentFormProps {
  initialValues?: Partial<TreatmentFormValues>
  submitLabel: string
  savingLabel?: string
  onSubmit: (values: TreatmentFormValues) => Promise<void>
}

/** Estado controlado de un selector de imagen (archivo + preview + flag de borrado). */
function useImagePicker(initialPreview?: string) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(initialPreview ?? "")
  const [removed, setRemoved] = useState(false)

  useEffect(() => {
    return () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview) }
  }, [preview])

  function select(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setRemoved(false)
  }
  function remove() {
    setFile(null)
    setPreview("")
    setRemoved(true)
  }
  return { file, preview, removed, select, remove }
}

interface ImagePickerFieldProps {
  id: string
  label: string
  hint?: string
  preview: string
  onSelect: (file: File) => void
  onRemove: () => void
  previewClassName?: string
}

function ImagePickerField({ id, label, hint, preview, onSelect, onRemove, previewClassName }: ImagePickerFieldProps) {
  return (
    <FormField label={label} htmlFor={id}>
      <ImageDropzone
        id={id}
        preview={preview}
        onFile={onSelect}
        onRemove={onRemove}
        hint={hint}
        previewClassName={previewClassName}
      />
    </FormField>
  )
}

export function TreatmentForm({
  initialValues,
  submitLabel,
  savingLabel = "Guardando...",
  onSubmit,
}: TreatmentFormProps) {
  const [saving, setSaving] = useState(false)
  const cover = useImagePicker(initialValues?.imagePreview)
  const before = useImagePicker(initialValues?.beforeImagePreview)
  const after = useImagePicker(initialValues?.afterImagePreview)

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
          imageFile: cover.file,
          imagePreview: cover.preview,
          imageRemoved: cover.removed,
          beforeImageFile: before.file,
          beforeImagePreview: before.preview,
          beforeImageRemoved: before.removed,
          afterImageFile: after.file,
          afterImagePreview: after.preview,
          afterImageRemoved: after.removed,
        })
      } finally {
        setSaving(false)
      }
    },
  })

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
                      ? "bg-[var(--vintage-gold)] text-white border-[var(--vintage-gold)]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[var(--vintage-gold)] hover:text-[var(--vintage-gold)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </FormField>

        <ImagePickerField
          id="t-image"
          label="Imagen de portada"
          preview={cover.preview}
          onSelect={cover.select}
          onRemove={cover.remove}
        />

        {/* Antes y Después — se muestran en la página de detalle del tratamiento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ImagePickerField
            id="t-before-image"
            label="Foto Antes"
            hint="(opcional)"
            preview={before.preview}
            onSelect={before.select}
            onRemove={before.remove}
            previewClassName="h-40 w-32 rounded-lg object-cover border border-gray-200"
          />
          <ImagePickerField
            id="t-after-image"
            label="Foto Después"
            hint="(opcional)"
            preview={after.preview}
            onSelect={after.select}
            onRemove={after.remove}
            previewClassName="h-40 w-32 rounded-lg object-cover border border-gray-200"
          />
        </div>

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
            className="rounded accent-[var(--vintage-gold)]"
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
            style={{ backgroundColor: "var(--vintage-gold)" }}
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
  if (values.beforeImageFile) fd.append("beforeImage", values.beforeImageFile)
  else if (values.beforeImageRemoved) fd.append("beforeImage", "")
  if (values.afterImageFile) fd.append("afterImage", values.afterImageFile)
  else if (values.afterImageRemoved) fd.append("afterImage", "")
  return fd
}
