/** Sin servicio no hay reseñas que mostrar: nunca se inventan. */
import type { ReviewsData } from "@/lib/content/parse/reviews"

export const REVIEWS_FALLBACK: ReviewsData = { reviews: [], aggregate: null, meta: null }
