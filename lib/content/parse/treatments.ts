import { bool, firstStr, image, list, num, obj, str } from "./coerce"

/** Tratamiento del panel, ya normalizado para el sitio. */
export interface Treatment {
  id: string
  slug: string
  /** Nombre clínico tal cual lo escribe la doctora (sin normalizar). */
  name: string
  description: string
  price: number
  tag: string
  imageUrl: string
  beforeImageUrl: string
  afterImageUrl: string
  active: boolean
  createdAt: string
  updatedAt: string
  /** Cómo se busca («Botox»). "" = se deriva del nombre. */
  seoTitle: string
  /** "" = se deriva de la descripción. */
  seoDescription: string
  /** "" = la foto del tratamiento. */
  ogImageUrl: string
}

export interface TreatmentsPageData {
  items: Treatment[]
  /** Metadatos de paginación del backend; `null` si respondió la lista suelta. */
  meta: { total: number; totalPages: number; page: number; limit: number } | null
}

export function parseTreatment(input: unknown): Treatment | null {
  const raw = obj(input)
  if (!raw) return null
  const id = str(raw.id)
  const slug = str(raw.slug)
  const name = str(raw.name)
  // Sin identidad no hay ficha que enlazar (y los metadatos se romperían).
  if (id === "") return null
  if (slug === "") return null
  if (name === "") return null
  return {
    id,
    slug,
    name,
    description: str(raw.description),
    price: num(raw.price),
    tag: str(raw.tag),
    imageUrl: image(firstStr(raw.imageUrl, raw.image_url)),
    beforeImageUrl: image(firstStr(raw.beforeImageUrl, raw.before_image_url)),
    afterImageUrl: image(firstStr(raw.afterImageUrl, raw.after_image_url)),
    active: bool(raw.active),
    createdAt: str(raw.createdAt),
    updatedAt: str(raw.updatedAt),
    seoTitle: str(raw.seoTitle),
    seoDescription: str(raw.seoDescription),
    ogImageUrl: image(raw.ogImageUrl),
  }
}

/** Lista de tratamientos. Los registros sin id/slug/nombre se descartan. */
export function parseTreatments(input: unknown): Treatment[] | null {
  const items = list(input)
  if (!items) return null
  return items.map(parseTreatment).filter((t): t is Treatment => t !== null)
}

/** Página del grid (`?page=N`), con o sin metadatos de paginación. */
export function parseTreatmentsGridPage(input: unknown): TreatmentsPageData | null {
  const items = parseTreatments(input)
  if (!items) return null
  const o = obj(input)
  const hasMeta = o !== null && (typeof o.total === "number" ? true : typeof o.totalPages === "number")
  return {
    items,
    meta: hasMeta && o
      ? { total: num(o.total), totalPages: num(o.totalPages), page: num(o.page), limit: num(o.limit) }
      : null,
  }
}
