import { DEFAULTS } from "@/lib/store/content-store"
import { backendFetch, resolveImageUrl, extractList } from "@/lib/backend-client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getFooterData } from "@/lib/data/footer"
import { staticBlogPosts, type StaticBlogPost } from "@/lib/data/blog-posts"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

interface BackendBlogPost {
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

/** Map a backend post to the StaticBlogPost shape used by the UI */
function toStaticPost(p: BackendBlogPost): StaticBlogPost {
  const body = p.content ?? ""
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? "",
    content: body,
    imageUrl: resolveImageUrl(p.imageUrl),
    publishedAt: p.publishedAt ?? p.createdAt,
    author: "Dra. Yasmin Medrano Avila",
    readTime: body
      ? `${Math.max(1, Math.ceil(body.split(/\s+/).length / 200))} min`
      : "5 min",
    tags: [],
  }
}

/** Get all published posts — backend first, static fallback */
async function getAllPosts(): Promise<StaticBlogPost[]> {
  const { data: rawData } = await backendFetch("/blog")
  const data = extractList<BackendBlogPost>(rawData)
  if (data.length === 0) {
    console.warn("[getAllPosts] Backend unavailable, using static posts")
    return staticBlogPosts
  }
  return data.filter((p) => p.published).map(toStaticPost)
}

/** Resolve a single post by slug from the full list */
async function resolvePost(
  slug: string,
  allPosts: StaticBlogPost[],
): Promise<StaticBlogPost | null> {
  return allPosts.find((p) => p.slug === slug) ?? null
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const allPosts = await getAllPosts()
  const post = await resolvePost(slug, allPosts)
  if (!post) return {}

  return {
    title: `${post.title} | Dra. Yasmin Medrano Avila`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: `${BASE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${BASE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: post.imageUrl ? [{ url: post.imageUrl, width: 1200, height: 630, alt: post.title }] : [],
      locale: "es_BO",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  }
}


export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [allPosts, footerData] = await Promise.all([getAllPosts(), getFooterData()])
  const post = await resolvePost(slug, allPosts)
  const c = DEFAULTS
  if (!post) notFound()

  // Related posts (exclude current)
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 2)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.imageUrl,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: "Medica Especialista en Medicina Estetica",
    },
    publisher: {
      "@type": "MedicalBusiness",
      name: "Dra. Yasmin Medrano Avila - Medicina Estetica",
      url: BASE_URL,
    },
    mainEntityOfPage: `${BASE_URL}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  }

  return (
    <>
      <Navbar links={c.navLinks} />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />

        {/* Back link */}
        <div className="max-w-3xl mx-auto px-6 pt-6">
          <Link
            href="/blog"
            aria-label="Volver al listado del blog"
            className="inline-flex items-center gap-2 text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ color: "#b5496a" }}
          >
            <ArrowLeft size={14} aria-hidden="true" /> Volver al blog
          </Link>
        </div>

        {/* Article content */}
        <article className="py-8 px-6" style={{ backgroundColor: "#fff" }}>
          <div className="max-w-3xl mx-auto">

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4" style={{ color: "#3a0f20" }}>
              {post.title}
            </h1>

            {/* Meta info */}
            <div
              className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b"
              style={{ borderColor: "#f0e0e6" }}
            >
              <span className="text-sm font-medium" style={{ color: "#3a0f20" }}>
                {post.author}
              </span>
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "#b5496a" }}>
                <Calendar size={14} />
                {new Date(post.publishedAt).toLocaleDateString("es-BO", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "#b5496a" }}>
                <Clock size={14} />
                {post.readTime} de lectura
              </span>
            </div>

            {/* Cover image */}
            {post.imageUrl && (
              <div className="w-full rounded-2xl overflow-hidden mb-8" style={{ backgroundColor: "#f5edf0" }}>
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto block"
                  loading="eager"
                />
              </div>
            )}

            {/* Content */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="py-16 px-6" style={{ backgroundColor: "#faf5f7" }} aria-label="Artículos relacionados">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-bold mb-8" style={{ color: "#3a0f20" }}>
                Articulos relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {r.imageUrl && (
                      <div className="w-full h-40 overflow-hidden">
                        <img
                          src={r.imageUrl}
                          alt={`${r.title} - Blog`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3
                        className="font-bold text-base mb-2 leading-tight"
                        style={{ color: "#3a0f20" }}
                      >
                        {r.title}
                      </h3>
                      <p className="text-sm line-clamp-2" style={{ color: "#7a6570" }}>
                        {r.excerpt}
                      </p>
                    </div>
                  </Link>
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
