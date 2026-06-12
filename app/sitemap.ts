import type { MetadataRoute } from "next"
import { staticBlogPosts } from "@/lib/data/blog-posts"
import { backendFetch, extractList } from "@/lib/backend-client"

export const revalidate = 86400

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

interface BackendBlogPost {
  slug: string
  publishedAt: string | null
  createdAt: string
  published: boolean
}

interface BackendTreatment {
  id: string
  active: boolean
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch blog posts from backend (fallback to static)
  const { data: rawBlogData } = await backendFetch("/blog?published=true")
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

  // Fetch active treatments from backend
  const { data: rawTreatmentData } = await backendFetch("/treatments?active=true")
  const treatmentData = extractList<BackendTreatment>(rawTreatmentData)
  const now = new Date()
  const treatmentEntries: MetadataRoute.Sitemap = treatmentData
    .filter((t) => t.active)
    .map((t) => ({
      url: `${BASE_URL}/tratamientos/${t.id}`,
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
    ...treatmentEntries,
    ...blogEntries,
  ]
}
