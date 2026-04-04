"use client"
import { FormField } from "@/components/ui/FormField"
import { Textarea } from "@/components/ui/Textarea"
import { INPUT, type SectionProps } from "./types"

const HEADER_KEYS = [
  { key: "value" as const, label: "Propuesta de Valor" },
  { key: "course" as const, label: "Agenda tu Cita" },
  { key: "presets" as const, label: "Tratamientos Destacados" },
  { key: "freeResources" as const, label: "Recursos Gratuitos" },
  { key: "faq" as const, label: "Preguntas Frecuentes" },
]

export function SectionHeadersSection({ data, setData }: SectionProps) {
  function update(sectionKey: string, field: string, value: string) {
    setData({
      ...data,
      sectionHeaders: {
        ...data.sectionHeaders,
        [sectionKey]: {
          ...data.sectionHeaders[sectionKey as keyof typeof data.sectionHeaders],
          [field]: value,
        },
      },
    })
  }

  return (
    <>
      {HEADER_KEYS.map(({ key, label }) => {
        const header = data.sectionHeaders[key]
        return (
          <div key={key} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-4">
            <span className="text-xs font-medium text-gray-500">{label}</span>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Eyebrow" hint="Texto pequeño encima del titulo">
                <input className={INPUT} value={header.eyebrow} onChange={(e) => update(key, "eyebrow", e.target.value)} />
              </FormField>
              <FormField label="Titulo">
                <input className={INPUT} value={header.title} onChange={(e) => update(key, "title", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Subtitulo">
              <Textarea value={header.subtitle} onChange={(e) => update(key, "subtitle", e.target.value)} rows={2} />
            </FormField>
          </div>
        )
      })}
    </>
  )
}
