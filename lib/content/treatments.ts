import { cache } from "react"
import { fromService } from "./service"
import {
  parseTreatment,
  parseTreatments,
  parseTreatmentsGridPage,
  type Treatment,
  type TreatmentsPageData,
} from "./parse/treatments"
import {
  TREATMENTS_FALLBACK,
  TREATMENTS_PAGE_FALLBACK,
  TREATMENT_CATEGORIES_FALLBACK,
} from "./fallback/treatments"

export type { Treatment, TreatmentsPageData }

/** Categorías generales que `/tratamientos` muestra SOLO si el servicio falla. */
export const FALLBACK_TREATMENT_CATEGORIES = TREATMENT_CATEGORIES_FALLBACK

/**
 * Tratamientos activos, lista completa (el backend no pagina sin `?page`).
 * Misma petición cacheada para todo el render.
 */
export const getActiveTreatments = cache(() =>
  fromService("/treatments?active=true", parseTreatments, TREATMENTS_FALLBACK, { revalidate: 300 })
)

/** Una página del grid de `/tratamientos` (el backend fija el tamaño). */
export const getTreatmentsGridPage = cache((page: number) =>
  fromService(`/treatments?active=true&page=${page}`, parseTreatmentsGridPage, TREATMENTS_PAGE_FALLBACK, {
    revalidate: 300,
  })
)

/** Por id (activo o no). `null` si no existe o el servicio no responde. */
export const getTreatmentById = cache(async (id: string): Promise<Treatment | null> => {
  const r = await fromService<Treatment | null>(
    `/treatments/${encodeURIComponent(id)}`,
    parseTreatment,
    null,
    { revalidate: 300 }
  )
  return r.data
})

/**
 * Por slug. No hay endpoint por slug: se resuelve en la lista de activos y se
 * lee la ficha por su id. `null` si no está activo o el servicio no responde.
 */
export const getTreatmentBySlug = cache(async (slug: string): Promise<Treatment | null> => {
  const { data } = await getActiveTreatments()
  const found = data.find((t) => t.slug === slug)
  if (!found) return null
  return getTreatmentById(found.id)
})
