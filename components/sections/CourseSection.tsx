"use client"
import type { SafeHtml } from "@/lib/html/safe-html"
import { m } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { LinkButton } from "@/components/ui/Button"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { FaqPrompt } from "@/components/ui/FaqPrompt"
import { useWhatsApp } from "@/components/providers/WhatsAppProvider"
import type { CourseModule } from "@/types"
import Link from "next/link"

export interface TreatmentsPageInfo {
  label: string
  title: string
  /** Se inyecta como HTML: llega limpio desde `lib/content/parse/treatments-page.ts`. */
  subtitle: SafeHtml
  consultationTitle: string
  consultationItems: string[]
  doctorImage: string
  ctaTitle: string
  ctaSubtitle: string
  buttonText: string
  disclaimer: string
}

interface CourseSectionProps {
  modules: CourseModule[]
  /** Del panel o su respaldo entero (lib/content/treatments-page.ts). */
  info: TreatmentsPageInfo
}

export function ServiceSection({ modules, info }: CourseSectionProps) {
  const { url: whatsappUrl } = useWhatsApp()
  // Textos tal cual (vacío = oculto).
  const {
    label: eyebrow, title, subtitle, consultationTitle, doctorImage,
    ctaTitle, ctaSubtitle, buttonText, disclaimer,
  } = info
  const consultationItems = info.consultationItems.map((text) => ({ text, Icon: CheckCircle }))

  return (
    <section id="tratamientos" className="py-20 px-6" style={{ backgroundColor: "var(--primary-darkest)" }}>
      <div className="container-xl">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            light
          />
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Included + Modules */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {consultationTitle && (
              <h3 className="text-2xl font-bold mb-8 text-white">{consultationTitle}</h3>
            )}
            {consultationItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {consultationItems.map(({ text, Icon }, i) => (
                  <div key={`${text}-${i}`} className="flex items-center gap-3">
                    <Icon size={20} style={{ color: "oklch(52% 0.16 35)" }} className="shrink-0" />
                    <span className="text-sm" style={{ color: "#fce4ec" }}>{text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Servicio sin tratamientos activos = recuadro oculto. */}
            {modules.length > 0 && (
            <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--primary-darker)", border: "1px solid rgba(184,151,59,0.25)" }}>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: "var(--meteorite)" }}>
                Tratamientos Disponibles
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {modules.map((mod) => (
                  <li key={mod.treatmentId} className="flex items-start gap-2 text-sm" style={{ color: "#fce4ec" }}>
                    <span style={{ color: "var(--vintage-gold)" }} aria-hidden="true">›</span>
                    {/* Sin slug no hay tratamiento al que llevar —pasa con los
                        módulos de respaldo del contenido—, y un enlace a
                        `/tratamientos/` deja al visitante donde ya estaba. */}
                    {mod.treatmentSlug ? (
                      <Link
                        href={`/tratamientos/${mod.treatmentSlug}`}
                        className="inline-flex items-center gap-4 text-xs font-medium hover:opacity-80 transition-opacity py-2 -my-2"
                      >
                        {mod.title}
                      </Link>
                    ) : (
                      <span className="text-xs font-medium py-2 -my-2">{mod.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            )}
          </m.div>

          {/* Consultation card */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full"
              style={{ backgroundColor: "var(--primary-darker)" }}
            >
              <div className="p-8 text-center">
                {doctorImage && (
                <div className="relative w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden" style={{ backgroundColor: "var(--primary-darkest)" }}>
                  <ImageWithFallback
                    src={doctorImage}
                    alt="Dra. Yasmin Medrano Avila - Agenda tu consulta de valoracion de medicina estetica"
                    variant="dark"
                    className="object-cover"
                    objectPosition="top"
                    loading="lazy"
                    fill
                    sizes="96px"
                  />
                </div>
                )}
                {ctaTitle && <h4 className="text-2xl font-bold text-white mb-2">{ctaTitle}</h4>}
                {ctaSubtitle && (
                  <p className="text-sm mb-6" style={{ color: "var(--meteorite)" }}>
                    {ctaSubtitle}
                  </p>
                )}
                <FaqPrompt className="mb-8" />
                {buttonText && (
                  <LinkButton href={whatsappUrl} variant="primary" className="w-full justify-center py-4">
                    {buttonText}
                  </LinkButton>
                )}
                {disclaimer && (
                  <p className="text-xs mt-4" style={{ color: "var(--gray-mid)" }}>
                    {disclaimer}
                  </p>
                )}
              </div>
            </div>
          </m.div>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <LinkButton href={whatsappUrl} variant="warning" className="px-12">
            AGENDA TU CITA AHORA
          </LinkButton>
        </m.div>
      </div>
    </section>
  )
}
