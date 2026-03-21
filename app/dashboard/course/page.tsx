"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import type { ContentStore } from "@/types/content"
import type { CourseModule, CoursePricing } from "@/types"

type CourseData = Pick<ContentStore, "courseModules" | "coursePricing">

export default function CourseEditorPage() {
  const [data, setData] = useState<CourseData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((c: ContentStore) =>
        setData({ courseModules: c.courseModules, coursePricing: c.coursePricing })
      )
  }, [])

  function updatePricing(field: keyof CoursePricing, value: string | number) {
    if (!data) return
    setData({ ...data, coursePricing: { ...data.coursePricing, [field]: value } })
  }

  function updateModule(i: number, title: string) {
    if (!data) return
    const mods = [...data.courseModules]
    mods[i] = { title }
    setData({ ...data, courseModules: mods })
  }

  function addModule() {
    if (!data) return
    setData({ ...data, courseModules: [...data.courseModules, { title: "" }] })
  }

  function removeModule(i: number) {
    if (!data) return
    setData({ ...data, courseModules: data.courseModules.filter((_, idx) => idx !== i) })
  }

  async function handleSave() {
    if (!data) return
    setSaving(true)
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!data) return <div className="text-gray-400 text-sm">Cargando...</div>

  return (
    <>
      <PageHeader
        title="Curso"
        description="Precios, módulos y contenido del Mono Course."
        saving={saving}
        saved={saved}
        onSave={handleSave}
      />

      <div className="flex flex-col gap-6">
        {/* Pricing */}
        <EditorCard title="Precios" description="Precios del curso.">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Moneda" hint="Símbolo, ej: £ $ €">
              <input
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={data.coursePricing.currency}
                onChange={(e) => updatePricing("currency", e.target.value)}
              />
            </FormField>
            <FormField label="Precio Early-Bird">
              <input
                type="number"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={data.coursePricing.earlyBird}
                onChange={(e) => updatePricing("earlyBird", Number(e.target.value))}
              />
            </FormField>
            <FormField label="Precio Regular">
              <input
                type="number"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={data.coursePricing.regular}
                onChange={(e) => updatePricing("regular", Number(e.target.value))}
              />
            </FormField>
            <FormField label="Ahorro">
              <input
                type="number"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={data.coursePricing.savings}
                onChange={(e) => updatePricing("savings", Number(e.target.value))}
              />
            </FormField>
          </div>
        </EditorCard>

        {/* Modules */}
        <EditorCard title="Módulos del curso" description="Lista de módulos incluidos en el curso.">
          <div className="flex flex-col gap-2">
            {data.courseModules.map((mod, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-300 w-5 shrink-0 text-right">{i + 1}</span>
                <input
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  value={mod.title}
                  onChange={(e) => updateModule(i, e.target.value)}
                  placeholder="Título del módulo"
                />
                <button
                  onClick={() => removeModule(i)}
                  className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addModule}
            className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-700 transition-colors"
          >
            <Plus size={15} />
            Añadir módulo
          </button>
        </EditorCard>
      </div>
    </>
  )
}
