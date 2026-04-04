"use client"
import { FormField } from "@/components/ui/FormField"
import { INPUT, type SectionProps } from "./types"

export function HeroSection({ data, setData }: SectionProps) {
  return (
    <>
      {/* Promo Banner */}
      <h3 className="text-sm font-semibold text-gray-600">Banner promocional</h3>
      <FormField label="Texto del banner" htmlFor="banner-text">
        <input
          id="banner-text"
          className={INPUT}
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
            className={INPUT}
            value={data.promoBanner.ctaLabel}
            onChange={(e) =>
              setData({ ...data, promoBanner: { ...data.promoBanner, ctaLabel: e.target.value } })
            }
          />
        </FormField>
        <FormField label="Href del CTA" htmlFor="banner-cta-href">
          <input
            id="banner-cta-href"
            className={INPUT}
            value={data.promoBanner.ctaHref}
            onChange={(e) =>
              setData({ ...data, promoBanner: { ...data.promoBanner, ctaHref: e.target.value } })
            }
          />
        </FormField>
      </div>

      {/* Stats */}
      <h3 className="text-sm font-semibold text-gray-600 mt-2">Estadisticas del Hero</h3>
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
        <div key={i} className="grid grid-cols-2 gap-4">
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
        </div>
      ))}
    </>
  )
}
