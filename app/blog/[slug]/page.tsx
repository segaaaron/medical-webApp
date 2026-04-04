import { DEFAULTS } from "@/lib/store/content-store"
import { backendFetch } from "@/lib/backend-client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { socialLinks } from "@/lib/data/navigation"
import { staticBlogPosts, type StaticBlogPost } from "@/lib/data/blog-posts"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasminmedrano.com"

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
    imageUrl: p.imageUrl ?? "",
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
  const { data } = await backendFetch<BackendBlogPost[]>("/blog")
  if (!data) {
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

function renderContent(content: string) {
  if (!content) return null
  // Simple markdown-like rendering for blog content
  return content.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="text-xl md:text-2xl font-bold mt-10 mb-4"
          style={{ color: "#3a0f20" }}
        >
          {block.replace("## ", "")}
        </h2>
      )
    }

    // List blocks
    if (block.startsWith("- ") || block.includes("\n- ")) {
      const lines = block.split("\n")
      const intro = lines[0].startsWith("- ") ? null : lines.shift()
      return (
        <div key={i}>
          {intro && (
            <p className="text-base leading-relaxed mb-3" style={{ color: "#4a3040" }}>
              {intro}
            </p>
          )}
          <ul className="list-disc pl-6 space-y-2 mb-4">
            {lines
              .filter((l) => l.startsWith("- "))
              .map((line, j) => {
                const text = line.replace("- ", "")
                // Handle **bold** text
                const parts = text.split(/\*\*(.*?)\*\*/)
                return (
                  <li key={j} className="text-base leading-relaxed" style={{ color: "#4a3040" }}>
                    {parts.map((part, k) =>
                      k % 2 === 1 ? (
                        <strong key={k} style={{ color: "#3a0f20" }}>
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </li>
                )
              })}
          </ul>
        </div>
      )
    }

    // Regular paragraph with **bold** support
    const parts = block.split(/\*\*(.*?)\*\*/)
    return (
      <p key={i} className="text-base leading-relaxed mb-4" style={{ color: "#4a3040" }}>
        {parts.map((part, k) =>
          k % 2 === 1 ? (
            <strong key={k} style={{ color: "#3a0f20" }}>
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    )
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const allPosts = await getAllPosts()
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

  return (
    <>
      <Navbar links={c.navLinks} />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Hero image */}
        <div className="relative w-full h-64 md:h-96" style={{ backgroundColor: "#1a0510" }}>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover opacity-40"
              loading="eager"
            />
          )}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-3xl mx-auto px-6 pb-8">
              <Link
                href="/blog"
                aria-label="Volver al listado del blog"
                className="inline-flex items-center gap-2 text-xs font-medium mb-4 hover:opacity-80 transition-opacity"
                style={{ color: "#e8a0b4" }}
              >
                <ArrowLeft size={14} aria-hidden="true" /> Volver al blog
              </Link>
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ backgroundColor: "rgba(252,228,236,0.2)", color: "#fce4ec" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Article content */}
        <article className="py-12 px-6" style={{ backgroundColor: "#fff" }}>
          <div className="max-w-3xl mx-auto">
            {/* Meta info */}
            <div
              className="flex flex-wrap items-center gap-4 pb-8 mb-8 border-b"
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

            {/* Content */}
            <div className="prose-custom">{renderContent(post.content)}</div>
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
      <Footer groups={c.footerGroups} socials={socialLinks} />
    </>
  )
}
