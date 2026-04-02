"use client"
import { motion } from "framer-motion"
import { CheckCircle, Play, FileText, Download } from "lucide-react"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { LinkButton } from "@/components/ui/Button"
import type { CourseIncluded, CourseModule, CoursePricing, CourseItemIcon } from "@/types"

// Icon map — resolved client-side, not serialized across the boundary
const ICON_MAP: Record<CourseItemIcon, React.ElementType> = {
  Play,
  FileText,
  Download,
  CheckCircle,
}

interface CourseSectionProps {
  included: CourseIncluded[]
  modules: CourseModule[]
  pricing: CoursePricing
}

export function CourseSection({ included, modules }: CourseSectionProps) {
  return (
    <section id="tratamientos" className="py-20 px-6" style={{ backgroundColor: "#3a0f20" }}>
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow="Nuestros Servicios"
            title="Tratamientos de Medicina Estética"
            subtitle="Ofrecemos una amplia gama de tratamientos faciales y corporales con <span style='color:#c9a96e;font-weight:700;'>tecnología de vanguardia</span> y los más altos estándares de seguridad médica."
            light
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Included + Modules */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-2xl font-bold mb-8 text-white">Lo Que Incluye Cada Consulta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {included.map((item) => {
                const Icon = ICON_MAP[item.iconName]
                return (
                  <div key={item.text} className="flex items-center gap-3">
                    <Icon size={20} style={{ color: "#4a9e82" }} className="shrink-0" />
                    <span className="text-sm" style={{ color: "#fce4ec" }}>
                      {item.text}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: "#5c1f35" }}>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: "#e8a0b4" }}>
                Tratamientos Disponibles
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {modules.map((mod) => (
                  <li key={mod.title} className="flex items-start gap-2 text-sm" style={{ color: "#fce4ec" }}>
                    <span style={{ color: "#c9a96e" }}>›</span>
                    {mod.title}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Consultation card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full"
              style={{ backgroundColor: "#5c1f35" }}
            >
              <div
                className="text-center py-3 text-sm font-bold uppercase tracking-wider"
                style={{ backgroundColor: "#c9a96e", color: "white" }}
              >
                ✨ Consulta de Valoración GRATIS
              </div>
              <div className="p-8 text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden" style={{ backgroundColor: "#3a0f20" }}>
                  <img
                    src="/images/draMedrano2.jpeg"
                    alt="Dra. Yasmin Medrano Avila - Agenda tu consulta de valoracion gratuita de medicina estetica"
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                    decoding="async"
                    width={96}
                    height={96}
                  />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Agenda tu Cita</h4>
                <p className="text-sm mb-6" style={{ color: "#e8a0b4" }}>
                  Consulta personalizada con la Dra. Yasmin
                </p>
                <div className="mb-2">
                  <span className="text-3xl font-bold" style={{ color: "#c9a96e" }}>
                    GRATIS
                  </span>
                </div>
                <p className="text-xs mb-8" style={{ color: "#e8a0b4" }}>
                  Valoración inicial sin costo — oferta de este mes
                </p>
                <LinkButton href="https://wa.me/59178751894" variant="primary" className="w-full justify-center py-4">
                  RESERVAR MI CONSULTA
                </LinkButton>
                <p className="text-xs mt-4" style={{ color: "#7a6570" }}>
                  Sin compromiso · Atención personalizada garantizada
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <LinkButton href="https://wa.me/59178751894" variant="warning" className="px-12">
            AGENDA TU CITA AHORA
          </LinkButton>
        </motion.div>
      </div>
    </section>
  )
}
