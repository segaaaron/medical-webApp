import { DEFAULTS } from "@/lib/store/content-store"
import { backendFetch } from "@/lib/backend-client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { socialLinks } from "@/lib/data/navigation"
import { staticBlogPosts, type StaticBlogPost } from "@/lib/data/blog-posts"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const dynamic = "force-dynamic"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasminmedrano.com"

export const metadata: Metadata = {
  title: "Blog de Medicina Estetica - Consejos, Tratamientos y Novedades",
  description:
    "Articulos, consejos y novedades sobre medicina estetica, cuidado de la piel, botox, acido hialuronico y bienestar. Informacion confiable de la Dra. Yasmin Medrano Avila.",
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
  const { data, error } = await backendFetch<BlogPost[]>("/blog")

  if (error || !data) {
    console.warn("[BlogPage] Backend unavailable, using static posts:", error)
    // Return static posts as published BlogPost[]
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

  return data
}

export default async function BlogPage() {
  const [allBackendPosts] = await Promise.all([
    fetchPublishedPosts(),
  ])
  const c = DEFAULTS

  const publishedPosts = allBackendPosts.filter((p) => p.published)

  // Single source: backend posts when available, static posts only as fallback (set in fetchPublishedPosts)
  const allPosts = publishedPosts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? "",
    imageUrl: p.imageUrl ?? "",
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
          <section className="py-20 px-6 text-center" style={{ backgroundColor: "#faf5f7" }} aria-label="Sin artículos">
            <p className="text-lg" style={{ color: "#7a6570" }}>
              No hay artículos disponibles por el momento.
            </p>
          </section>
        )}

        {/* Featured post */}
        {featured && (
          <section className="py-12 px-6" style={{ backgroundColor: "#faf5f7" }} aria-label="Artículo destacado">
            <div className="max-w-5xl mx-auto">
              <p
                className="text-xs uppercase tracking-[0.2em] font-semibold mb-6"
                style={{ color: "#b5496a" }}
              >
                Articulo destacado
              </p>
              <Link
                href={`/blog/${featured.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="grid md:grid-cols-2">
                  {featured.imageUrl && (
                    <div className="h-64 md:h-full overflow-hidden">
                      <img
                        src={featured.imageUrl}
                        alt={`${featured.title} - Blog de medicina estetica`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="eager"
                      />
                    </div>
                  )}
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featured.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{ backgroundColor: "#fce4ec", color: "#b5496a" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2
                      className="text-2xl md:text-3xl font-bold mb-4 leading-tight group-hover:opacity-80 transition-opacity"
                      style={{ color: "#3a0f20" }}
                    >
                      {featured.title}
                    </h2>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: "#7a6570" }}>
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs" style={{ color: "#b5496a" }}>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {formatDate(featured.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {featured.readTime}
                      </span>
                    </div>
                    <span
                      className="inline-flex items-center gap-2 mt-6 text-sm font-semibold group-hover:gap-3 transition-all"
                      style={{ color: "#b5496a" }}
                    >
                      Leer articulo completo <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Post grid */}
        {rest.length > 0 && (
          <section className="py-16 px-6" style={{ backgroundColor: "#fff" }} aria-label="Todos los artículos">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-8" style={{ color: "#3a0f20" }}>
                Todos los articulos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {post.imageUrl && (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={`${post.title} - Blog de medicina estetica`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "#fce4ec", color: "#b5496a" }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3
                        className="font-bold text-lg mb-3 leading-tight group-hover:opacity-80 transition-opacity"
                        style={{ color: "#3a0f20" }}
                      >
                        {post.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed mb-4 line-clamp-3"
                        style={{ color: "#7a6570" }}
                      >
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs" style={{ color: "#b5496a" }}>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {post.readTime}
                          </span>
                        </div>
                        <ArrowRight
                          size={16}
                          aria-hidden="true"
                          className="group-hover:translate-x-1 transition-transform"
                          style={{ color: "#b5496a" }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer groups={c.footerGroups} socials={socialLinks} />
    </>
  )
}
