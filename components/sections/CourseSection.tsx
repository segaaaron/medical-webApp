"use client"
import { m } from "framer-motion"
import { CheckCircle, Play, FileText, Download } from "lucide-react"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { LinkButton } from "@/components/ui/Button"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { FaqPrompt } from "@/components/ui/FaqPrompt"
import { useWhatsApp } from "@/components/providers/WhatsAppProvider"
import type { CourseIncluded, CourseModule, CourseItemIcon } from "@/types"
import Link from "next/link"

// Icon map — resolved client-side, not serialized across the boundary
const ICON_MAP: Record<CourseItemIcon, React.ElementType> = {
  Play,
  FileText,
  Download,
  CheckCircle,
}

export interface TreatmentsPageInfo {
  label?: string
  title?: string
  subtitle?: string
  consultationTitle?: string
  consultationItems?: string[]
  doctorImage?: string
  ctaTitle?: string
  ctaSubtitle?: string
  buttonText?: string
  disclaimer?: string
}

interface CourseSectionProps {
  included: CourseIncluded[]
  modules: CourseModule[]
  info?: TreatmentsPageInfo
}

export function ServiceSection({ included, modules, info }: CourseSectionProps) {
  const { url: whatsappUrl } = useWhatsApp()
  const eyebrow = info?.label || "Nuestros Servicios"
  const title = info?.title || "Tratamientos de Medicina Estética"
  const subtitle = info?.subtitle ||
    "Ofrecemos una amplia gama de tratamientos faciales y corporales con <span style='color:var(--vintage-gold);font-weight:700;'>tecnología de vanguardia</span> y los más altos estándares de seguridad médica."
  const consultationTitle = info?.consultationTitle || "Lo Que Incluye Cada Consulta"
  const doctorImage = info?.doctorImage || "/images/draMedrano2.jpeg"
  const ctaTitle = info?.ctaTitle || "Agenda tu Cita"
  const ctaSubtitle = info?.ctaSubtitle || "Consulta personalizada con la Dra. Yasmin"
  const buttonText = info?.buttonText || "RESERVAR MI CONSULTA"
  const disclaimer = info?.disclaimer || "Sin compromiso · Atención personalizada garantizada"

  // Use site-content consultationItems (strings) if provided, otherwise fall back to static included[]
  const hasInfoItems = Array.isArray(info?.consultationItems) && info.consultationItems.length > 0

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
            <h3 className="text-2xl font-bold mb-8 text-white">{consultationTitle}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {hasInfoItems
                ? info!.consultationItems!.map((text) => (
                    <div key={text} className="flex items-center gap-3">
                      <CheckCircle size={20} style={{ color: "oklch(52% 0.16 35)" }} className="shrink-0" />
                      <span className="text-sm" style={{ color: "#fce4ec" }}>{text}</span>
                    </div>
                  ))
                : included.map((item) => {
                    const Icon = ICON_MAP[item.iconName]
                    return (
                      <div key={item.text} className="flex items-center gap-3">
                        <Icon size={20} style={{ color: "oklch(52% 0.16 35)" }} className="shrink-0" />
                        <span className="text-sm" style={{ color: "#fce4ec" }}>
                          {item.text}
                        </span>
                      </div>
                    )
                  })
              }
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--primary-darker)", border: "1px solid rgba(184,151,59,0.25)" }}>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: "var(--meteorite)" }}>
                Tratamientos Disponibles
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {modules.map((mod) => (
                  <li key={mod.treatmentId} className="flex items-start gap-2 text-sm" style={{ color: "#fce4ec" }}>
                    <span style={{ color: "var(--vintage-gold)" }}>›</span>
                      <Link href={`/tratamientos/${mod.treatmentSlug ?? ""}`}
                      className="inline-flex items-center gap-4 text-xs font-medium hover:opacity-80 transition-opacity py-2 -my-2"
                      >
                        {mod.title}
                      </Link>
                  </li>
                ))}
              </ul>
            </div>
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
                <div className="relative w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden" style={{ backgroundColor: "var(--primary-darkest)" }}>
                  <ImageWithFallback
                    src={doctorImage}
                    alt="Dra. Yasmin Medrano Avila - Agenda tu consulta de valoracion gratuita de medicina estetica"
                    variant="dark"
                    className="object-cover"
                    objectPosition="top"
                    loading="lazy"
                    fill
                    sizes="96px"
                  />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">{ctaTitle}</h4>
                <p className="text-sm mb-6" style={{ color: "var(--meteorite)" }}>
                  {ctaSubtitle}
                </p>
                <FaqPrompt className="mb-8" />
                <LinkButton href={whatsappUrl} variant="primary" className="w-full justify-center py-4">
                  {buttonText}
                </LinkButton>
                <p className="text-xs mt-4" style={{ color: "var(--gray-mid)" }}>
                  {disclaimer}
                </p>
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
