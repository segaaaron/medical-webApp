"use client"

import { m } from "framer-motion"
import { Star } from "lucide-react"
import Link from "next/link"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { normalizeName } from "@/lib/seo/treatment-names"

// ── Types ──────────────────────────────────────────────────────────────────

export interface PublicReview {
  id: string
  patient_name: string
  patient_lastname?: string | null
  treatment: string | null
  body: string
  rating: number
  approved_at: string
}

export interface ReviewAggregate {
  avg_rating: number
  total_count: number
}

// Sin reseñas reales no se muestra nada.
//
// Aquí vivían seis testimonios inventados —con nombres de pacientes ficticias
// como «María José R.» o «Lucía F.»— que se mostraban si el backend fallaba.
// Dos de ellos elogiaban armonización facial y depilación láser, servicios que
// el consultorio no presta. Testimonios médicos falsos son publicidad
// engañosa; con reseñas reales aprobadas ya no hacen ninguna falta.


// ── Sub-components ─────────────────────────────────────────────────────────

function StarRow({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < count ? "var(--prem-accent)" : "none"}
          style={{
            color: i < count ? "var(--prem-accent)" : "var(--prem-dark-border)",
            flexShrink: 0,
          }}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

/** «2026-09-02T…» → «septiembre 2026». */
function mesYAno(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("es-BO", { month: "long", year: "numeric" })
}

/**
 * Tarjeta de reseña.
 *
 * Criterios, tomados de cómo resuelven esto las marcas que cuidan el detalle:
 *
 * - **Sin comillas.** Ni el glifo decorativo ni comillas alrededor del texto.
 *   Ocupaban espacio sin aportar: que es una cita ya lo dicen las estrellas y
 *   la firma.
 * - **Aire.** El espacio generoso es lo que separa una reseña que parece
 *   escogida de una que parece amontonada.
 * - **Esquinas redondeadas.** Suavizan la tarjeta sin restarle seriedad.
 * - **Fecha.** Estaba en los datos y no se usaba. Una reseña fechada se lee
 *   como real; una sin fecha, como material de relleno.
 *
 * Jerarquía: de qué trata → valoración → qué dijo → quién y cuándo.
 */
function ReviewCard({ review, index }: { review: PublicReview; index: number }) {
  const nombre = `${review.patient_name}${review.patient_lastname ? ` ${review.patient_lastname}` : ""}`
  const fecha = mesYAno(review.approved_at)

  return (
    <m.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index, 5) * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group flex flex-col p-8 transition-colors duration-300"
      style={{
        backgroundColor: "var(--prem-dark-surf)",
        border: "1px solid var(--prem-dark-border)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      {review.treatment && (
        <p
          className="mb-5 self-start px-3 py-1.5"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--vintage-gold)",
            border: "1px solid color-mix(in oklab, var(--vintage-gold) 35%, transparent)",
            borderRadius: "999px",
          }}
        >
          {/* El tratamiento llega como texto libre guardado con la reseña, a
              menudo en MAYÚSCULAS SOSTENIDAS («ÁCIDO HIALURÓNICO»). Se
              normaliza igual que en el resto del sitio. */}
          {normalizeName(review.treatment)}
        </p>
      )}

      <div className="mb-6">
        <StarRow count={review.rating} size={13} />
      </div>

      {/* Sin comillas: el texto va desnudo, que es como se lee mejor. */}
      <p
        className="flex-1"
        style={{
          fontFamily: "var(--font-display, Georgia, serif)",
          color: "var(--prem-dark-fg)",
          fontSize: "17.5px",
          lineHeight: 1.8,
        }}
      >
        {review.body}
      </p>

      <footer className="mt-8 flex items-center gap-3.5">
        {/* Monograma: no hay foto de las pacientes, y una silueta genérica se
            lee como testimonio de archivo. */}
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center text-sm"
          style={{
            border: "1px solid color-mix(in oklab, var(--vintage-gold) 45%, transparent)",
            color: "var(--vintage-gold)",
            borderRadius: "999px",
            fontFamily: "var(--font-heading)",
          }}
        >
          {review.patient_name.charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0">
          <p
            className="truncate text-sm"
            style={{ color: "var(--prem-dark-fg)", fontFamily: "var(--font-heading)" }}
          >
            {nombre}
          </p>
          <p
            className="truncate"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--prem-dark-muted)",
            }}
          >
            {fecha ? `Verificada · ${fecha}` : "Paciente verificada"}
          </p>
        </div>
      </footer>
    </m.article>
  )
}

// ── Main section ───────────────────────────────────────────────────────────

interface TestimonialsSectionProps {
  reviews?: PublicReview[]
  aggregate?: ReviewAggregate
  /** Cuántas mostrar aquí. La página `/resenas` las lista todas paginadas. */
  limit?: number
  /** Oculta el enlace «ver todas» en la propia página de reseñas. */
  showAllLink?: boolean
}

export function TestimonialsSection({
  reviews,
  aggregate,
  limit = 6,
  showAllLink = true,
}: TestimonialsSectionProps) {
  // Sin reseñas aprobadas la sección no se pinta: mejor no mostrar nada que
  // mostrar testimonios que nadie escribió.
  if (!reviews || reviews.length === 0) return null

  const displayReviews = reviews
  const displayAggregate = aggregate ?? {
    avg_rating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
    total_count: reviews.length,
  }

  const avgDisplay = displayAggregate.avg_rating.toFixed(1)
  const countLabel =
    displayAggregate.total_count === 1
      ? "1 reseña verificada"
      : `${displayAggregate.total_count} reseñas verificadas`

  return (
    <section className="py-20 px-6" style={{ backgroundColor: "var(--prem-dark)" }}>
      <div className="container-xl">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow="Lo que dicen nuestras pacientes"
            title="Resultados que Hablan por Sí Solos"
            subtitle={`<span style="color:var(--vintage-gold);font-weight:700;">Todos nuestros pacientes</span> avalan nuestro trabajo. La confianza de cada uno es nuestra mayor motivación.`}
            light
          />
        </m.div>

        {/* Rejilla con `items-start`.
            Sin él, una reseña de dos líneas junto a otra de diez se estiraba
            hasta igualar la alta y dejaba un hueco enorme dentro de la tarjeta.
            Con `items-start` cada una ocupa solo su alto.

            Se probó mampostería con columnas CSS y se descartó: dentro de un
            contenedor multicolumna las animaciones `whileInView` de Framer
            Motion no se disparaban bien y las tarjetas quedaban a media
            opacidad. Verificado en navegador. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {displayReviews.slice(0, limit).map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>

        {/* Enlace al listado completo.
            Solo aparece cuando hay más reseñas de las que caben aquí: con 5 no
            tiene sentido mandar a una página que muestra lo mismo. */}
        {showAllLink && displayAggregate.total_count > limit && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/resenas"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                border: "1px solid var(--vintage-gold)",
                color: "var(--vintage-gold)",
                borderRadius: "2px",
                fontFamily: "var(--font-heading)",
              }}
            >
              Ver las {displayAggregate.total_count} reseñas
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}

        {/* Aggregate rating badge */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mt-12"
        >
          <div
            className="flex items-center gap-4 px-8 py-4"
            style={{
              backgroundColor: "var(--prem-dark-surf)",
              border: "1px solid var(--prem-dark-border)",
              borderRadius: "2px",
            }}
          >
            <StarRow count={5} size={20} />
            <div>
              <p
                className="font-bold text-lg"
                style={{ color: "var(--prem-dark-fg)", fontFamily: "var(--font-heading)" }}
              >
                {avgDisplay}
              </p>
              <p
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--prem-dark-muted)",
                }}
              >
                {countLabel}
              </p>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  )
}
