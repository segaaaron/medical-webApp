"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { Textarea } from "@/components/ui/Textarea"
import type { ContentStore, AboutContent } from "@/types/content"

export default function AboutEditorPage() {
  const [about, setAbout] = useState<AboutContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((c: ContentStore) => setAbout(c.about))
  }, [])

  function updateBio(i: number, value: string) {
    if (!about) return
    const bio = [...about.bio]
    bio[i] = value
    setAbout({ ...about, bio })
  }

  function addParagraph() {
    if (!about) return
    setAbout({ ...about, bio: [...about.bio, ""] })
  }

  function removeParagraph(i: number) {
    if (!about) return
    setAbout({ ...about, bio: about.bio.filter((_, idx) => idx !== i) })
  }

  function updateStat(i: number, field: "value" | "label", value: string) {
    if (!about) return
    const stats = [...about.stats]
    stats[i] = { ...stats[i], [field]: value }
    setAbout({ ...about, stats })
  }

  async function handleSave() {
    if (!about) return
    setSaving(true)
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ about }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!about) return <div className="text-gray-400 text-sm">Cargando...</div>

  return (
    <>
      <PageHeader
        title="About"
        description="Sección biográfica sobre James Nader."
        saving={saving}
        saved={saved}
        onSave={handleSave}
      />

      <div className="flex flex-col gap-6">
        {/* Bio */}
        <EditorCard title="Biografía" description="Cada bloque es un párrafo independiente.">
          <div className="flex flex-col gap-4">
            {about.bio.map((para, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-1">
                  <Textarea
                    value={para}
                    onChange={(e) => updateBio(i, e.target.value)}
                    rows={3}
                    placeholder={`Párrafo ${i + 1}...`}
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
          </div>
          <button
            onClick={addParagraph}
            className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-700 transition-colors"
          >
            <Plus size={15} />
            Añadir párrafo
          </button>
        </EditorCard>

        {/* Stats */}
        <EditorCard title="Estadísticas" description="Los tres números de la sección About.">
          {about.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <FormField label={`Valor #${i + 1}`}>
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  value={stat.value}
                  onChange={(e) => updateStat(i, "value", e.target.value)}
                />
              </FormField>
              <FormField label="Etiqueta">
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  value={stat.label}
                  onChange={(e) => updateStat(i, "label", e.target.value)}
                />
              </FormField>
            </div>
          ))}
        </EditorCard>
      </div>
    </>
  )
}
