"use client"

import type { FieldInputProps } from "formik"
import * as Yup from "yup"
import { Search } from "lucide-react"
import { FormField } from "@/components/ui/FormField"

/**
 * Campos «SEO / Google» de una ficha (tratamiento o artículo).
 *
 * El backend no valida los límites: Google corta el título en ~60-70
 * caracteres y la descripción en ~160, así que el tope se exige aquí.
 * Vacío = el sitio lo deriva del nombre y la descripción.
 */

export const SEO_TITLE_MAX = 70
export const SEO_DESCRIPTION_MAX = 170

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[var(--vintage-gold)] focus:ring-1 focus:ring-[var(--vintage-gold)] transition-colors"

export const seoTitleSchema = Yup.string().max(SEO_TITLE_MAX, `Máximo ${SEO_TITLE_MAX} caracteres`).default("")
export const seoDescriptionSchema = Yup.string()
  .max(SEO_DESCRIPTION_MAX, `Máximo ${SEO_DESCRIPTION_MAX} caracteres`)
  .default("")

/** Campos para mezclar en el schema Yup de cada formulario. */
export const seoFieldsShape = {
  seoTitle: seoTitleSchema,
  seoDescription: seoDescriptionSchema,
  ogImageUrl: Yup.string()
    .trim()
    .matches(/^(https?:\/\/\S+|\/uploads\/\S+)?$/, "Debe ser un enlace https://… o una ruta /uploads/…")
    .default(""),
}

export interface SeoValues {
  seoTitle: string
  seoDescription: string
  ogImageUrl: string
}

/** Valores SEO de un registro del backend (campo ausente o null → ""). */
export function seoValuesFrom(raw: Record<string, unknown>): SeoValues {
  const s = (v: unknown) => (typeof v === "string" ? v : "")
  return { seoTitle: s(raw.seoTitle), seoDescription: s(raw.seoDescription), ogImageUrl: s(raw.ogImageUrl) }
}

/** Se envían siempre, también vacíos, para que la doctora pueda borrar un valor. */
export function appendSeo(fd: FormData, v: SeoValues): void {
  fd.append("seoTitle", v.seoTitle.trim())
  fd.append("seoDescription", v.seoDescription.trim())
  fd.append("ogImageUrl", v.ogImageUrl.trim())
}

interface CountedFieldProps {
  id: string
  label: string
  max: number
  field: FieldInputProps<string>
  error?: string
  multiline?: boolean
  placeholder?: string
  hint?: string
}

/** Input con contador de caracteres. El contador se pone rojo al pasarse. */
export function CountedField({ id, label, max, field, error, multiline, placeholder, hint }: CountedFieldProps) {
  const length = (field.value ?? "").length
  const over = length > max
  const props = { id, className: INPUT_CLS, ...field, value: field.value ?? "", placeholder, "aria-invalid": over || undefined }
  return (
    <FormField label={label} htmlFor={id} hint={hint}>
      {multiline ? <textarea rows={3} {...props} /> : <input {...props} />}
      <div className="flex justify-between gap-2 text-xs">
        <span className="text-red-500">{error}</span>
        <span className={over ? "text-red-500 font-semibold" : "text-gray-400"} aria-live="polite">
          {length}/{max}
        </span>
      </div>
    </FormField>
  )
}

interface SeoFormik {
  values: SeoValues
  errors: Partial<Record<keyof SeoValues, unknown>>
  touched: Partial<Record<keyof SeoValues, unknown>>
  getFieldProps: (name: string) => FieldInputProps<string>
}

/** Lo que significa `seoTitle` en cada tipo de ficha (el sitio lo usa distinto). */
const TITLE_COPY = {
  treatment: {
    label: "Nombre en Google",
    hint: "Cómo se busca este tratamiento (p. ej. «Botox»). El título será «Botox en Cochabamba».",
    placeholder: "Botox",
  },
  blog: {
    label: "Título para Google",
    hint: "Titular del artículo en los resultados de búsqueda. Vacío = el título del artículo.",
    placeholder: "",
  },
} as const

export function SeoFields({ formik, idPrefix, kind }: { formik: SeoFormik; idPrefix: string; kind: keyof typeof TITLE_COPY }) {
  const copy = TITLE_COPY[kind]
  const err = (k: keyof SeoValues) => {
    const e = formik.errors[k]
    return typeof e === "string" && (formik.touched[k] || formik.values[k]) ? e : undefined
  }
  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4">
      <legend className="px-1 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        <Search size={14} aria-hidden="true" style={{ color: "var(--vintage-gold)" }} />
        SEO / Google
      </legend>
      <p className="text-xs text-gray-400 -mt-2">Opcional. Vacío = se usa el nombre y la descripción de la ficha.</p>
      <CountedField
        id={`${idPrefix}-seo-title`}
        label={copy.label}
        hint={copy.hint}
        max={SEO_TITLE_MAX}
        field={formik.getFieldProps("seoTitle")}
        error={err("seoTitle")}
        placeholder={copy.placeholder}
      />
      <CountedField
        id={`${idPrefix}-seo-description`}
        label="Descripción en Google"
        max={SEO_DESCRIPTION_MAX}
        field={formik.getFieldProps("seoDescription")}
        error={err("seoDescription")}
        multiline
      />
      <FormField
        label="Imagen al compartir (URL)"
        htmlFor={`${idPrefix}-og-image`}
        hint="Enlace https://… o ruta /uploads/…. Vacío = se usa la imagen de portada."
      >
        <input
          id={`${idPrefix}-og-image`}
          type="text"
          inputMode="url"
          className={INPUT_CLS}
          {...formik.getFieldProps("ogImageUrl")}
          placeholder="https://…"
        />
        {err("ogImageUrl") && <p className="text-xs text-red-500 mt-1">{err("ogImageUrl")}</p>}
      </FormField>
    </fieldset>
  )
}
