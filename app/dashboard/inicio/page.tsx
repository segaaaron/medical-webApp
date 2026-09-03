"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState } from "react"
import { useFormik, FormikProvider } from "formik"
import * as Yup from "yup"
import { Sparkles, BarChart2, HelpCircle, Plus, Trash2, GripVertical } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { SaveBar } from "@/components/dashboard/SaveBar"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { useToast } from "@/components/dashboard/Toast"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[var(--vintage-gold)] focus:ring-1 focus:ring-[var(--vintage-gold)] transition-colors"

const INPUT_ERROR_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-red-400 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"

interface FaqItem {
  question: string
  answer: string
}

interface HomeForm {
  specialties: string
  doctorName: string
  subtitle: string
  description: string
  highlightedText: string
  btn1Text: string
  btn2Text: string
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
  stat3Value: string
  stat3Label: string
  faqSectionLabel: string
  faqTitle: string
  faqs: FaqItem[]
}

const EMPTY: HomeForm = {
  specialties: "",
  doctorName: "",
  subtitle: "",
  description: "",
  highlightedText: "",
  btn1Text: "",
  btn2Text: "",
  stat1Value: "",
  stat1Label: "",
  stat2Value: "",
  stat2Label: "",
  stat3Value: "",
  stat3Label: "",
  faqSectionLabel: "",
  faqTitle: "",
  faqs: [],
}

const homeSchema = Yup.object({
  doctorName: Yup.string()
    .min(5, "El nombre debe tener al menos 5 caracteres")
    .required("El nombre del doctor es obligatorio"),
  specialties: Yup.string()
    .min(5, "La especialidad debe tener al menos 5 caracteres")
    .required("La especialidad es obligatoria"),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackend(raw: any): HomeForm {
  return {
    specialties: raw.specialties ?? "",
    doctorName: raw.doctorName ?? "",
    subtitle: raw.subtitle ?? "",
    description: raw.description ?? "",
    highlightedText: raw.highlightedText ?? "",
    btn1Text: raw.btn1Text ?? "",
    btn2Text: raw.btn2Text ?? "",
    stat1Value: raw.stat1Value ?? "",
    stat1Label: raw.stat1Label ?? "",
    stat2Value: raw.stat2Value ?? "",
    stat2Label: raw.stat2Label ?? "",
    stat3Value: raw.stat3Value ?? "",
    stat3Label: raw.stat3Label ?? "",
    faqSectionLabel: raw.faqSectionLabel ?? "",
    faqTitle: raw.faqTitle ?? "",
    faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FaqDndList({ formik }: { formik: any }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const faqs: FaqItem[] = formik.values.faqs
  const ids = faqs.map((_, i) => `faq-${i}`)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    formik.setFieldValue("faqs", arrayMove(faqs, oldIndex, newIndex))
  }

  return (
    <div className="flex flex-col gap-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {faqs.map((_, i) => (
            <SortableFAQItem
              key={ids[i]}
              id={ids[i]}
              index={i}
              inputCls={INPUT_CLS}
              formik={formik}
              onRemove={() => {
                const updated = faqs.filter((_, idx) => idx !== i)
                formik.setFieldValue("faqs", updated)
              }}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={() => formik.setFieldValue("faqs", [...faqs, { question: "", answer: "" }])}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-[var(--vintage-gold)] hover:text-[var(--vintage-gold)] transition-colors"
      >
        <Plus size={16} />
        Añadir pregunta
      </button>
    </div>
  )
}

function SortableFAQItem({
  id,
  index,
  inputCls,
  formik,
  onRemove,
}: {
  id: string
  index: number
  inputCls: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: any
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors touch-none"
          >
            <GripVertical size={16} />
          </button>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Pregunta #{index + 1}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 size={13} />
          Eliminar
        </button>
      </div>
      <FormField label="Pregunta" htmlFor={`faqs[${index}].question`}>
        <input
          id={`faqs[${index}].question`}
          className={inputCls}
          {...formik.getFieldProps(`faqs[${index}].question`)}
          placeholder="¿Cuál es tu pregunta?"
        />
      </FormField>
      <FormField label="Respuesta" htmlFor={`faqs[${index}].answer`}>
        <textarea
          id={`faqs[${index}].answer`}
          className={inputCls}
          rows={3}
          {...formik.getFieldProps(`faqs[${index}].answer`)}
          placeholder="Escribe la respuesta aquí..."
        />
      </FormField>
    </div>
  )
}

export default function DashboardHomePage() {
  const showToast = useToast()
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const formik = useFormik<HomeForm>({
    initialValues: EMPTY,
    validationSchema: homeSchema,
    validateOnMount: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await guardedFetch("/api/home", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        if (updated && !updated.error) formik.resetForm({ values: fromBackend(updated) })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        showToast("success", "¡Inicio guardado exitosamente!")
      } catch {
        showToast("error", "No se pudo guardar. Intenta de nuevo.")
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) formik.resetForm({ values: fromBackend(data) })
      })
      .catch(() => {
        showToast("error", "No se pudo conectar al servidor.")
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function inputCls(field: keyof HomeForm) {
    const touched = formik.touched[field]
    const error = formik.errors[field]
    return touched && error ? INPUT_ERROR_CLS : INPUT_CLS
  }

  if (loading) return null

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} noValidate>
        <PageHeader
          title="Contenido del Home"
          description="Edita las secciones de la página de inicio."
        />

        <div className="flex flex-col gap-6">
          {/* Hero */}
          <EditorCard title="Hero" icon={Sparkles} hint="Sección principal de la página de inicio">
            <div className="flex flex-col gap-4">
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

              <FormField label={<>Especialidades <span className="text-red-500">*</span></>} htmlFor="specialties">
                <input
                  id="specialties"
                  className={inputCls("specialties")}
                  {...formik.getFieldProps("specialties")}
                  placeholder="MEDICINA ESTÉTICA · REJUVENECIMIENTO · TRATAMIENTOS CORPORALES"
                />
                {formik.touched.specialties && formik.errors.specialties && (
                  <p className="text-xs text-red-500 mt-1">{formik.errors.specialties}</p>
                )}
              </FormField>

              <FormField label="Subtítulo" htmlFor="subtitle">
                <input
                  id="subtitle"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("subtitle")}
                  placeholder="Medicina Estética Avanzada"
                />
              </FormField>

              <FormField label="Descripción" htmlFor="description">
                <textarea
                  id="description"
                  className={INPUT_CLS}
                  rows={3}
                  {...formik.getFieldProps("description")}
                  placeholder="Realza tu belleza natural con tratamientos seguros y efectivos..."
                />
              </FormField>

              <FormField
                label="Texto resaltado"
                htmlFor="highlightedText"
                hint="Debe ser un fragmento exacto del texto de descripción"
              >
                <input
                  id="highlightedText"
                  className={INPUT_CLS}
                  {...formik.getFieldProps("highlightedText")}
                  placeholder="tratamientos seguros y efectivos"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Texto botón primario" htmlFor="btn1Text">
                  <input
                    id="btn1Text"
                    className={INPUT_CLS}
                    {...formik.getFieldProps("btn1Text")}
                    placeholder="VER TRATAMIENTOS"
                  />
                </FormField>
                <FormField label="Texto botón secundario" htmlFor="btn2Text">
                  <input
                    id="btn2Text"
                    className={INPUT_CLS}
                    {...formik.getFieldProps("btn2Text")}
                    placeholder="AGENDA TU CITA"
                  />
                </FormField>
              </div>
            </div>
          </EditorCard>

          {/* Stats */}
          <EditorCard title="Estadísticas" icon={BarChart2} hint="Números destacados del hero">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([1, 2, 3] as const).map((n) => (
                <div key={n} className="flex flex-col gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estadística {n}</p>
                  <FormField label="Valor" htmlFor={`stat${n}Value`}>
                    <input
                      id={`stat${n}Value`}
                      className={INPUT_CLS}
                      {...formik.getFieldProps(`stat${n}Value`)}
                      placeholder="10+"
                    />
                  </FormField>
                  <FormField label="Etiqueta" htmlFor={`stat${n}Label`}>
                    <input
                      id={`stat${n}Label`}
                      className={INPUT_CLS}
                      {...formik.getFieldProps(`stat${n}Label`)}
                      placeholder="AÑOS DE EXPERIENCIA"
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </EditorCard>

          {/* FAQs */}
          <EditorCard title="Preguntas Frecuentes" icon={HelpCircle} hint="Sección de preguntas y respuestas">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Etiqueta de sección" htmlFor="faqSectionLabel">
                  <input
                    id="faqSectionLabel"
                    className={INPUT_CLS}
                    {...formik.getFieldProps("faqSectionLabel")}
                    placeholder="¿TIENES PREGUNTAS?"
                  />
                </FormField>
                <FormField label="Título de sección" htmlFor="faqTitle">
                  <input
                    id="faqTitle"
                    className={INPUT_CLS}
                    {...formik.getFieldProps("faqTitle")}
                    placeholder="Preguntas Frecuentes"
                  />
                </FormField>
              </div>

              <FaqDndList formik={formik} />
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
