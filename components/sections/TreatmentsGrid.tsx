"use client"
import { useState } from "react"
import { m } from "framer-motion"
import { normalizeName } from "@/lib/seo/treatment-names"
import Link from "next/link"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { LinkButton } from "@/components/ui/Button"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { useWhatsApp } from "@/components/providers/WhatsAppProvider"
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
  /** Dirección pública del tratamiento — ver app/tratamientos/[slug]. */
  slug: string
}

interface TreatmentsGridProps {
  treatments: Treatment[]
  isHome: boolean
  /** Controles de paginación, renderizados justo debajo del grid de cards. */
  pager?: React.ReactNode
  /** Total de tratamientos disponibles (para decidir si mostrar "Ver más" en home). */
  totalCount?: number
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
  const { url: whatsappUrl } = useWhatsApp()
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const hasImage = !!treatment.imageUrl
  const num = String(index + 1).padStart(2, "0")
  const plainDesc = treatment.description ? stripHtml(treatment.description) : ""

  const MAX_TILT = 7
  const handleMove = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setTilt({ rx: (0.5 - py) * MAX_TILT * 2, ry: (px - 0.5) * MAX_TILT * 2 })
  }
  const handleEnter = () => setHovered(true)
  const handleLeave = () => { setHovered(false); setTilt({ rx: 0, ry: 0 }) }

  const cardStyle: React.CSSProperties = {
    position: "relative",
    aspectRatio: "3/4",
    borderRadius: "4px",
    overflow: "hidden",
    cursor: "pointer",
    display: "block",
    textDecoration: "none",
    touchAction: "manipulation",
    perspective: "1000px",
    zIndex: hovered ? 3 : 1,
    // Lift + scale CONSTANTE en hover (no sigue el cursor) → se asienta y el texto
    // queda nítido. El tilt que sigue al cursor va solo en la capa de imagen.
    transform: hovered ? "translateY(-12px) scale(1.035)" : "translateY(0) scale(1)",
    boxShadow: hovered
      ? `0 40px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(184,151,59,0.45)`
      : "0 8px 32px rgba(0,0,0,0.35)",
    transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease",
  }

  // Solo la capa visual (imagen + scrim) recibe el tilt 3D. El texto vive fuera de
  // este transform → nunca se rasteriza rotado, se mantiene nítido en hover.
  const tiltStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transformStyle: "preserve-3d",
    transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hovered ? 1.04 : 1})`,
    transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)",
  }

  const inner = (
    <>
      {/* Capa 3D — solo imagen + scrim se tiltean; el texto queda fuera y nítido */}
      <div style={tiltStyle}>
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
              alt={`${normalizeName(treatment.name)} — Dra. Yasmin Medrano Avila`}
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

        {/* Scrim inferior — garantiza legibilidad del título sobre cualquier imagen (clara u oscura) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(15,3,9,0.82) 0%, rgba(15,3,9,0.45) 34%, rgba(15,3,9,0) 62%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Hover overlay "Ver más" — solo para tratamientos page, oculto en touch */}
      {!isHome && (
        <div
          className="hover-overlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 45%, rgba(10,2,6,0.42) 0%, rgba(10,2,6,0.78) 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.35s ease",
            zIndex: 8,
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              background: GOLD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
              transform: hovered ? "scale(1)" : "scale(0.7)",
              transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a0510" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <span
            style={{
              fontFamily: "ui-monospace, 'IBM Plex Mono', Menlo, monospace",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--vintage-gold-light)",
              textShadow: "0 2px 10px rgba(0,0,0,0.7)",
              transform: hovered ? "translateY(0)" : "translateY(8px)",
              transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1) 0.06s",
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
      <div style={{ position: "absolute", top: 0, right: 0, width: "52px", height: "52px", borderTop: "2.5px solid var(--vintage-gold-light)", borderRight: "2.5px solid var(--vintage-gold-light)", filter: "drop-shadow(0 0 4px rgba(184,151,59,0.5))", opacity: hovered ? 1 : 0, transform: hovered ? "translate(0,0)" : "translate(-6px,6px)", transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)", zIndex: 9 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "52px", height: "52px", borderBottom: "2.5px solid var(--vintage-gold-light)", borderLeft: "2.5px solid var(--vintage-gold-light)", filter: "drop-shadow(0 0 4px rgba(184,151,59,0.5))", opacity: hovered ? 1 : 0, transform: hovered ? "translate(0,0)" : "translate(6px,-6px)", transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)", zIndex: 9 }} />

      {/* Content */}
      <div style={{ position: "absolute", inset: 0, padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 5 }}>
        {/* Number */}
        <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ display: "inline-block", width: "18px", height: "1.5px", background: "var(--vintage-gold-light)", opacity: 0.9 }} />
          <span style={{ fontFamily: "ui-monospace, 'IBM Plex Mono', Menlo, monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.22em", color: "var(--vintage-gold-light)", textShadow: "0 1px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.8)" }}>{num}</span>
        </div>

        {/* Title */}
        <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(15px, 1.6vw, 20px)", fontWeight: 500, color: "#ffffff", lineHeight: 1.25, marginBottom: "10px", letterSpacing: "-0.01em", textTransform: "uppercase", textShadow: "0 2px 12px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.7)" }}>
          {normalizeName(treatment.name)}
        </h4>

        {/* Description reveal — solo home */}
        {isHome && (
          <div style={{ maxHeight: hovered ? "80px" : "0", overflow: "hidden", opacity: hovered ? 1 : 0, transition: "max-height 0.4s ease, opacity 0.35s ease", marginBottom: hovered ? "12px" : "0" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.94)", lineHeight: 1.6, textShadow: "0 1px 8px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.7)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{plainDesc}</p>
          </div>
        )}

        {/* Footer — solo home */}
        {isHome && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(184,151,59,0.25)", paddingTop: "12px" }}>
            <span style={{ fontFamily: "ui-monospace, 'IBM Plex Mono', Menlo, monospace", fontSize: "11px", fontWeight: 600, color: "var(--vintage-gold-light)", letterSpacing: "0.05em", textShadow: "0 1px 6px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.7)" }}>
              {treatment.price > 0 ? `Bs. ${treatment.price.toLocaleString("es-BO")}` : "Consultar precio"}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href={`${whatsappUrl}?text=${encodeURIComponent(`Hola, me interesa el tratamiento de ${normalizeName(treatment.name)}`)}`}
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
        <Link href={`/tratamientos/${treatment.slug}`} style={cardStyle} onMouseEnter={handleEnter} onMouseMove={handleMove} onMouseLeave={handleLeave} onClick={() => trackTreatmentClick({ id: treatment.id, name: treatment.name })}>
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
    >
      <div
        onMouseEnter={handleEnter}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={() => { window.location.href = `/tratamientos#treatment-${treatment.id}` }}
        style={cardStyle}
      >
        {inner}
      </div>
    </m.div>
  )
}

export function TreatmentsGrid({ treatments, isHome, pager, totalCount }: TreatmentsGridProps) {
  if (treatments.length === 0) return null

  const activeTreatments = treatments.filter((x) => x.active)
  const showViewMore = isHome && (totalCount ?? activeTreatments.length) > 4

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
              : `Encuentra el tratamiento ideal para ti. <span style="color:${GOLD};font-weight:700;">Agenda una consulta</span> y recibe un plan personalizado.`
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

        {showViewMore && (
          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}
          >
            <LinkButton
              href="/tratamientos"
              variant="ghost"
              className="group gap-2"
              style={{ padding: "13px 26px" }}
            >
              Ver más tratamientos
              <svg aria-hidden="true" focusable="false" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.25s ease" }} className="group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </LinkButton>
          </m.div>
        )}

        {pager}

      </div>
    </section>
  )
}
