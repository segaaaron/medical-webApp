import type { MetadataRoute } from "next"
import { staticBlogPosts } from "@/lib/data/blog-posts"
import { backendFetch, extractList } from "@/lib/backend-client"

export const revalidate = 86400

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasminmedrano.com"

interface BackendBlogPost {
  slug: string
  publishedAt: string | null
  createdAt: string
  published: boolean
}

interface BackendTreatment {
  id: string
  slug: string
  active: boolean
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Ambas lecturas van cacheadas y en paralelo. Cacheadas porque, sin
  // `revalidate`, `backendFetch` usa `no-store` y eso volvía la ruta dinámica:
  // el `revalidate = 86400` de arriba era letra muerta y cada bot que pedía el
  // sitemap disparaba dos llamadas al backend. Cacheadas además quedan
  // etiquetadas por recurso, así que publicar o borrar un post/tratamiento
  // refresca el sitemap al instante en vez de esperar 24 h.
  const [{ data: rawBlogData }, { data: rawTreatmentData }] = await Promise.all([
    backendFetch("/blog?published=true", { revalidate: 86400 }),
    backendFetch("/treatments?active=true", { revalidate: 86400 }),
  ])

  const blogData = extractList<BackendBlogPost>(rawBlogData)
  const blogEntries: MetadataRoute.Sitemap = blogData.length > 0
    ? blogData
        .filter((p) => p.published)
        .map((post) => ({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: new Date(post.publishedAt ?? post.createdAt),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }))
    : staticBlogPosts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))

  const treatmentData = extractList<BackendTreatment>(rawTreatmentData)
  const now = new Date()
  const treatmentEntries: MetadataRoute.Sitemap = treatmentData
    .filter((t) => t.active)
    .map((t) => ({
      url: `${BASE_URL}/tratamientos/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tratamientos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/nosotros`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terminos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...treatmentEntries,
    ...blogEntries,
  ]
}
