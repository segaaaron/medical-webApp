import { readContent } from "@/lib/store/content-store"
import { backendFetch, resolveImageUrl, extractList } from "@/lib/backend-client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getFooterData } from "@/lib/data/footer"
import { staticBlogPosts } from "@/lib/data/blog-posts"
import { BlogCard } from "@/components/blog/BlogCard"
import type { Metadata } from "next"

export const revalidate = 300 // 5 minutos — ISR

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

export const metadata: Metadata = {
  title: "Blog de Medicina Estetica - Consejos, Tratamientos y Novedades",
  description:
    "Articulos sobre medicina estetica, botox, acido hialuronico y cuidado de la piel. Informacion confiable de la Dra. Yasmin Medrano Avila.",
  keywords: [
    "blog medicina estetica",
    "consejos cuidado piel",
    "articulos botox",
    "informacion acido hialuronico",
    "novedades medicina estetica",
  ],
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
  openGraph: {
    title: "Blog | Dra. Yasmin Medrano Avila",
    description:
      "Articulos y consejos sobre medicina estetica, cuidado de la piel y bienestar.",
    url: `${BASE_URL}/blog`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Blog de Medicina Estetica - Dra. Yasmin Medrano Avila" }],
    type: "website",
    locale: "es_BO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Dra. Yasmin Medrano Avila",
    description:
      "Consejos y novedades sobre medicina estetica y cuidado de la piel.",
    images: ["/og-image.jpg"],
  },
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  imageUrl: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

/**
 * Fetch blog posts: tries backend with auth, falls back to static defaults.
 * Uses the same resilient pattern as /api/blog route.
 */
async function fetchPublishedPosts() {
  const { data: rawData, error } = await backendFetch("/blog", { revalidate: 300 })

  if (error || !rawData) {
    console.warn("[BlogPage] Backend unavailable, using static posts:", error)
    return staticBlogPosts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      imageUrl: p.imageUrl,
      published: true,
      publishedAt: p.publishedAt,
      createdAt: p.publishedAt,
    })) as BlogPost[]
  }

  return extractList<BlogPost>(rawData)
}

export default async function BlogPage() {
  const [allBackendPosts, footerData, c] = await Promise.all([
    fetchPublishedPosts(),
    getFooterData(),
    readContent(),
  ])

  const publishedPosts = allBackendPosts.filter((p) => p.published)

  // Single source: backend posts when available, static posts only as fallback (set in fetchPublishedPosts)
  const allPosts = publishedPosts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? "",
    imageUrl: resolveImageUrl(p.imageUrl),
    publishedAt: p.publishedAt ?? p.createdAt,
    author: "Dra. Yasmin Medrano Avila",
    readTime: p.content
      ? `${Math.max(1, Math.ceil(p.content.split(/\s+/).length / 200))} min`
      : "5 min",
    tags: [] as string[],
  })).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const [featured, ...rest] = allPosts

  return (
    <>
      <Navbar links={c.navLinks} />
      <main>
        {/* Hero */}
        <section className="py-16 px-6 text-center" style={{ backgroundColor: "#1a0510" }}>
          <p
            className="text-sm uppercase tracking-[0.3em] font-semibold mb-3"
            style={{ color: "#e8a0b4" }}
          >
            Consejos & Novedades
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#fce4ec" }}>
            Informacion confiable sobre medicina estetica, cuidado de la piel y bienestar
            de la mano de la Dra. Yasmin Medrano Avila.
          </p>
        </section>

        {/* Empty state */}
        {allPosts.length === 0 && (
          <section className="py-20 px-6 text-center" style={{ backgroundColor: "#F8F0E3" }} aria-label="Sin artículos">
            <p className="text-lg" style={{ color: "#7a6570" }}>
              No hay artículos disponibles por el momento.
            </p>
          </section>
        )}

        {/* Featured post */}
        {featured && (
          <section className="py-12 px-6" style={{ backgroundColor: "#F8F0E3" }} aria-label="Artículo destacado">
            <div className="max-w-5xl mx-auto">
              <p
                className="text-xs uppercase tracking-[0.2em] font-semibold mb-6"
                style={{ color: "#B8973B", fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
              >
                Articulo destacado
              </p>
              <BlogCard
                id={featured.id}
                title={featured.title}
                slug={featured.slug}
                excerpt={featured.excerpt}
                imageUrl={featured.imageUrl}
                publishedAt={featured.publishedAt}
                readTime={featured.readTime}
                tags={featured.tags}
                variant="featured"
              />
            </div>
          </section>
        )}

        {/* Post grid */}
        {rest.length > 0 && (
          <section className="py-16 px-6" style={{ backgroundColor: "#F8F0E3" }} aria-label="Todos los artículos">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-8" style={{ color: "#3a0f20" }}>
                Todos los articulos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rest.map((post) => (
                  <BlogCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    imageUrl={post.imageUrl}
                    publishedAt={post.publishedAt}
                    readTime={post.readTime}
                    tags={post.tags}
                    variant="grid"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer data={footerData} />
    </>
  )
}
