"use client"
import { Plus, Trash2 } from "lucide-react"
import { FormField } from "@/components/ui/FormField"
import { INPUT, type SectionProps } from "./types"

export function ValueSection({ data, setData }: SectionProps) {
  function update(i: number, field: string, value: string) {
    const features = [...data.valueFeatures]
    features[i] = { ...features[i], [field]: value }
    setData({ ...data, valueFeatures: features })
  }

  function add() {
    setData({
      ...data,
      valueFeatures: [...data.valueFeatures, { iconName: "Eye", title: "", description: "" }],
    })
  }

  function remove(i: number) {
    setData({ ...data, valueFeatures: data.valueFeatures.filter((_, idx) => idx !== i) })
  }

  return (
    <>
      {data.valueFeatures.map((f, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Feature #{i + 1}</span>
            <button
              onClick={() => remove(i)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={13} />
              Eliminar
            </button>
          </div>
          <FormField label="Icono (nombre Lucide)">
            <input className={INPUT} value={f.iconName} onChange={(e) => update(i, "iconName", e.target.value)} />
          </FormField>
          <FormField label="Titulo">
            <input className={INPUT} value={f.title} onChange={(e) => update(i, "title", e.target.value)} />
          </FormField>
          <FormField label="Descripcion">
            <input className={INPUT} value={f.description} onChange={(e) => update(i, "description", e.target.value)} />
          </FormField>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
      >
        <Plus size={16} />
        Anadir feature
      </button>
    </>
  )
}
