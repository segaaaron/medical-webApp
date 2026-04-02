"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import type { ContentStore } from "@/types/content"
import type { PresetCategory } from "@/types"

export default function PresetsEditorPage() {
  const [presets, setPresets] = useState<PresetCategory[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/content")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch content")
        return r.json()
      })
      .then((c: ContentStore) => setPresets(c.presets))
      .catch(() => setError("No se pudo cargar el contenido."))
  }, [])

  function addPreset() {
    setPresets([...presets, { name: "", description: "", tag: "", tagColor: "#673de6" }])
  }

  function remove(i: number) {
    setPresets(presets.filter((_, idx) => idx !== i))
  }

  function update(i: number, field: keyof PresetCategory, value: string) {
    const updated = [...presets]
    updated[i] = { ...updated[i], [field]: value }
    setPresets(updated)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presets }),
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
        title="Presets"
        description="Categorías de presets de Lightroom."
        saving={saving}
        saved={saved}
        onSave={handleSave}
      />

      <div className="flex flex-col gap-4">
        {presets.map((preset, i) => (
          <EditorCard key={i} title={`Preset #${i + 1}`}>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nombre">
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  value={preset.name}
                  onChange={(e) => update(i, "name", e.target.value)}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Etiqueta">
                  <input
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    value={preset.tag}
                    onChange={(e) => update(i, "tag", e.target.value)}
                  />
                </FormField>
                <FormField label="Color" htmlFor={`color-${i}`}>
                  <div className="flex items-center gap-2">
                    <input
                      id={`color-${i}`}
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
            <FormField label="Descripción">
              <input
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={preset.description}
                onChange={(e) => update(i, "description", e.target.value)}
              />
            </FormField>
            <div className="flex justify-end">
              <button
                onClick={() => remove(i)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={13} />
                Eliminar
              </button>
            </div>
          </EditorCard>
        ))}

        <button
          onClick={addPreset}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
        >
          <Plus size={16} />
          Añadir preset
        </button>
      </div>
    </>
  )
}
