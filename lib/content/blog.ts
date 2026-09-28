import { cache } from "react"
import { fromService } from "./service"
import { parseBlogPosts, type BlogPost } from "./parse/blog"
import { BLOG_FALLBACK } from "./fallback/blog"

export type { BlogPost }

/** Artículos publicados, del más reciente al más antiguo. */
export const getPosts = cache(() =>
  fromService("/blog?published=true", parseBlogPosts, BLOG_FALLBACK, { revalidate: 300 })
)

/**
 * Por slug, desde la lista (el backend solo busca por id). Del mismo origen
 * que la lista: con servicio, solo artículos del servicio.
 */
export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const { data } = await getPosts()
  const found = data.find((p) => p.slug === slug)
  return found ? found : null
})
