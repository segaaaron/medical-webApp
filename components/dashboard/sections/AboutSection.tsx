"use client"
import { Plus, Trash2 } from "lucide-react"
import { FormField } from "@/components/ui/FormField"
import { Textarea } from "@/components/ui/Textarea"
import { INPUT, type SectionProps } from "./types"

export function AboutSection({ data, setData }: SectionProps) {
  function updateBio(i: number, value: string) {
    const bio = [...data.about.bio]
    bio[i] = value
    setData({ ...data, about: { ...data.about, bio } })
  }

  function addParagraph() {
    setData({ ...data, about: { ...data.about, bio: [...data.about.bio, ""] } })
  }

  function removeParagraph(i: number) {
    setData({ ...data, about: { ...data.about, bio: data.about.bio.filter((_, idx) => idx !== i) } })
  }

  function updateStat(i: number, field: "value" | "label", value: string) {
    const stats = [...data.about.stats]
    stats[i] = { ...stats[i], [field]: value }
    setData({ ...data, about: { ...data.about, stats } })
  }

  return (
    <>
      <h3 className="text-sm font-semibold text-gray-600">Biografia</h3>
      {data.about.bio.map((para, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex-1">
            <Textarea
              value={para}
              onChange={(e) => updateBio(i, e.target.value)}
              rows={3}
              placeholder={`Parrafo ${i + 1}...`}
            />
          </div>
          <button
            onClick={() => removeParagraph(i)}
            className="text-red-400 hover:text-red-600 transition-colors shrink-0 mt-3"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={addParagraph}
        className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-700 transition-colors"
      >
        <Plus size={15} />
        Anadir parrafo
      </button>

      <h3 className="text-sm font-semibold text-gray-600 mt-2">Estadisticas</h3>
      {data.about.stats.map((stat, i) => (
        <div key={i} className="grid grid-cols-2 gap-4">
          <FormField label={`Valor #${i + 1}`}>
            <input className={INPUT} value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} />
          </FormField>
          <FormField label="Etiqueta">
            <input className={INPUT} value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} />
          </FormField>
        </div>
      ))}
    </>
  )
}
