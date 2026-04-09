"use client"
import { FormField } from "@/components/ui/FormField"
import { Textarea } from "@/components/ui/Textarea"
import { INPUT, type SectionProps } from "./types"

export function PromoSection({ data, setData }: SectionProps) {
  function updateBanner(field: string, value: string) {
    setData({ ...data, promoBanner: { ...data.promoBanner, [field]: value } })
  }

  function updatePopup(field: string, value: string) {
    setData({ ...data, promoPopup: { ...data.promoPopup, [field]: value } })
  }

  return (
    <>
      {/* Contenido del popup */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Emoji" htmlFor="popup-emoji">
          <input id="popup-emoji" className={INPUT} value={data.promoPopup.emoji} onChange={(e) => updatePopup("emoji", e.target.value)} />
        </FormField>
        <FormField label="Etiqueta" htmlFor="popup-label" hint='Ej: "Promoción Especial · MedSkin"'>
          <input id="popup-label" className={INPUT} value={data.promoPopup.label} onChange={(e) => updatePopup("label", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Título" htmlFor="popup-title">
        <input id="popup-title" className={INPUT} value={data.promoPopup.title} onChange={(e) => updatePopup("title", e.target.value)} />
      </FormField>
      <FormField label="Descripción" htmlFor="popup-desc">
        <Textarea id="popup-desc" value={data.promoPopup.description} onChange={(e) => updatePopup("description", e.target.value)} rows={2} />
      </FormField>
      <FormField label="Ubicación" htmlFor="popup-location" hint='Ej: "Dra. Yasmin · Ciudad Cochabamba"'>
        <input id="popup-location" className={INPUT} value={data.promoPopup.location} onChange={(e) => updatePopup("location", e.target.value)} />
      </FormField>

      {/* CTA principal */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Texto del botón CTA" htmlFor="popup-cta-label">
          <input id="popup-cta-label" className={INPUT} value={data.promoPopup.ctaLabel} onChange={(e) => updatePopup("ctaLabel", e.target.value)} />
        </FormField>
        <FormField label="Href del CTA" htmlFor="popup-cta-href">
          <input id="popup-cta-href" className={INPUT} value={data.promoPopup.ctaHref} onChange={(e) => updatePopup("ctaHref", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Texto del botón de cerrar" htmlFor="popup-dismiss" hint='Ej: "Quizás después"'>
        <input id="popup-dismiss" className={INPUT} value={data.promoPopup.dismissLabel} onChange={(e) => updatePopup("dismissLabel", e.target.value)} />
      </FormField>

      {/* Banner de texto (barra superior) */}
      <div className="border-t border-gray-100 pt-4 mt-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Barra de texto superior</p>
        <FormField label="Texto del banner" htmlFor="banner-text">
          <input
            id="banner-text"
            className={INPUT}
            value={data.promoBanner.text}
            onChange={(e) => updateBanner("text", e.target.value)}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <FormField label="Texto del CTA" htmlFor="banner-cta-label">
            <input
              id="banner-cta-label"
              className={INPUT}
              value={data.promoBanner.ctaLabel}
              onChange={(e) => updateBanner("ctaLabel", e.target.value)}
            />
          </FormField>
          <FormField label="Href del CTA" htmlFor="banner-cta-href">
            <input
              id="banner-cta-href"
              className={INPUT}
              value={data.promoBanner.ctaHref}
              onChange={(e) => updateBanner("ctaHref", e.target.value)}
            />
          </FormField>
        </div>
      </div>
    </>
  )
}
