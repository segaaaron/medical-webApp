"use client"
import { Plus, Trash2 } from "lucide-react"
import { FormField } from "@/components/ui/FormField"
import { INPUT, type SectionProps } from "./types"

export function CourseSection({ data, setData }: SectionProps) {
  function updatePricing(field: string, value: string | number) {
    setData({ ...data, coursePricing: { ...data.coursePricing, [field]: value } })
  }

  function updateModule(i: number, title: string) {
    const mods = [...data.courseModules]
    mods[i] = { title }
    setData({ ...data, courseModules: mods })
  }

  function addModule() {
    setData({ ...data, courseModules: [...data.courseModules, { title: "" }] })
  }

  function removeModule(i: number) {
    setData({ ...data, courseModules: data.courseModules.filter((_, idx) => idx !== i) })
  }

  function updateIncluded(i: number, field: string, value: string) {
    const items = [...data.courseIncluded]
    items[i] = { ...items[i], [field]: value }
    setData({ ...data, courseIncluded: items })
  }

  function addIncluded() {
    setData({
      ...data,
      courseIncluded: [...data.courseIncluded, { iconName: "CheckCircle", text: "" }],
    })
  }

  function removeIncluded(i: number) {
    setData({ ...data, courseIncluded: data.courseIncluded.filter((_, idx) => idx !== i) })
  }

  return (
    <>
      {/* Included items */}
      <h3 className="text-sm font-semibold text-gray-600">Incluido en la cita</h3>
      {data.courseIncluded.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-300 w-5 shrink-0 text-right">{i + 1}</span>
          <input
            className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            value={item.iconName}
            onChange={(e) => updateIncluded(i, "iconName", e.target.value)}
            placeholder="Icono"
          />
          <input
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            value={item.text}
            onChange={(e) => updateIncluded(i, "text", e.target.value)}
            placeholder="Texto"
          />
          <button onClick={() => removeIncluded(i)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={addIncluded}
        className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-700 transition-colors"
      >
        <Plus size={15} />
        Anadir item
      </button>

      {/* Modules */}
      <h3 className="text-sm font-semibold text-gray-600 mt-2">Modulos</h3>
      {data.courseModules.map((mod, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-300 w-5 shrink-0 text-right">{i + 1}</span>
          <input
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            value={mod.title}
            onChange={(e) => updateModule(i, e.target.value)}
            placeholder="Titulo del modulo"
          />
          <button onClick={() => removeModule(i)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={addModule}
        className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-700 transition-colors"
      >
        <Plus size={15} />
        Anadir modulo
      </button>

      {/* Pricing */}
      <h3 className="text-sm font-semibold text-gray-600 mt-2">Precios</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Moneda" hint="Simbolo, ej: $ MXN">
          <input className={INPUT} value={data.coursePricing.currency} onChange={(e) => updatePricing("currency", e.target.value)} />
        </FormField>
        <FormField label="Precio Early-Bird">
          <input type="number" className={INPUT} value={data.coursePricing.earlyBird} onChange={(e) => updatePricing("earlyBird", Number(e.target.value))} />
        </FormField>
        <FormField label="Precio Regular">
          <input type="number" className={INPUT} value={data.coursePricing.regular} onChange={(e) => updatePricing("regular", Number(e.target.value))} />
        </FormField>
        <FormField label="Ahorro">
          <input type="number" className={INPUT} value={data.coursePricing.savings} onChange={(e) => updatePricing("savings", Number(e.target.value))} />
        </FormField>
      </div>
    </>
  )
}
