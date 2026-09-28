import { cache } from "react"
import { fromService } from "./service"
import { parsePromo, type PromoDisplayData } from "./parse/promo"
import { PROMO_FALLBACK } from "./fallback/promo"

export type { PromoDisplayData }

/** Promoción del panel; sin servicio, sin banner. */
export const getPromo = cache(() =>
  fromService("/promo-banner", parsePromo, PROMO_FALLBACK, { revalidate: 300 })
)
