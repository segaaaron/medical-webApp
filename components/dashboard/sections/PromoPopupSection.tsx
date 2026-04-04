"use client"
import { FormField } from "@/components/ui/FormField"
import { Textarea } from "@/components/ui/Textarea"
import { INPUT, type SectionProps } from "./types"

export function PromoPopupSection({ data, setData }: SectionProps) {
  function update(field: string, value: string) {
    setData({ ...data, promoPopup: { ...data.promoPopup, [field]: value } })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Emoji" htmlFor="popup-emoji">
          <input id="popup-emoji" className={INPUT} value={data.promoPopup.emoji} onChange={(e) => update("emoji", e.target.value)} />
        </FormField>
        <FormField label="Etiqueta" htmlFor="popup-label" hint='Ej: "Promoción Especial · MedSkin"'>
          <input id="popup-label" className={INPUT} value={data.promoPopup.label} onChange={(e) => update("label", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Titulo" htmlFor="popup-title">
        <input id="popup-title" className={INPUT} value={data.promoPopup.title} onChange={(e) => update("title", e.target.value)} />
      </FormField>
      <FormField label="Descripcion" htmlFor="popup-desc">
        <Textarea id="popup-desc" value={data.promoPopup.description} onChange={(e) => update("description", e.target.value)} rows={2} />
      </FormField>
      <FormField label="Ubicacion" htmlFor="popup-location" hint='Ej: "Dra. Yasmin · Ciudad Cochabamba"'>
        <input id="popup-location" className={INPUT} value={data.promoPopup.location} onChange={(e) => update("location", e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Texto del boton CTA" htmlFor="popup-cta-label">
          <input id="popup-cta-label" className={INPUT} value={data.promoPopup.ctaLabel} onChange={(e) => update("ctaLabel", e.target.value)} />
        </FormField>
        <FormField label="Href del CTA" htmlFor="popup-cta-href">
          <input id="popup-cta-href" className={INPUT} value={data.promoPopup.ctaHref} onChange={(e) => update("ctaHref", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Texto del boton de cerrar" htmlFor="popup-dismiss" hint='Ej: "Quizás después"'>
        <input id="popup-dismiss" className={INPUT} value={data.promoPopup.dismissLabel} onChange={(e) => update("dismissLabel", e.target.value)} />
      </FormField>
    </>
  )
}
