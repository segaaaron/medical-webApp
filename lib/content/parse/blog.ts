import { normalizeHeadline } from "@/lib/seo/treatment-names"
import { bool, firstStr, image, list, obj, str } from "./coerce"

export interface BlogPost {
  id: string
  /** Titular sin el grito de las MAYÚSCULAS del panel. */
  title: string
  slug: string
  excerpt: string
  content: string
  imageUrl: string
  /** ISO; la fecha de publicación o, si no la hay, la de creación del registro. */
  publishedAt: string
  /** ISO de la última edición; "" si el panel no la manda. */
  updatedAt: string
  /** Minutos de lectura estimados del cuerpo; "" sin cuerpo. */
  readTime: string
  tags: string[]
  /** "" = el titular. */
  seoTitle: string
  /** "" = derivada del resumen o del cuerpo. */
  seoDescription: string
  /** "" = la portada del artículo. */
  ogImageUrl: string
}

function readTime(body: string): string {
  if (body === "") return ""
  const words = body.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min`
}

export function parseBlogPost(input: unknown): BlogPost | null {
  const raw = obj(input)
  if (!raw) return null
  const slug = str(raw.slug)
  const title = str(raw.title)
  if (slug === "") return null
  if (title === "") return null
  // Un borrador no es público aunque el backend lo devuelva.
  if (raw.published !== undefined && !bool(raw.published)) return null
  const content = str(raw.content)
  return {
    id: str(raw.id),
    title: normalizeHeadline(title),
    slug,
    excerpt: str(raw.excerpt),
    content,
    imageUrl: image(raw.imageUrl),
    publishedAt: firstStr(raw.publishedAt, raw.createdAt),
    updatedAt: str(raw.updatedAt),
    readTime: readTime(content),
    tags: [],
    seoTitle: str(raw.seoTitle),
    seoDescription: str(raw.seoDescription),
    ogImageUrl: image(raw.ogImageUrl),
  }
}

/** Artículos publicados, del más reciente al más antiguo. */
export function parseBlogPosts(input: unknown): BlogPost[] | null {
  const items = list(input)
  if (!items) return null
  return items
    .map(parseBlogPost)
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}
