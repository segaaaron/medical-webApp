"use client"
import { FormField } from "@/components/ui/FormField"
import { INPUT, type SectionProps } from "./types"

export function BrandingSection({ data, setData }: SectionProps) {
  function update(field: string, value: string) {
    setData({ ...data, branding: { ...data.branding, [field]: value } })
  }

  return (
    <>
      <h3 className="text-sm font-semibold text-gray-600">Datos de la Doctora</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nombre completo" htmlFor="brand-name">
          <input id="brand-name" className={INPUT} value={data.branding.doctorName} onChange={(e) => update("doctorName", e.target.value)} />
        </FormField>
        <FormField label="Especialidad" htmlFor="brand-specialty">
          <input id="brand-specialty" className={INPUT} value={data.branding.specialty} onChange={(e) => update("specialty", e.target.value)} />
        </FormField>
        <FormField label="Ciudad" htmlFor="brand-city">
          <input id="brand-city" className={INPUT} value={data.branding.city} onChange={(e) => update("city", e.target.value)} />
        </FormField>
      </div>

      <h3 className="text-sm font-semibold text-gray-600 mt-2">WhatsApp</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Numero (visible)" htmlFor="brand-wa-number" hint="Ej: +591 78751894">
          <input id="brand-wa-number" className={INPUT} value={data.branding.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} />
        </FormField>
        <FormField label="URL de WhatsApp" htmlFor="brand-wa-url" hint="Ej: https://wa.me/59178751894">
          <input id="brand-wa-url" className={INPUT} value={data.branding.whatsappUrl} onChange={(e) => update("whatsappUrl", e.target.value)} />
        </FormField>
      </div>

      <h3 className="text-sm font-semibold text-gray-600 mt-2">Hero</h3>
      <FormField label="Tagline" htmlFor="brand-tagline" hint="Texto encima del nombre en el Hero">
        <input id="brand-tagline" className={INPUT} value={data.branding.heroTagline} onChange={(e) => update("heroTagline", e.target.value)} />
      </FormField>
      <FormField label="Subtitulo del Hero" htmlFor="brand-hero-sub">
        <input id="brand-hero-sub" className={INPUT} value={data.branding.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} />
      </FormField>
      <FormField label="Imagen de fondo del Hero (URL)" htmlFor="brand-hero-bg">
        <input id="brand-hero-bg" className={INPUT} value={data.branding.heroBackgroundImage} onChange={(e) => update("heroBackgroundImage", e.target.value)} />
      </FormField>

      <h3 className="text-sm font-semibold text-gray-600 mt-2">Sobre Nosotros</h3>
      <FormField label="Imagen de la doctora (URL o ruta)" htmlFor="brand-about-img">
        <input id="brand-about-img" className={INPUT} value={data.branding.aboutImage} onChange={(e) => update("aboutImage", e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Badge - Valor" htmlFor="brand-badge-val" hint='Ej: "10+"'>
          <input id="brand-badge-val" className={INPUT} value={data.branding.aboutBadgeValue} onChange={(e) => update("aboutBadgeValue", e.target.value)} />
        </FormField>
        <FormField label="Badge - Etiqueta" htmlFor="brand-badge-label" hint='Ej: "Años de Experiencia"'>
          <input id="brand-badge-label" className={INPUT} value={data.branding.aboutBadgeLabel} onChange={(e) => update("aboutBadgeLabel", e.target.value)} />
        </FormField>
      </div>

      <h3 className="text-sm font-semibold text-gray-600 mt-2">Footer</h3>
      <FormField label="Descripcion del footer" htmlFor="brand-footer-desc">
        <input id="brand-footer-desc" className={INPUT} value={data.branding.footerDescription} onChange={(e) => update("footerDescription", e.target.value)} />
      </FormField>
      <FormField label="Texto de copyright" htmlFor="brand-copyright">
        <input id="brand-copyright" className={INPUT} value={data.branding.copyrightText} onChange={(e) => update("copyrightText", e.target.value)} />
      </FormField>
    </>
  )
}
