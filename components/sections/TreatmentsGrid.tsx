"use client"
import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { LinkButton } from "@/components/ui/Button"
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

function VerticalTreatmentCard({
  treatment,
  index,
  isHome,
  prefersReduced,
}: {
  treatment: Treatment
  index: number
  isHome: boolean
  prefersReduced: boolean | null
}) {
  const [hovered, setHovered] = useState(false)
  const hasImage = !!treatment.imageUrl
  const plainDesc = treatment.description ? stripHtml(treatment.description) : ""

  return (
    <TiltCard glowColor="oklch(58% 0.16 35)" intensity={4} className="">
      <motion.div
        id={`treatment-${treatment.id}`}
        initial={prefersReduced ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.07 }}
        style={{
          position: "relative",
          aspectRatio: "3/4",
          overflow: "hidden",
          cursor: isHome ? "pointer" : "default",
          background: hasImage
            ? undefined
            : "linear-gradient(155deg, oklch(26% 0.05 50) 0%, oklch(14% 0.03 44) 100%)",
        }}
        onClick={() => {
          if (isHome) window.location.href = `/tratamientos#treatment-${treatment.id}`
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Background image */}
        {hasImage && (
          <img
            src={treatment.imageUrl!}
            alt={`${treatment.name} - Dra. Yasmin Medrano Avila`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const img = e.currentTarget
              if (img.src !== window.location.origin + FALLBACK_IMAGE) {
                img.src = FALLBACK_IMAGE
              }
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.18) 52%, transparent 100%)",
          }}
        />

        {/* Card body at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "26px 22px",
          }}
        >
          {/* Number */}
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.22em",
              color: "var(--prem-accent)",
              marginBottom: "8px",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </p>

          {/* Title */}
          <h4
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(17px, 1.5vw, 22px)",
              color: "white",
              marginBottom: "10px",
              lineHeight: 1.25,
            }}
          >
            {treatment.name}
          </h4>

          {/* Description — revealed on hover */}
          <div
            style={{
              maxHeight: hovered ? "120px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.35s ease",
            }}
          >
            {plainDesc && (
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.55,
                  marginBottom: "12px",
                }}
              >
                {plainDesc.slice(0, 160)}{plainDesc.length > 160 ? "…" : ""}
              </p>
            )}
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            <a
              href={WHATSAPP_TREATMENT_URL(treatment.name)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.18em",
                color: "var(--prem-accent)",
                textDecoration: "none",
                textTransform: "uppercase",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Consultar
            </a>
            {!isHome && (
              <Link
                href={`/tratamientos/${treatment.id}`}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  textTransform: "uppercase",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                Leer más
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </TiltCard>
  )
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
    <section className="py-20 px-6" style={{ backgroundColor: "var(--prem-dark)" }}>
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
            {!isHome && (
              <motion.h3
                initial={prefersReduced ? false : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-xl font-bold mb-6 pb-2 border-b"
                style={{ color: "#c9a96e", borderColor: "var(--prem-dark-border)" }}
              >
                {category}
              </motion.h3>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5">
              {currentTreatmentData.map((treatment, i) => (
                <VerticalTreatmentCard
                  key={treatment.id}
                  treatment={treatment}
                  index={i}
                  isHome={isHome}
                  prefersReduced={prefersReduced}
                />
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
