"use client"
import { motion } from "framer-motion"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { LinkButton } from "@/components/ui/Button"
import { Badge } from "../ui/Badge"

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
          initial={{ opacity: 0, y: 30 }}
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
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xl font-bold mb-6 pb-2 border-b"
              style={{ color: "#c9a96e", borderColor: "#5c1f35" }}
            >
              {category}
            </motion.h3>
              ) : (<></>)}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTreatmentData.map((treatment, i) => (
                <motion.div
                  key={treatment.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="rounded-2xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: "#3a0f20" }}
                >
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={treatment.imageUrl || FALLBACK_IMAGE}
                      alt={`${treatment.name} - Dra. Yasmin Medrano Avila`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={192}
                      onError={(e) => {
                        const img = e.currentTarget
                        if (img.src !== window.location.origin + FALLBACK_IMAGE) {
                          img.src = FALLBACK_IMAGE
                        }
                      }}
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-1 ">
                    <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white text-base mb-2 leading-snug">
                      {treatment.name}
                    </h4>
                                        {/* <Badge label={preset.tag} color={preset.tagColor} /> */}
                    {treatment.tag && (
                      <Badge label={treatment.tag} color={resolveTagColor(treatment.tag)} />
                    )}
                    </div>

                    {treatment.description && (
                      <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "#e8a0b4" }}>
                        {treatment.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: "#5c1f35" }}>
                      <span className="text-lg font-bold" style={{ color: "#c9a96e" }}>
                        {treatment.price > 0
                          ? `Bs. ${treatment.price.toLocaleString("es-BO")}`
                          : "Consultar precio"}
                      </span>
                      <a
                        href={`https://wa.me/59178751894?text=Hola%2C%20me%20interesa%20el%20tratamiento%20de%20${encodeURIComponent(treatment.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: "#5c1f35", color: "#fce4ec" }}
                      >
                        Consultar
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-8"
        >
          <LinkButton href="https://wa.me/59178751894" variant="primary" className="px-12">
            AGENDA TU CONSULTA GRATUITA
          </LinkButton>
        </motion.div>
      </div>
    </section>
  )
}
