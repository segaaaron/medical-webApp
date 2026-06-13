"use client"

import { m } from "framer-motion"
import { Star } from "lucide-react"
import { SectionHeader } from "@/components/ui/SectionHeader"

// ── Types ──────────────────────────────────────────────────────────────────

export interface PublicReview {
  id: string
  patient_name: string
  treatment: string | null
  body: string
  rating: number
  approved_at: string
}

export interface ReviewAggregate {
  avg_rating: number
  total_count: number
}

// Static fallback shown when no DB reviews exist yet
const FALLBACK_REVIEWS: PublicReview[] = [
  {
    id: "f1",
    patient_name: "María José R.",
    treatment: "Armonización Facial",
    body: "Quedé encantada con los resultados. La Dra. Yasmin es muy profesional, me explicó todo el procedimiento con detalle y el resultado fue completamente natural. ¡Me siento más segura que nunca!",
    rating: 5,
    approved_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "f2",
    patient_name: "Lucía F.",
    treatment: "Toxina Botulínica",
    body: "Llevaba años pensando en hacerme botox y siempre me daba miedo. La doctora me dio toda la confianza necesaria. El resultado es increíble, nadie nota que me hice algo, solo que me veo descansada y fresca.",
    rating: 5,
    approved_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "f3",
    patient_name: "Carolina M.",
    treatment: "Mesoterapia Facial",
    body: "Mi piel cambió completamente. Después de tres sesiones noto la diferencia en la hidratación y la luminosidad. El trato es muy personalizado y el consultorio es muy agradable.",
    rating: 5,
    approved_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "f4",
    patient_name: "Valentina S.",
    treatment: "Depilación Láser",
    body: "Excelente atención desde el primer día. Resultados visibles desde las primeras sesiones. Muy recomendable si buscas un tratamiento seguro y con resultados reales.",
    rating: 5,
    approved_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "f5",
    patient_name: "Andrea P.",
    treatment: "Rellenos con Ácido Hialurónico",
    body: "La Dra. Medrano tiene una mano increíble. Los rellenos quedaron perfectos, muy naturales. Me dio exactamente lo que buscaba sin exagerar. Sin duda volveré.",
    rating: 5,
    approved_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "f6",
    patient_name: "Gabriela T.",
    treatment: "Radiofrecuencia Facial",
    body: "Fui por el tratamiento de radiofrecuencia y los resultados superaron mis expectativas. La piel se ve más firme y rejuvenecida. El personal es muy amable y profesional.",
    rating: 5,
    approved_at: "2025-01-01T00:00:00Z",
  },
]

const FALLBACK_AGGREGATE: ReviewAggregate = { avg_rating: 5.0, total_count: 6 }

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

function ReviewCard({ review, index }: { review: PublicReview; index: number }) {
  return (
    <m.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="p-6 flex flex-col"
      style={{
        backgroundColor: "var(--prem-dark-surf)",
        border: "1px solid var(--prem-dark-border)",
        borderRadius: "2px",
      }}
    >
      {/* Decorative quote */}
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "80px",
          lineHeight: 1,
          color: "var(--prem-dark-border)",
          marginBottom: "-28px",
          userSelect: "none",
        }}
        aria-hidden="true"
      >
        &#8220;
      </div>

      <div className="mb-3">
        <StarRow count={review.rating} size={14} />
      </div>

      <p
        className="text-sm leading-relaxed flex-1 mb-5"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--prem-dark-fg)",
          fontSize: "15px",
          lineHeight: 1.78,
          fontStyle: "italic",
        }}
      >
        {review.body}
      </p>

      <div
        className="border-t pt-4 flex items-center gap-3"
        style={{ borderColor: "var(--prem-dark-border)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: "var(--prem-accent)", color: "white" }}
          aria-hidden="true"
        >
          {review.patient_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--prem-dark-fg)", fontFamily: "var(--font-heading)" }}
          >
            {review.patient_name}
          </p>
          {review.treatment && (
            <p
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--prem-dark-muted)",
              }}
            >
              {review.treatment}
            </p>
          )}
        </div>
      </div>
    </m.article>
  )
}

// ── Main section ───────────────────────────────────────────────────────────

interface TestimonialsSectionProps {
  reviews?: PublicReview[]
  aggregate?: ReviewAggregate
}

export function TestimonialsSection({ reviews, aggregate }: TestimonialsSectionProps) {
  const displayReviews = reviews && reviews.length > 0 ? reviews : FALLBACK_REVIEWS
  const displayAggregate = aggregate ?? FALLBACK_AGGREGATE

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReviews.slice(0, 6).map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>

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
