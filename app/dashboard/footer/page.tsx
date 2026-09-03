"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState } from "react"
import { useFormik, FieldArray, FormikProvider } from "formik"
import * as Yup from "yup"
import { Plus, Trash2, User, MessageCircle, Facebook, Instagram, Music2, Link, Copyright } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { SaveBar } from "@/components/dashboard/SaveBar"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { useToast } from "@/components/dashboard/Toast"

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[var(--vintage-gold)] focus:ring-1 focus:ring-[var(--vintage-gold)] transition-colors"

const INPUT_ERROR_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-red-400 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"

interface LinkItem {
  label: string
  href: string
}

interface FooterFormValues {
  doctorName: string
  specialty: string
  description: string
  whatsappUrl: string
  facebookUrl: string
  instagramUrl: string
  tiktokUrl: string
  facialTreatments: LinkItem[]
  bodyTreatments: LinkItem[]
  officeLinks: LinkItem[]
  legalLinks: LinkItem[]
  copyrightText: string
  designedByText: string
}

const linkItemSchema = Yup.object({
  label: Yup.string().default(""),
  href: Yup.string().default(""),
})

const footerSchema = Yup.object({
  doctorName: Yup.string().required("El nombre del doctor es obligatorio"),
  specialty: Yup.string().default(""),
  description: Yup.string().default(""),
  whatsappUrl: Yup.string().default(""),
  facebookUrl: Yup.string().default(""),
  instagramUrl: Yup.string().default(""),
  tiktokUrl: Yup.string().default(""),
  facialTreatments: Yup.array(linkItemSchema).default([]),
  bodyTreatments: Yup.array(linkItemSchema).default([]),
  officeLinks: Yup.array(linkItemSchema).default([]),
  legalLinks: Yup.array(linkItemSchema).default([]),
  copyrightText: Yup.string().default(""),
  designedByText: Yup.string().default(""),
})

const EMPTY_LINK: LinkItem = { label: "", href: "" }

const INITIAL_VALUES: FooterFormValues = {
  doctorName: "",
  specialty: "",
  description: "",
  whatsappUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  facialTreatments: [],
  bodyTreatments: [],
  officeLinks: [],
  legalLinks: [],
  copyrightText: "",
  designedByText: "",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackend(raw: any): FooterFormValues {
  return {
    doctorName: raw.doctorName ?? "",
    specialty: raw.specialty ?? "",
    description: raw.description ?? "",
    whatsappUrl: raw.whatsappUrl ?? "",
    facebookUrl: raw.facebookUrl ?? "",
    instagramUrl: raw.instagramUrl ?? "",
    tiktokUrl: raw.tiktokUrl ?? "",
    facialTreatments: Array.isArray(raw.facialTreatments) ? raw.facialTreatments : [],
    bodyTreatments: Array.isArray(raw.bodyTreatments) ? raw.bodyTreatments : [],
    officeLinks: Array.isArray(raw.officeLinks) ? raw.officeLinks : [],
    legalLinks: Array.isArray(raw.legalLinks) ? raw.legalLinks : [],
    copyrightText: raw.copyrightText ?? "",
    designedByText: raw.designedByText ?? "",
  }
}

function LinkArrayEditor({
  fieldName,
  label,
  placeholder,
}: {
  fieldName: string
  label: string
  placeholder?: string
}) {
  return (
    <FieldArray name={fieldName}>
      {({ form, push, remove }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: LinkItem[] = (form.values as any)[fieldName] ?? []
        return (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500">{label}</p>
            {items.map((_, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    className={INPUT_CLS}
                    name={`${fieldName}[${index}].label`}
                    value={items[index].label}
                    onChange={form.handleChange}
                    placeholder="Texto del link"
                  />
                  <input
                    className={INPUT_CLS}
                    name={`${fieldName}[${index}].href`}
                    value={items[index].href}
                    onChange={form.handleChange}
                    placeholder={placeholder ?? "/ruta"}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-0.5 p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                  aria-label="Eliminar link"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => push({ ...EMPTY_LINK })}
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-[var(--vintage-gold)] hover:text-[var(--vintage-gold)] transition-colors w-fit"
            >
              <Plus size={13} />
              Agregar link
            </button>
          </div>
        )
      }}
    </FieldArray>
  )
}

export default function FooterDashboardPage() {
  const showToast = useToast()
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const formik = useFormik<FooterFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema: footerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await guardedFetch("/api/footer", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        if (!res.ok) throw new Error()
        // resetForm con los valores enviados: `dirty` vuelve a false y la barra
        // pasa a "guardado" sin necesidad de recargar del backend.
        formik.resetForm({ values })
        setSaved(true)
        showToast("success", "¡Footer guardado exitosamente!")
      } catch {
        showToast("error", "No se pudo guardar. Intenta de nuevo.")
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    fetch("/api/footer")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          formik.resetForm({ values: fromBackend(data) })
        }
      })
      .catch(() => {
        showToast("error", "No se pudo conectar al servidor.")
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return null

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <PageHeader
          title="Footer"
          description="Edita la información del pie de página del sitio web."
        />

        <div className="flex flex-col gap-6">
          {/* Información del doctor */}
          <EditorCard title="Información de la Doctora" icon={User} hint="Datos principales que aparecen en el footer">
            <div className="flex flex-col gap-4">
              <FormField label="Nombre del doctor *" htmlFor="doctorName">
                <input
                  id="doctorName"
                  className={formik.touched.doctorName && formik.errors.doctorName ? INPUT_ERROR_CLS : INPUT_CLS}
                  {...formik.getFieldProps("doctorName")}
                  placeholder="Dra. Yasmin Medrano Avila"
                />
                {formik.touched.doctorName && formik.errors.doctorName && (
                  <p className="text-xs text-red-500 mt-1">{formik.errors.doctorName}</p>
                )}
              </FormField>
              <FormField label="Especialidad" htmlFor="specialty">
                <input
                  id="specialty"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("specialty")}
                  placeholder="Medicina Estética Avanzada"
                />
              </FormField>
              <FormField label="Descripción corta" htmlFor="description">
                <textarea
                  id="description"
                  className={INPUT_CLS}
                  rows={3}
                  {...formik.getFieldProps("description")}
                  placeholder="Especialista en medicina estética dedicada a realzar tu belleza natural..."
                />
              </FormField>
            </div>
          </EditorCard>

          {/* Redes sociales */}
          <EditorCard title="Redes Sociales">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={16} aria-hidden="true" style={{ color: "var(--vintage-gold)" }} />
                <span className="text-sm text-gray-500">WhatsApp</span>
              </div>
              <FormField label="URL de WhatsApp" htmlFor="whatsappUrl">
                <input
                  id="whatsappUrl"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("whatsappUrl")}
                  placeholder="https://wa.me/521234567890"
                />
              </FormField>

              <div className="flex items-center gap-2 mt-2">
                <Facebook size={16} className="text-blue-600" />
                <span className="text-sm text-gray-500">Facebook</span>
              </div>
              <FormField label="URL de Facebook" htmlFor="facebookUrl">
                <input
                  id="facebookUrl"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("facebookUrl")}
                  placeholder="https://facebook.com/dramedrano"
                />
              </FormField>

              <div className="flex items-center gap-2 mt-2">
                <Instagram size={16} aria-hidden="true" style={{ color: "var(--vintage-gold)" }} />
                <span className="text-sm text-gray-500">Instagram</span>
              </div>
              <FormField label="URL de Instagram" htmlFor="instagramUrl">
                <input
                  id="instagramUrl"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("instagramUrl")}
                  placeholder="https://instagram.com/dramedrano"
                />
              </FormField>

              <div className="flex items-center gap-2 mt-2">
                <Music2 size={16} aria-hidden="true" style={{ color: "var(--vintage-gold)" }} />
                <span className="text-sm text-gray-500">TikTok</span>
              </div>
              <FormField label="URL de TikTok" htmlFor="tiktokUrl">
                <input
                  id="tiktokUrl"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("tiktokUrl")}
                  placeholder="https://www.tiktok.com/@drayasminmedranoa"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pega la direcci&oacute;n del perfil sin los par&aacute;metros que TikTok
                  a&ntilde;ade al compartir (todo lo que va despu&eacute;s de{" "}
                  <code>?</code>). Esta direcci&oacute;n le dice a Google que el perfil
                  y la web son el mismo consultorio.
                </p>
              </FormField>
            </div>
          </EditorCard>

          {/* Tratamientos faciales */}
          <EditorCard title="Tratamientos Faciales" icon={Link} hint="Links de tratamientos faciales en el footer">
            <LinkArrayEditor
              fieldName="facialTreatments"
              label="Cada link tiene un texto visible y una ruta"
              placeholder="/tratamientos/botox"
            />
          </EditorCard>

          {/* Tratamientos corporales */}
          <EditorCard title="Tratamientos Corporales" icon={Link} hint="Links de tratamientos corporales en el footer">
            <LinkArrayEditor
              fieldName="bodyTreatments"
              label="Cada link tiene un texto visible y una ruta"
              placeholder="/tratamientos/reduccion-medidas"
            />
          </EditorCard>

          {/* Links del consultorio */}
          <EditorCard title="Links del Consultorio" icon={Link} hint="Links de navegación del consultorio">
            <LinkArrayEditor
              fieldName="officeLinks"
              label="Cada link tiene un texto visible y una ruta"
              placeholder="/nosotros"
            />
          </EditorCard>

          {/* Links legales */}
          <EditorCard title="Links Legales" icon={Link} hint="Política de privacidad, términos, etc.">
            <LinkArrayEditor
              fieldName="legalLinks"
              label="Cada link tiene un texto visible y una ruta"
              placeholder="/privacidad"
            />
          </EditorCard>

          {/* Textos de copyright */}
          <EditorCard title="Textos Finales" icon={Copyright} hint="Textos al pie del footer">
            <div className="flex flex-col gap-4">
              <FormField label="Texto de copyright" htmlFor="copyrightText">
                <input
                  id="copyrightText"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("copyrightText")}
                  placeholder="© 2026 Dra. Yasmin Medrano Avila — Todos los derechos reservados."
                />
              </FormField>
              <FormField label='Texto "Diseñado con..."' htmlFor="designedByText">
                <input
                  id="designedByText"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("designedByText")}
                  placeholder="Diseñado con ❤️ para tu bienestar y belleza."
                />
              </FormField>
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
    </FormikProvider>
  )
}
