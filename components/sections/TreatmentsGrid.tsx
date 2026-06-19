"use client"
import { useState } from "react"
import { m } from "framer-motion"
import Link from "next/link"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { LinkButton } from "@/components/ui/Button"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { WHATSAPP_TREATMENT_URL, WHATSAPP_URL } from "@/lib/constants"
import { trackWhatsAppClick, trackTreatmentClick } from "@/lib/analytics"
import { TAG_LABELS, TAG_COLORS, DEFAULT_TAG_COLOR } from "@/lib/treatment-tags"

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
  /** Controles de paginación, renderizados justo debajo del grid de cards. */
  pager?: React.ReactNode
}

const GOLD = "var(--vintage-gold)"

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function PosterCard({
  treatment,
  index,
  isHome,
}: {
  treatment: Treatment
  index: number
  isHome: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const hasImage = !!treatment.imageUrl
  const num = String(index + 1).padStart(2, "0")
  const plainDesc = treatment.description ? stripHtml(treatment.description) : ""

  const cardStyle: React.CSSProperties = {
    position: "relative",
    aspectRatio: "3/4",
    borderRadius: "4px",
    overflow: "hidden",
    cursor: "pointer",
    display: "block",
    textDecoration: "none",
    touchAction: "manipulation",
    boxShadow: hovered
      ? `0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(184,151,59,0.4)`
      : "0 8px 32px rgba(0,0,0,0.35)",
    transition: "box-shadow 0.4s ease",
  }

  const inner = (
    <>
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: hovered ? "scale(1.07)" : "scale(1)",
          transition: "transform 0.75s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      >
        {hasImage ? (
          <ImageWithFallback
            src={treatment.imageUrl!}
            alt={`${treatment.name} — Dra. Yasmin Medrano Avila`}
            variant="dark"
            objectPosition="center top"
            loading="lazy"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(155deg, oklch(26% 0.05 50) 0%, oklch(14% 0.03 44) 100%)" }} />
        )}
      </div>

      {/* Hover overlay "Ver más" — solo para tratamientos page, oculto en touch */}
      {!isHome && (
        <div
          className="hover-overlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,2,6,0.55)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
            zIndex: 8,
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: `1.5px solid ${GOLD}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: hovered ? "scale(1)" : "scale(0.8)",
              transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <span
            style={{
              fontFamily: "ui-monospace, 'IBM Plex Mono', Menlo, monospace",
              fontSize: "9px",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: GOLD,
              transform: hovered ? "translateY(0)" : "translateY(6px)",
              transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1) 0.05s",
            }}
          >
            Ver más
          </span>
        </div>
      )}

      {/* Tag — top left */}
      {treatment.tag && (
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            zIndex: 10,
            background: TAG_COLORS[treatment.tag] ?? DEFAULT_TAG_COLOR,
            padding: "4px 10px",
            borderRadius: "2px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
          }}
        >
          <span
            style={{
              fontFamily: "ui-monospace, 'IBM Plex Mono', Menlo, monospace",
              fontSize: "9px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {TAG_LABELS[treatment.tag] ?? treatment.tag}
          </span>
        </div>
      )}

      {/* Gold corner accents */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "52px", height: "52px", borderTop: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}`, opacity: hovered ? 1 : 0, transition: "opacity 0.35s", zIndex: 9 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "52px", height: "52px", borderBottom: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}`, opacity: hovered ? 1 : 0, transition: "opacity 0.35s", zIndex: 9 }} />

      {/* Content */}
      <div style={{ position: "absolute", inset: 0, padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 5 }}>
        {/* Number */}
        <div style={{ marginBottom: "10px" }}>
          <span style={{ fontFamily: "ui-monospace, 'IBM Plex Mono', Menlo, monospace", fontSize: "10px", letterSpacing: "0.22em", color: GOLD, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>{num}</span>
        </div>

        {/* Title */}
        <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(15px, 1.6vw, 20px)", fontWeight: 500, color: "#ffffff", lineHeight: 1.25, marginBottom: "10px", letterSpacing: "-0.01em", textTransform: "capitalize", textShadow: "0 2px 12px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.7)" }}>
          {treatment.name.toLowerCase()}
        </h4>

        {/* Description reveal — solo home */}
        {isHome && (
          <div style={{ maxHeight: hovered ? "80px" : "0", overflow: "hidden", opacity: hovered ? 1 : 0, transition: "max-height 0.4s ease, opacity 0.35s ease", marginBottom: hovered ? "12px" : "0" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{plainDesc}</p>
          </div>
        )}

        {/* Footer — solo home */}
        {isHome && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(184,151,59,0.25)", paddingTop: "12px" }}>
            <span style={{ fontFamily: "ui-monospace, 'IBM Plex Mono', Menlo, monospace", fontSize: "11px", color: GOLD, letterSpacing: "0.05em" }}>
              {treatment.price > 0 ? `Bs. ${treatment.price.toLocaleString("es-BO")}` : "Consultar precio"}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href={WHATSAPP_TREATMENT_URL(treatment.name)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.stopPropagation(); trackWhatsAppClick("treatment-card", treatment.name) }}
                style={{ fontFamily: "ui-monospace, 'IBM Plex Mono', Menlo, monospace", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#000", background: GOLD, padding: "10px 16px", borderRadius: "2px", textDecoration: "none", display: "inline-flex", alignItems: "center", minHeight: "44px" }}
              >
                Consultar
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )

  if (!isHome) {
    return (
      <m.div id={`treatment-${treatment.id}`} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: index * 0.08 }}>
        <Link href={`/tratamientos/${treatment.id}`} style={cardStyle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => trackTreatmentClick({ id: treatment.id, name: treatment.name })}>
          {inner}
        </Link>
      </m.div>
    )
  }

  return (
    <m.div
      id={`treatment-${treatment.id}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { window.location.href = `/tratamientos#treatment-${treatment.id}` }}
      style={cardStyle}
    >
      {inner}
    </m.div>
  )
}

export function TreatmentsGrid({ treatments, isHome, pager }: TreatmentsGridProps) {
  if (treatments.length === 0) return null

  const activeTreatments = treatments.filter((x) => x.active)

  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: "#1a0510" }}
    >
      <div className="container-xl">
        <SectionHeader
          eyebrow={isHome ? "Áreas de Especialidad" : "Catálogo de Servicios"}
          title={isHome ? "Algunas Categorías de Tratamiento" : "Todos Nuestros Tratamientos"}
          subtitle={
            isHome
              ? `Desde rejuvenecimiento facial hasta modelado corporal, ofrecemos soluciones estéticas integrales con <span style="color:${GOLD};font-weight:700;">resultados visibles y duraderos.</span>`
              : `Encuentra el tratamiento ideal para ti. <span style="color:${GOLD};font-weight:700;">Agenda una consulta gratuita</span> y recibe un plan personalizado.`
          }
          light
        />


        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {activeTreatments.map((treatment, i) => (
            <PosterCard
              key={treatment.id}
              treatment={treatment}
              index={i}
              isHome={isHome}
            />
          ))}
        </div>

        {pager}

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12"
        >
          <LinkButton href={WHATSAPP_URL} variant="primary" className="px-12" onClick={() => trackWhatsAppClick("treatments-grid-bottom")}>
            AGENDA TU CONSULTA GRATUITA
          </LinkButton>
        </m.div>
      </div>
    </section>
  )
}
