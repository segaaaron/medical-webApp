import { cache } from "react"
import { backendFetch } from "@/lib/backend-client"
import { fromService } from "./service"
import { parseReviews, type PublicReview, type ReviewAggregate, type ReviewsData } from "./parse/reviews"
import { REVIEWS_FALLBACK } from "./fallback/reviews"

export type { PublicReview, ReviewAggregate, ReviewsData }

/** Reseñas aprobadas (primera página) con la media global. */
export const getReviews = cache(() =>
  fromService("/reviews/public", parseReviews, REVIEWS_FALLBACK, { revalidate: 300 })
)

/** Una página del listado `/resenas`. */
export const getReviewsPage = cache((page: number) =>
  fromService(`/reviews/public?page=${page}`, parseReviews, REVIEWS_FALLBACK, { revalidate: 300 })
)

export interface InviteValidation {
  valid: boolean
  patient_name?: string
  patient_lastname?: string
  reason?: "used" | "expired" | "revoked" | "not_found"
}

/**
 * Estado de una invitación a reseñar. No es contenido editable (no tiene
 * respaldo): sin respuesta del servicio, `null`.
 */
export async function validateInvite(token: string): Promise<InviteValidation | null> {
  const { data } = await backendFetch<InviteValidation>(
    `/reviews/invites/validate/${encodeURIComponent(token)}`
  )
  return data
}
