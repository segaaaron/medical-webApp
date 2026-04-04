"use client"
import { useEffect, useState } from "react"
import { ChevronDown, Sparkles, Heart, CalendarCheck, Star, FileText, User, HelpCircle } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  HeroSection,
  ValueSection,
  CourseSection,
  PresetsSection,
  FreePDFsSection,
  AboutSection,
  FAQsSection,
} from "@/components/dashboard/sections"
import type { ContentStore } from "@/types/content"

const SECTIONS = [
  { label: "Hero", icon: Sparkles },
  { label: "Propuesta de Valor", icon: Heart },
  { label: "Agenda tu Cita", icon: CalendarCheck },
  { label: "Tratamientos Destacados", icon: Star },
  { label: "Recursos Gratuitos", icon: FileText },
  { label: "Sobre Nosotros", icon: User },
  { label: "Preguntas Frecuentes", icon: HelpCircle },
] as const

const SECTION_COMPONENTS = [
  HeroSection,
  ValueSection,
  CourseSection,
  PresetsSection,
  FreePDFsSection,
  AboutSection,
  FAQsSection,
]

export default function DashboardHomePage() {
  const [data, setData] = useState<ContentStore | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [openSection, setOpenSection] = useState(0)

  useEffect(() => {
    fetch("/api/content")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch")
        return r.json()
      })
      .then((c: ContentStore) => setData(c))
      .catch(() => setError("No se pudo cargar el contenido."))
  }, [])

  async function handleSave() {
    if (!data) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Save failed")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError("No se pudo guardar el contenido. Intenta de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  function toggle(i: number) {
    setOpenSection(openSection === i ? -1 : i)
  }

  if (error && !data) return <div className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</div>
  if (!data) return <div className="text-gray-400 text-sm">Cargando...</div>

  return (
    <>
      <PageHeader
        title="Contenido del Home"
        description="Edita todas las secciones de la página de inicio."
        saving={saving}
        saved={saved}
        onSave={handleSave}
      />

      {error && <div className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3 mb-4">{error}</div>}

      <div className="flex flex-col gap-3">
        {SECTIONS.map((section, i) => {
          const isOpen = openSection === i
          const Icon = section.icon
          const SectionComponent = SECTION_COMPONENTS[i]
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#ede9fe", color: "#673de6" }}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">
                    {i + 1}. {section.label}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex flex-col gap-6">
                  <SectionComponent data={data} setData={setData} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
