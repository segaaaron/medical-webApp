import { cache } from "react"
import { fromService } from "./service"
import { parseHome, type HomeContent } from "./parse/home"
import { HOME_FALLBACK } from "./fallback/home"

export type { HomeContent }

/** Hero, estadísticas, botones y FAQs de la portada (`/home`). */
export const getHome = cache(() => fromService("/home", parseHome, HOME_FALLBACK, { revalidate: 60 }))
