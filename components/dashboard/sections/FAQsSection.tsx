"use client"
import { Plus, Trash2 } from "lucide-react"
import { FormField } from "@/components/ui/FormField"
import { Textarea } from "@/components/ui/Textarea"
import { INPUT, type SectionProps } from "./types"

export function FAQsSection({ data, setData }: SectionProps) {
  function update(i: number, field: "question" | "answer", value: string) {
    const faqs = [...data.faqs]
    faqs[i] = { ...faqs[i], [field]: value }
    setData({ ...data, faqs })
  }

  function add() {
    setData({ ...data, faqs: [...data.faqs, { question: "", answer: "" }] })
  }

  function remove(i: number) {
    setData({ ...data, faqs: data.faqs.filter((_, idx) => idx !== i) })
  }

  return (
    <>
      {data.faqs.map((faq, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Pregunta #{i + 1}</span>
            <button
              onClick={() => remove(i)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={13} />
              Eliminar
            </button>
          </div>
          <FormField label="Pregunta">
            <input className={INPUT} value={faq.question} onChange={(e) => update(i, "question", e.target.value)} placeholder="Cual es tu pregunta?" />
          </FormField>
          <FormField label="Respuesta">
            <Textarea value={faq.answer} onChange={(e) => update(i, "answer", e.target.value)} placeholder="Escribe la respuesta aqui..." rows={3} />
          </FormField>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
      >
        <Plus size={16} />
        Anadir pregunta
      </button>
    </>
  )
}
