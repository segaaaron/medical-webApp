import type { PublicReview, ReviewAggregate } from "@/components/sections/TestimonialsSection"
import { list, num, obj, str } from "./coerce"

export type { PublicReview, ReviewAggregate }

export interface ReviewsData {
  reviews: PublicReview[]
  /**
   * Media y total de TODAS las reseñas aprobadas (calculado por el backend),
   * o de la página recibida si el backend no lo manda. `null` sin reseñas.
   */
  aggregate: ReviewAggregate | null
  /** Paginación del backend; `null` si no la informa. */
  meta: { page: number; totalPages: number } | null
}

function review(input: unknown): PublicReview | null {
  const r = obj(input)
  if (!r) return null
  const id = str(r.id)
  const body = str(r.body)
  const rating = num(r.rating)
  if (id === "") return null
  if (body === "") return null
  if (rating <= 0) return null
  return {
    id,
    patient_name: str(r.patient_name),
    patient_lastname: str(r.patient_lastname),
    treatment: str(r.treatment),
    body,
    rating,
    approved_at: str(r.approved_at),
  }
}

function average(reviews: PublicReview[]): number {
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
}

export function parseReviews(input: unknown): ReviewsData | null {
  const items = list(input)
  if (!items) return null
  const reviews = items.map(review).filter((r): r is PublicReview => r !== null)
  const o = obj(input)

  const agg = o ? obj(o.aggregate) : null
  const total = agg ? num(agg.total_count) : 0
  let aggregate: ReviewAggregate | null = null
  const avg = agg ? num(agg.avg_rating) : 0
  if (total > 0 && avg > 0) {
    aggregate = { avg_rating: avg, total_count: total }
  } else if (total > 0 && reviews.length > 0) {
    aggregate = { avg_rating: average(reviews), total_count: total }
  } else if (reviews.length > 0) {
    aggregate = { avg_rating: average(reviews), total_count: reviews.length }
  }

  const hasMeta = o !== null && typeof o.page === "number" && typeof o.totalPages === "number"
  return {
    reviews,
    aggregate,
    meta: hasMeta && o ? { page: num(o.page), totalPages: num(o.totalPages) } : null,
  }
}
