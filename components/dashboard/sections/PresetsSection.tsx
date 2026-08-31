"use client"
import { Plus, Trash2 } from "lucide-react"
import { FormField } from "@/components/ui/FormField"
import { INPUT, type SectionProps } from "./types"

export function PresetsSection({ data, setData }: SectionProps) {
  function update(i: number, field: string, value: string) {
    const presets = [...data.presets]
    presets[i] = { ...presets[i], [field]: value }
    setData({ ...data, presets })
  }

  function add() {
    setData({ ...data, presets: [...data.presets, { name: "", description: "", tag: "", tagColor: "#B8973B" }] })
  }

  function remove(i: number) {
    setData({ ...data, presets: data.presets.filter((_, idx) => idx !== i) })
  }

  return (
    <>
      {data.presets.map((preset, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Tratamiento #{i + 1}</span>
            <button
              onClick={() => remove(i)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={13} />
              Eliminar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nombre">
              <input className={INPUT} value={preset.name} onChange={(e) => update(i, "name", e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Etiqueta">
                <input className={INPUT} value={preset.tag} onChange={(e) => update(i, "tag", e.target.value)} />
              </FormField>
              <FormField label="Color" htmlFor={`preset-color-${i}`}>
                <div className="flex items-center gap-2">
                  <input
                    id={`preset-color-${i}`}
                    type="color"
                    value={preset.tagColor}
                    onChange={(e) => update(i, "tagColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                  />
                  <span className="text-xs text-gray-400 font-mono">{preset.tagColor}</span>
                </div>
              </FormField>
            </div>
          </div>
          <FormField label="Descripcion">
            <input className={INPUT} value={preset.description} onChange={(e) => update(i, "description", e.target.value)} />
          </FormField>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed text-sm dash-dashed-add transition-colors"
      >
        <Plus size={16} />
        Anadir tratamiento
      </button>
    </>
  )
}
