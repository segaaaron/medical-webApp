"use client"
import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { LinkButton } from "@/components/ui/Button"
import { Badge } from "../ui/Badge"
import { TiltCard } from "@/components/ui/TiltCard"
import { WHATSAPP_TREATMENT_URL, WHATSAPP_URL } from "@/lib/constants"

export interface Treatment {
  id: string
  name: string
  description: string | null
  price: number
  tag: string
  imageUrl: string | null
  active: boolean
}

interface TreatmentsGridProps {
  treatments: Treatment[]
  isHome: boolean
}

const FALLBACK_IMAGE = "/images/treatment-placeholder.svg"

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

const TAG_COLORS: Record<string, string> = {
  POPULAR:       "#b5496a",
  INNOVADOR:     "#8f3452",
  RECOMENDADO:   "#4a9e82",
  DEFINITIVO:    "#5c1f35",
  ESENCIAL:      "#c9a96e",
  ESPECIALIZADO: "#7a2a4a",
}
const DEFAULT_TAG_COLOR = "#a0336e"

function resolveTagColor(tag: string): string {
  return TAG_COLORS[tag] ?? DEFAULT_TAG_COLOR
}


export function TreatmentsGrid({ treatments,  isHome}: TreatmentsGridProps) {
  const prefersReduced = useReducedMotion()
  if (treatments.length === 0) return null

  // Group by category
  const grouped = treatments.reduce<Record<string, Treatment[]>>((acc, t) => {
    const key =  isHome ? "" : "General"
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  const currentTreatmentData = Object.entries(grouped).flatMap(a => a[1]).filter( x => x.active)

  return (
    <section className="py-20 px-6" style={{ backgroundColor: "#1a0510" }}>
      <div className="container-xl">
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow={isHome ? "Áreas de Especialidad" : "Catálogo de Servicios"}
            title={isHome ? "Algunas Categorías de Tratamiento" : "Todos Nuestros Tratamientos"}
            subtitle={isHome ? `Desde rejuvenecimiento facial hasta modelado corporal, ofrecemos soluciones estéticas integrales con <span style="color:#c9a96e;font-weight:700;">resultados visibles y duraderos.</span>` : `Encuentra el tratamiento ideal para ti. <span style="color:#c9a96e;font-weight:700;">Agenda una consulta gratuita</span> y recibe un plan personalizado.`}
            light
          />
        </motion.div>

        {Object.entries(grouped).map(([category]) => (
          <div key={category} className="mb-14">
              { !isHome ? (
            <motion.h3
              initial={prefersReduced ? false : { opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xl font-bold mb-6 pb-2 border-b"
              style={{ color: "#c9a96e", borderColor: "#5c1f35" }}
            >
              {category}
            </motion.h3>
              ) : (<></>)}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {currentTreatmentData.map((treatment, i) => (
                <TiltCard
                  key={treatment.id}
                  glowColor="#8f3452"
                  intensity={5}
                  className="rounded-2xl"
                >
                <motion.div
                  id={`treatment-${treatment.id}`}
                  initial={prefersReduced ? false : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className={`rounded-2xl overflow-hidden flex flex-row${isHome ? " cursor-pointer" : ""}`}
                  style={{ backgroundColor: "#3a0f20" }}
                  {...(isHome && {
                    onClick: () => { window.location.href = `/tratamientos#treatment-${treatment.id}` }
                  })}
                >
                  {/* Imagen */}
                  <div className="w-36 shrink-0 self-stretch bg-[#2a0a18] overflow-hidden">
                    <img
                      src={treatment.imageUrl || FALLBACK_IMAGE}
                      alt={`${treatment.name} - Dra. Yasmin Medrano Avila`}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const img = e.currentTarget
                        if (img.src !== window.location.origin + FALLBACK_IMAGE) {
                          img.src = FALLBACK_IMAGE
                        }
                      }}
                    />
                  </div>

                  {/* Contenido */}
                  <div className="p-4 flex flex-col flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-white text-sm leading-snug">
                        {treatment.name}
                      </h4>
                      {treatment.tag && (
                        <Badge label={treatment.tag} color={resolveTagColor(treatment.tag)} />
                      )}
                    </div>

                    {treatment.description && (
                      <p className="text-xs leading-relaxed mb-3 flex-1 line-clamp-3" style={{ color: "#e8a0b4" }}>
                        {stripHtml(treatment.description)}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: "#5c1f35" }}>
                      <span className="text-sm font-bold" style={{ color: "#c9a96e" }}>
                        {treatment.price > 0
                          ? `Bs. ${treatment.price.toLocaleString("es-BO")}`
                          : "Consultar precio"}
                      </span>
                      <div className="flex items-center gap-2">
                        {!isHome && (
                          <Link
                            href={`/tratamientos/${treatment.id}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                            style={{ borderColor: "#b5496a", color: "#e8a0b4" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Leer más
                          </Link>
                        )}
                        <a
                          href={WHATSAPP_TREATMENT_URL(treatment.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          style={{ backgroundColor: "#5c1f35", color: "#fce4ec" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Consultar
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
                </TiltCard>
              ))}
            </div>
          </div>
        ))}

        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-8"
        >
          <LinkButton href={WHATSAPP_URL} variant="primary" className="px-12">
            AGENDA TU CONSULTA GRATUITA
          </LinkButton>
        </motion.div>
      </div>
    </section>
  )
}
