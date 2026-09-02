import DOMPurify from "isomorphic-dompurify"
import { DEFAULTS } from "@/lib/store/content-store"
import { backendFetch, resolveImageUrl, extractList } from "@/lib/backend-client"
import { safeJsonLd } from "@/lib/seo-utils"
import { matchTreatmentsInText, seoTitleFor } from "@/lib/seo/treatment-names"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getFooterData } from "@/lib/data/footer"
import { staticBlogPosts, type StaticBlogPost } from "@/lib/data/blog-posts"
import { BlogCard } from "@/components/blog/BlogCard"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { ReadingProgressBar } from "@/components/ui/ReadingProgressBar"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BlogPageTracker } from "@/components/analytics/BlogPageTracker"

export const revalidate = 300 // 5 minutos — ISR; fuerza refresco si el admin edita el post

export async function generateStaticParams() {
  try {
    const { data: rawData } = await backendFetch("/blog", { revalidate: 3600 })
    const posts = extractList<BackendBlogPost>(rawData)
    return posts.filter((p) => p.published).map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

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
  const { data: rawData } = await backendFetch("/blog", { revalidate: 300 })
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
    title: `${post.title} | Dra. Yasmin Medrano — Medicina Estética Bolivia`,
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


/** Lo mínimo que necesita el bloque de tratamientos mencionados. */
interface BackendTreatmentRef {
  id: string
  slug: string
  name: string
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [allPosts, footerData, treatmentsResult] = await Promise.all([
    getAllPosts(),
    getFooterData(),
    backendFetch<BackendTreatmentRef[]>("/treatments?active=true", { revalidate: 300 }),
  ])
  const post = await resolvePost(slug, allPosts)
  const c = DEFAULTS
  if (!post) notFound()

  // Related posts (exclude current)
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 2)

  // Tratamientos que el artículo menciona.
  //
  // El blog hablaba de botox en dos artículos sin enlazar ni una vez a la
  // página de botox. Un enlace interno cuyo texto ES la palabra clave, apuntando
  // a la página que trata de ella, es de las señales de relevancia más directas
  // que existen — y no había ninguna. Se derivan del propio texto, así que un
  // artículo nuevo queda enlazado sin que nadie configure nada.
  const activeTreatments = extractList<BackendTreatmentRef>(treatmentsResult.data)
  const plainPost = `${post.title} ${(post.content ?? "").replace(/<[^>]*>/g, " ")}`
  const mentionedSlugs = matchTreatmentsInText(plainPost)
  const relatedTreatments = mentionedSlugs
    .map((ts) => activeTreatments.find((t) => t.slug === ts))
    .filter((t): t is BackendTreatmentRef => Boolean(t))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.imageUrl,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      // `@id` apunta a la ficha Physician del layout: sin esto, el autor del
      // artículo era una persona anónima sin relación con la doctora del sitio,
      // y la autoridad del artículo no sumaba a la de ella (ni al revés).
      "@id": `${BASE_URL}/#doctor`,
      name: post.author,
      jobTitle: "Médica Especialista en Medicina Estética",
      sameAs: [
        "https://www.instagram.com/dra_yasmin.medrano",
        "https://www.facebook.com/DraMedranoMedesteticAntiaging",
      ],
    },
    publisher: {
      "@type": "MedicalBusiness",
      name: "Dra. Yasmin Medrano Avila - Medicina Estetica",
      url: BASE_URL,
    },
    mainEntityOfPage: `${BASE_URL}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".blog-content p"],
    },
    inLanguage: "es-BO",
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
      <ReadingProgressBar />
      <BlogPageTracker slug={post.slug} title={post.title} />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
        />

        {/* Article content */}
        <article className="py-8 px-6" style={{ backgroundColor: "#F8F0E3" }}>
          <div className="max-w-3xl mx-auto">

            {/* Back link */}
            <div className="mb-6">
              <Link
                href="/blog"
                aria-label="Volver al listado del blog"
                className="inline-flex items-center gap-2 text-xs font-medium hover:opacity-80 transition-opacity py-2 -my-2"
                style={{ color: "var(--vintage-gold)", fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.08em" }}
              >
                <ArrowLeft size={14} aria-hidden="true" /> VOLVER AL BLOG
              </Link>
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-5xl font-light leading-tight mb-4"
              style={{ color: "var(--primary-darkest)", fontFamily: "var(--font-display, Georgia, serif)", letterSpacing: "-0.02em" }}
            >
              {post.title}
            </h1>

            {/* Meta info */}
            <div
              className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b"
              style={{ borderColor: "rgba(184,151,59,0.2)" }}
            >
              <span className="text-sm font-medium" style={{ color: "var(--primary-darkest)" }}>
                {post.author}
              </span>
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--vintage-gold)" }}>
                <Calendar size={14} />
                {new Date(post.publishedAt).toLocaleDateString("es-BO", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--vintage-gold)" }}>
                <Clock size={14} />
                {post.readTime} de lectura
              </span>
            </div>

            {/* Cover image */}
            <div className="w-full rounded-2xl overflow-hidden mb-8 relative" style={{ aspectRatio: "16/9", backgroundColor: "#F8F0E3" }}>
              <ImageWithFallback
                src={post.imageUrl ?? ""}
                alt={post.title}
                variant="light"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                loading="eager"
              />
            </div>

            {/* Content */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
          </div>
        </article>

        {/* Related posts */}
        {relatedTreatments.length > 0 && (
          <section className="py-12 px-6" aria-labelledby="tratamientos-mencionados">
            <div className="container-xl max-w-3xl">
              <h2
                id="tratamientos-mencionados"
                className="text-xl font-bold mb-6"
                style={{ color: "var(--primary-darkest)" }}
              >
                Tratamientos que menciona este artículo
              </h2>
              <ul className="flex flex-wrap gap-3">
                {relatedTreatments.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tratamientos/${t.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors"
                      style={{
                        border: "1px solid var(--vintage-gold)",
                        color: "var(--primary-darkest)",
                        borderRadius: "2px",
                      }}
                    >
                      {seoTitleFor(t.slug, t.name)}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="py-16 px-6" style={{ backgroundColor: "#F8F0E3" }} aria-label="Artículos relacionados">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-bold mb-8" style={{ color: "var(--primary-darkest)" }}>
                Articulos relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {related.map((r) => (
                  <BlogCard
                    key={r.id}
                    id={r.id}
                    title={r.title}
                    slug={r.slug}
                    excerpt={r.excerpt}
                    imageUrl={r.imageUrl}
                    publishedAt={r.publishedAt}
                    readTime={r.readTime}
                    tags={r.tags}
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
