"use client"
import { FormField } from "@/components/ui/FormField"
import { INPUT, type SectionProps } from "./types"

export function HeroSection({ data, setData }: SectionProps) {
  return (
    <>
      {/* Stats */}
      <h3 className="text-sm font-semibold text-gray-600">Estadisticas del Hero</h3>
      {data.heroStats.map((stat, i) => (
        <div key={i} className="grid grid-cols-2 gap-4">
          <FormField label={`Valor #${i + 1}`}>
            <input
              className={INPUT}
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
              className={INPUT}
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

      {/* CTAs */}
      <h3 className="text-sm font-semibold text-gray-600 mt-2">Botones (CTAs)</h3>
      {data.heroCTAs.map((cta, i) => (
        <div key={i} className="grid grid-cols-3 gap-4">
          <FormField label={`Texto boton #${i + 1}`}>
            <input
              className={INPUT}
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
              className={INPUT}
              value={cta.href}
              onChange={(e) => {
                const ctas = [...data.heroCTAs]
                ctas[i] = { ...ctas[i], href: e.target.value }
                setData({ ...data, heroCTAs: ctas })
              }}
            />
          </FormField>
          <FormField label="Variante">
            <select
              className={INPUT}
              value={cta.variant}
              onChange={(e) => {
                const ctas = [...data.heroCTAs]
                ctas[i] = { ...ctas[i], variant: e.target.value as "primary" | "warning" }
                setData({ ...data, heroCTAs: ctas })
              }}
            >
              <option value="primary">Primary</option>
              <option value="warning">Warning</option>
            </select>
          </FormField>
        </div>
      ))}
    </>
  )
}
