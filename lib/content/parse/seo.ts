import { obj, siteContentValue, str } from "./coerce"

export interface PageSeo {
  /** Título completo, tal cual (sin plantilla de marca). "" = no se declara. */
  title: string
  /** "" = no se declara. */
  description: string
}

export const SEO_PAGES = ["home", "nosotros", "tratamientos", "contacto", "blog"] as const
export type SeoPage = (typeof SEO_PAGES)[number]
export type SiteSeo = Record<SeoPage, PageSeo>

function page(v: unknown): PageSeo {
  const o = obj(v)
  return o ? { title: str(o.title), description: str(o.description) } : { title: "", description: "" }
}

/** `/site-content/seo` (Dashboard → SEO / Google). */
export function parseSeo(input: unknown): SiteSeo | null {
  const value = siteContentValue(input)
  if (!value) return null
  return {
    home: page(value.home),
    nosotros: page(value.nosotros),
    tratamientos: page(value.tratamientos),
    contacto: page(value.contacto),
    blog: page(value.blog),
  }
}
