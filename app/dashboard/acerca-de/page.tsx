"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Check, User, Image as ImageIcon, Award, BarChart2, Star } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { ImageDropzone } from "@/components/ui/ImageDropzone"
import { useToast } from "@/components/dashboard/Toast"

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[var(--vintage-gold)] focus:ring-1 focus:ring-[var(--vintage-gold)] transition-colors"

const INPUT_ERROR_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-red-400 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"

interface AboutForm {
  sectionLabel: string
  doctorName: string
  descriptionDoc: string
  imageUrl: string
  experienceBadgeValue: string
  experienceBadgeLabel: string
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
  stat3Value: string
  stat3Label: string
  whyChooseUsLabel: string
  whyChooseUsTitle: string
  whyChooseUsDescription: string
  feature1Title: string
  feature1Description: string
  feature2Title: string
  feature2Description: string
  feature3Title: string
  feature3Description: string
  feature4Title: string
  feature4Description: string
}

const EMPTY: AboutForm = {
  sectionLabel: "",
  doctorName: "",
  descriptionDoc: "",
  imageUrl: "",
  experienceBadgeValue: "",
  experienceBadgeLabel: "",
  stat1Value: "",
  stat1Label: "",
  stat2Value: "",
  stat2Label: "",
  stat3Value: "",
  stat3Label: "",
  whyChooseUsLabel: "",
  whyChooseUsTitle: "",
  whyChooseUsDescription: "",
  feature1Title: "",
  feature1Description: "",
  feature2Title: "",
  feature2Description: "",
  feature3Title: "",
  feature3Description: "",
  feature4Title: "",
  feature4Description: "",
}

const aboutSchema = Yup.object({
  doctorName: Yup.string().min(10, "El nombre debe tener al menos 10 caracteres").required("El nombre del doctor es obligatorio"),
  descriptionDoc: Yup.string().min(10, "La biografía debe tener al menos 10 caracteres").required("La biografía es obligatoria"),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackend(raw: any): AboutForm {
  return {
    sectionLabel: raw.sectionLabel ?? "",
    doctorName: raw.doctorName ?? "",
    descriptionDoc: raw.descriptionDoc ?? "",
    imageUrl: raw.imageUrl ?? raw.image_url ?? "",
    experienceBadgeValue: raw.experienceBadgeValue ?? "",
    experienceBadgeLabel: raw.experienceBadgeLabel ?? "",
    stat1Value: raw.stat1Value ?? "",
    stat1Label: raw.stat1Label ?? "",
    stat2Value: raw.stat2Value ?? "",
    stat2Label: raw.stat2Label ?? "",
    stat3Value: raw.stat3Value ?? "",
    stat3Label: raw.stat3Label ?? "",
    whyChooseUsLabel: raw.whyChooseUsLabel ?? "",
    whyChooseUsTitle: raw.whyChooseUsTitle ?? "",
    whyChooseUsDescription: raw.whyChooseUsDescription ?? "",
    feature1Title: raw.feature1Title ?? "",
    feature1Description: raw.feature1Description ?? "",
    feature2Title: raw.feature2Title ?? "",
    feature2Description: raw.feature2Description ?? "",
    feature3Title: raw.feature3Title ?? "",
    feature3Description: raw.feature3Description ?? "",
    feature4Title: raw.feature4Title ?? "",
    feature4Description: raw.feature4Description ?? "",
  }
}

export default function AcercaDeDashboardPage() {
  const showToast = useToast()
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const formik = useFormik<AboutForm>({
    initialValues: EMPTY,
    validationSchema: aboutSchema,
    validateOnMount: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let res: Response

        if (imageFile) {
          const fd = new FormData()
          fd.append("image", imageFile)
          Object.entries(values).forEach(([key, val]) => {
            if (key === "imageUrl") return
            fd.append(key, val)
          })
          res = await guardedFetch("/api/about", { method: "PUT", body: fd })
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { imageUrl: _imageUrl, ...rest } = values
          res = await guardedFetch("/api/about", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rest),
          })
        }

        if (!res.ok) throw new Error()
        const updated = await res.json()
        if (updated && !updated.error) formik.resetForm({ values: fromBackend(updated) })
        setImageFile(null)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        showToast("success", "¡Cambios guardados exitosamente!")
      } catch {
        showToast("error", "No se pudo guardar. Intenta de nuevo.")
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) formik.resetForm({ values: fromBackend(data) })
        if (data.imageUrl) setImagePreview(data.imageUrl)
      })
      .catch(() => {
         showToast("error", "No se pudo conectar al servidor.")
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  function inputCls(field: keyof AboutForm) {
    return formik.touched[field] && formik.errors[field] ? INPUT_ERROR_CLS : INPUT_CLS
  }

  if (loading) return <p className="text-gray-400 text-sm" role="status">Cargando...</p>

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <PageHeader
        title="Acerca de Nosotros"
        description="Edita el contenido de la sección About Us del sitio web."
        saving={formik.isSubmitting}
        saved={saved}
        onSave={() => formik.submitForm()}
        saveDisabled={!formik.isValid || formik.isSubmitting}
      />

      <div className="flex flex-col gap-6">
        {/* Hero / Banner */}
        <EditorCard title="Hero / Presentación">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-pink-500" />
            <span className="text-sm text-gray-500">Información principal del doctor</span>
          </div>
          <div className="flex flex-col gap-4">
            <FormField label="Etiqueta de sección (ej: About Us)" htmlFor="sectionLabel">
              <input
                id="sectionLabel"
                className={INPUT_CLS}
                {...formik.getFieldProps("sectionLabel")}
                placeholder="About Us"
              />
            </FormField>

            <FormField label={<>Nombre del doctor <span className="text-red-500">*</span></>} htmlFor="doctorName">
              <input
                id="doctorName"
                className={inputCls("doctorName")}
                {...formik.getFieldProps("doctorName")}
                placeholder="Dra. Yasmin Medrano Avila"
              />
              {formik.touched.doctorName && formik.errors.doctorName && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.doctorName}</p>
              )}
            </FormField>

            <FormField label={<>Descripción / Biografía <span className="text-red-500">*</span></>} htmlFor="descriptionDoc">
              <textarea
                id="descriptionDoc"
                className={inputCls("descriptionDoc")}
                rows={4}
                {...formik.getFieldProps("descriptionDoc")}
                placeholder="Breve descripción del doctor..."
              />
              {formik.touched.descriptionDoc && formik.errors.descriptionDoc && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.descriptionDoc}</p>
              )}
            </FormField>
          </div>
        </EditorCard>

        {/* Imagen */}
        <EditorCard title="Imagen del Doctor">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon size={16} className="text-blue-500" />
            <span className="text-sm text-gray-500">Foto que aparece en la sección About Us</span>
          </div>
          <div className="flex flex-col gap-2">
            <ImageDropzone
              preview={imagePreview ?? ""}
              onFile={(file) => { setImageFile(file); setImagePreview(URL.createObjectURL(file)) }}
              previewClassName="w-32 h-32 rounded-lg object-cover border border-gray-200"
            />
            {imageFile && <p className="text-xs text-gray-500">{imageFile.name}</p>}
          </div>
        </EditorCard>

        {/* Badge de experiencia */}
        <EditorCard title="Badge de Experiencia">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-amber-500" />
            <span className="text-sm text-gray-500">Insignia que muestra años de experiencia</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Valor (ej: 15+)" htmlFor="experienceBadgeValue">
              <input
                id="experienceBadgeValue"
                className={INPUT_CLS}
                {...formik.getFieldProps("experienceBadgeValue")}
                placeholder="15+"
              />
            </FormField>
            <FormField label="Etiqueta (ej: Years Experience)" htmlFor="experienceBadgeLabel">
              <input
                id="experienceBadgeLabel"
                className={INPUT_CLS}
                {...formik.getFieldProps("experienceBadgeLabel")}
                placeholder="Years Experience"
              />
            </FormField>
          </div>
        </EditorCard>

        {/* Estadísticas */}
        <EditorCard title="Estadísticas">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-green-600" />
            <span className="text-sm text-gray-500">Números destacados (pacientes, procedimientos, etc.)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([1, 2, 3] as const).map((n) => (
              <div key={n} className="flex flex-col gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estadística {n}</p>
                <FormField label="Valor (ej: 500+)" htmlFor={`stat${n}Value`}>
                  <input
                    id={`stat${n}Value`}
                    className={INPUT_CLS}
                    {...formik.getFieldProps(`stat${n}Value`)}
                    placeholder="500+"
                  />
                </FormField>
                <FormField label="Etiqueta (ej: Patients)" htmlFor={`stat${n}Label`}>
                  <input
                    id={`stat${n}Label`}
                    className={INPUT_CLS}
                    {...formik.getFieldProps(`stat${n}Label`)}
                    placeholder="Patients"
                  />
                </FormField>
              </div>
            ))}
          </div>
        </EditorCard>

        {/* Why Choose Us */}
        <EditorCard title="Why Choose Us">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-rose-500" />
            <span className="text-sm text-gray-500">Subsección de razones para elegir a la doctora</span>
          </div>
          <div className="flex flex-col gap-4">
            <FormField label="Etiqueta (ej: Why Choose Us)" htmlFor="whyChooseUsLabel">
              <input
                id="whyChooseUsLabel"
                className={INPUT_CLS}
                {...formik.getFieldProps("whyChooseUsLabel")}
                placeholder="Why Choose Us"
              />
            </FormField>
            <FormField label="Título" htmlFor="whyChooseUsTitle">
              <input
                id="whyChooseUsTitle"
                className={INPUT_CLS}
                {...formik.getFieldProps("whyChooseUsTitle")}
                placeholder="La mejor elección para tu salud estética"
              />
            </FormField>
            <FormField label="Descripción" htmlFor="whyChooseUsDescription">
              <textarea
                id="whyChooseUsDescription"
                className={INPUT_CLS}
                rows={3}
                {...formik.getFieldProps("whyChooseUsDescription")}
                placeholder="Descripción de la subsección..."
              />
            </FormField>
          </div>
        </EditorCard>

        {/* Features */}
        <EditorCard title="Features (Tarjetas de características)">
          <div className="flex items-center gap-2 mb-4">
            <Check size={16} className="text-purple-500" />
            <span className="text-sm text-gray-500">4 tarjetas con características destacadas</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n} className="flex flex-col gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Feature {n}</p>
                <FormField label="Título" htmlFor={`feature${n}Title`}>
                  <input
                    id={`feature${n}Title`}
                    className={INPUT_CLS}
                    {...formik.getFieldProps(`feature${n}Title`)}
                    placeholder={`Característica ${n}`}
                  />
                </FormField>
                <FormField label="Descripción" htmlFor={`feature${n}Description`}>
                  <textarea
                    id={`feature${n}Description`}
                    className={INPUT_CLS}
                    rows={2}
                    {...formik.getFieldProps(`feature${n}Description`)}
                    placeholder="Descripción de la característica..."
                  />
                </FormField>
              </div>
            ))}
          </div>
        </EditorCard>

        {/* Save button bottom */}
        <div className="flex justify-end pb-4">
          <button
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "var(--vintage-gold)" }}
          >
            <Check size={15} />
            {formik.isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </form>
  )
}
