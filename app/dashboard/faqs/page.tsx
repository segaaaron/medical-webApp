"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { Textarea } from "@/components/ui/Textarea"
import type { ContentStore } from "@/types/content"
import type { FAQ } from "@/types"

export default function FAQsEditorPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/content")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch content")
        return r.json()
      })
      .then((c: ContentStore) => setFaqs(c.faqs))
      .catch(() => setError("No se pudo cargar el contenido."))
  }, [])

  function addFaq() {
    setFaqs([...faqs, { question: "", answer: "" }])
  }

  function removeFaq(i: number) {
    setFaqs(faqs.filter((_, idx) => idx !== i))
  }

  function update(i: number, field: keyof FAQ, value: string) {
    const updated = [...faqs]
    updated[i] = { ...updated[i], [field]: value }
    setFaqs(updated)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs }),
      })
      if (!res.ok) throw new Error("Save failed")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError("No se pudo guardar el contenido.")
    } finally {
      setSaving(false)
    }
  }

  if (error) return <div className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</div>

  return (
    <>
      <PageHeader
        title="FAQs"
        description="Preguntas frecuentes que aparecen al final del home."
        saving={saving}
        saved={saved}
        onSave={handleSave}
      />

      <div className="flex flex-col gap-4">
        {faqs.map((faq, i) => (
          <EditorCard key={i} title={`Pregunta #${i + 1}`}>
            <FormField label="Pregunta">
              <input
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={faq.question}
                onChange={(e) => update(i, "question", e.target.value)}
                placeholder="¿Cuál es tu pregunta?"
              />
            </FormField>
            <FormField label="Respuesta">
              <Textarea
                value={faq.answer}
                onChange={(e) => update(i, "answer", e.target.value)}
                placeholder="Escribe la respuesta aquí..."
                rows={3}
              />
            </FormField>
            <div className="flex justify-end">
              <button
                onClick={() => removeFaq(i)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={13} />
                Eliminar
              </button>
            </div>
          </EditorCard>
        ))}

        <button
          onClick={addFaq}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
        >
          <Plus size={16} />
          Añadir pregunta
        </button>
      </div>
    </>
  )
}
