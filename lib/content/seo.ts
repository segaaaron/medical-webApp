import { cache } from "react"
import { fromService } from "./service"
import { parseSeo, type PageSeo, type SiteSeo } from "./parse/seo"
import { SEO_FALLBACK } from "./fallback/seo"

export type { PageSeo, SiteSeo }

/**
 * Metadatos de las páginas fijas (Dashboard → SEO / Google). Mientras no se
 * haya guardado nunca, el backend responde 404 → respaldo entero.
 */
export const getSiteSeo = cache(async (): Promise<SiteSeo> => {
  const r = await fromService("/site-content/seo", parseSeo, SEO_FALLBACK, { revalidate: 60 })
  return r.data
})
