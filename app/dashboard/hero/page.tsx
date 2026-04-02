"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import type { ContentStore } from "@/types/content"

type HeroData = Pick<ContentStore, "promoBanner" | "heroStats" | "heroCTAs">

export default function HeroEditorPage() {
  const [data, setData] = useState<HeroData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/content")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch content")
        return r.json()
      })
      .then((c: ContentStore) =>
        setData({ promoBanner: c.promoBanner, heroStats: c.heroStats, heroCTAs: c.heroCTAs })
      )
      .catch(() => setError("No se pudo cargar el contenido."))
  }, [])

  async function handleSave() {
    if (!data) return
    setSaving(true)
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (error) return <div className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</div>
  if (!data) return <div className="text-gray-400 text-sm">Cargando...</div>

  return (
    <>
      <PageHeader
        title="Hero"
        description="Edita el banner promocional, estadísticas y botones del hero."
        saving={saving}
        saved={saved}
        onSave={handleSave}
      />

      <div className="flex flex-col gap-6">
        {/* Promo Banner */}
        <EditorCard title="Banner promocional" description="Aparece en la parte superior de la página.">
          <FormField label="Texto del banner" htmlFor="banner-text">
            <input
              id="banner-text"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              value={data.promoBanner.text}
              onChange={(e) =>
                setData({ ...data, promoBanner: { ...data.promoBanner, text: e.target.value } })
              }
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Texto del CTA" htmlFor="banner-cta-label">
              <input
                id="banner-cta-label"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={data.promoBanner.ctaLabel}
                onChange={(e) =>
                  setData({ ...data, promoBanner: { ...data.promoBanner, ctaLabel: e.target.value } })
                }
              />
            </FormField>
            <FormField label="Href del CTA" htmlFor="banner-cta-href">
              <input
                id="banner-cta-href"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={data.promoBanner.ctaHref}
                onChange={(e) =>
                  setData({ ...data, promoBanner: { ...data.promoBanner, ctaHref: e.target.value } })
                }
              />
            </FormField>
          </div>
        </EditorCard>

        {/* Stats */}
        <EditorCard title="Estadísticas" description="Los tres números que aparecen al fondo del hero.">
          {data.heroStats.map((stat, i) => (
            <div key={i} className="grid grid-cols-2 gap-4 items-end">
              <FormField label={`Valor #${i + 1}`}>
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  value={stat.value}
                  onChange={(e) => {
                    const stats = [...data.heroStats]
                    stats[i] = { ...stats[i], value: e.target.value }
                    setData({ ...data, heroStats: stats })
                  }}
                />
              </FormField>
              <FormField label="Etiqueta">
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  value={stat.label}
                  onChange={(e) => {
                    const stats = [...data.heroStats]
                    stats[i] = { ...stats[i], label: e.target.value }
                    setData({ ...data, heroStats: stats })
                  }}
                />
              </FormField>
            </div>
          ))}
        </EditorCard>

        {/* CTAs */}
        <EditorCard title="Botones (CTAs)" description="Los botones de acción del hero.">
          {data.heroCTAs.map((cta, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <FormField label={`Texto botón #${i + 1}`}>
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  value={cta.label}
                  onChange={(e) => {
                    const ctas = [...data.heroCTAs]
                    ctas[i] = { ...ctas[i], label: e.target.value }
                    setData({ ...data, heroCTAs: ctas })
                  }}
                />
              </FormField>
              <FormField label="Href">
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  value={cta.href}
                  onChange={(e) => {
                    const ctas = [...data.heroCTAs]
                    ctas[i] = { ...ctas[i], href: e.target.value }
                    setData({ ...data, heroCTAs: ctas })
                  }}
                />
              </FormField>
            </div>
          ))}
        </EditorCard>
      </div>
    </>
  )
}
