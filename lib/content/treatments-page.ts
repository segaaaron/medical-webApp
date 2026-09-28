import { cache } from "react"
import { fromService } from "./service"
import { parseTreatmentsPage, type TreatmentsPageInfo } from "./parse/treatments-page"
import { TREATMENTS_PAGE_INFO_FALLBACK } from "./fallback/treatments-page"

export type { TreatmentsPageInfo }

/** Textos de la sección de servicios (Dashboard → Tratamientos → Info). */
export const getTreatmentsPageInfo = cache(() =>
  fromService("/site-content/treatmentsPage", parseTreatmentsPage, TREATMENTS_PAGE_INFO_FALLBACK, {
    revalidate: 60,
  })
)
