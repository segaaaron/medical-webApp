"use client"
import { Plus, Trash2 } from "lucide-react"
import { FormField } from "@/components/ui/FormField"
import { INPUT, type SectionProps } from "./types"

export function FreePDFsSection({ data, setData }: SectionProps) {
  function update(i: number, field: string, value: string) {
    const pdfs = [...data.freePDFs]
    pdfs[i] = { ...pdfs[i], [field]: value }
    setData({ ...data, freePDFs: pdfs })
  }

  function add() {
    setData({ ...data, freePDFs: [...data.freePDFs, { title: "", description: "", icon: "FileText" }] })
  }

  function remove(i: number) {
    setData({ ...data, freePDFs: data.freePDFs.filter((_, idx) => idx !== i) })
  }

  return (
    <>
      {data.freePDFs.map((pdf, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Recurso #{i + 1}</span>
            <button
              onClick={() => remove(i)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={13} />
              Eliminar
            </button>
          </div>
          <FormField label="Titulo">
            <input className={INPUT} value={pdf.title} onChange={(e) => update(i, "title", e.target.value)} />
          </FormField>
          <FormField label="Descripcion">
            <input className={INPUT} value={pdf.description} onChange={(e) => update(i, "description", e.target.value)} />
          </FormField>
          <FormField label="Icono (nombre Lucide)">
            <input className={INPUT} value={pdf.icon} onChange={(e) => update(i, "icon", e.target.value)} />
          </FormField>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed text-sm dash-dashed-add transition-colors"
      >
        <Plus size={16} />
        Anadir recurso
      </button>
    </>
  )
}
