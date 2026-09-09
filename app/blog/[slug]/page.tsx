import { sanitizeBody } from "@/lib/html/sanitize"
import { BASE_URL } from "@/lib/seo/site-url"
import { DEFAULTS } from "@/lib/store/content-store"
import { backendFetch, resolveImageUrl, extractList } from "@/lib/backend-client"
import { safeJsonLd } from "@/lib/seo-utils"
import { matchTreatmentsInText, seoTitleFor, normalizeHeadline } from "@/lib/seo/treatment-names"
import { buildMetaDescription } from "@/lib/seo/meta"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getFooterData } from "@/lib/data/footer"
import { AuthorBox } from "@/components/blog/AuthorBox"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { normalizeSocialUrl } from "@/lib/seo/meta"
import { staticBlogPosts, type StaticBlogPost } from "@/lib/data/blog-posts"
import { BlogCard } from "@/components/blog/BlogCard"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { ReadingProgressBar } from "@/components/ui/ReadingProgressBar"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BlogPageTracker } from "@/components/analytics/BlogPageTracker"

/**
 * NO añadir `loading.tsx` en este segmento.
 *
 * Un `loading.tsx` crea un límite de Suspense implícito que hace que Next
 * empiece a transmitir la respuesta —y por tanto envíe las cabeceras— ANTES de
 * ejecutar el componente. Cuando después se llama a `notFound()`, el estado ya
 * se mandó: la página respondía **HTTP 200** mostrando el contenido de 404.
 *
 * Eso es un «soft 404»: para Google la URL existe y es contenido pobre, así que
 * la indexa y gasta presupuesto de rastreo en artículos inventados. Medido:
 * `/blog/cualquier-cosa` devolvía 200 mientras `/tratamientos/cualquier-cosa`
 * —sin `loading.tsx`— devolvía 404 correctamente.
 *
 * El coste de quitarlo es mínimo: la página es ISR, se sirve desde caché.
 */

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
  updatedAt?: string | null
}

/** Map a backend post to the StaticBlogPost shape used by the UI */
function toStaticPost(p: BackendBlogPost): StaticBlogPost {
  const body = p.content ?? ""
  return {
    id: p.id,
    // El panel a veces trae el titular EN MAYÚSCULAS y entrecomillado. Google
    // lo respeta tal cual, y un resultado que grita pierde clics.
    title: normalizeHeadline(p.title),
    slug: p.slug,
    excerpt: p.excerpt ?? "",
    content: body,
    imageUrl: resolveImageUrl(p.imageUrl),
    publishedAt: p.publishedAt ?? p.createdAt,
    updatedAt: p.updatedAt ?? p.publishedAt ?? p.createdAt,
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

/** Fecha legible, o `null` si el panel no mandó una válida. */
function fechaLegible(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const allPosts = await getAllPosts()
  const post = await resolvePost(slug, allPosts)
  if (!post) return {}

  // El layout ya añade «| Dra. Yasmin Medrano Avila» con su `template`, así que
  // repetir la marca aquí producía títulos con la firma DOS veces y de más de
  // 160 caracteres — Google corta en ~60, de modo que el titular del artículo
  // se perdía detrás de la marca repetida.
  //
  // Y la description salía del `excerpt`, que el panel deja vacío a menudo: sin
  // texto, Google se inventa el fragmento. Ahora, si no hay resumen, se deriva
  // del propio artículo cortando en frase completa.
  const description = buildMetaDescription(
    post.excerpt || post.content || "",
    " | Dra. Yasmin Medrano, medicina estética en Cochabamba."
  )

  return {
    // Google corta en unos 60 caracteres. Con la plantilla del layout, un
    // titular largo se veía truncado Y con media marca detrás: se perdía el
    // final del titular, que es lo que responde a la búsqueda. Pasado ese
    // umbral, el titular va solo y se lee completo.
    title: post.title.length > 55 ? { absolute: post.title } : post.title,
    description,
    keywords: post.tags,
    alternates: { canonical: `${BASE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `${BASE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      // Sin foto NO se manda `images: []`: un array vacío pisaba el
      // `opengraph-image.tsx` del sitio y el artículo se compartía en WhatsApp
      // sin imagen. Omitir la clave deja que herede la del sitio.
      ...(post.imageUrl
        ? { images: [{ url: post.imageUrl, width: 1200, height: 630, alt: post.title }] }
        : {}),
      locale: "es_BO",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(post.imageUrl ? { images: [post.imageUrl] } : {}),
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

  const perfilesSociales = [
    footerData.facebookUrl,
    footerData.instagramUrl,
    footerData.tiktokUrl,
  ]
    .map(normalizeSocialUrl)
    .filter(Boolean)

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
  const mentionedSlugs = matchTreatmentsInText(plainPost, activeTreatments)
  const relatedTreatments = mentionedSlugs
    .map((ts) => activeTreatments.find((t) => t.slug === ts))
    .filter((t): t is BackendTreatmentRef => Boolean(t))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    // El panel deja el resumen vacío a menudo; entonces se deriva del propio
    // artículo, igual que la meta description.
    description: buildMetaDescription(post.excerpt || post.content || "", ""),
    image: post.imageUrl,
    datePublished: post.publishedAt,
    // `dateModified` faltaba: sin él, Google no distingue un artículo revisado
    // este mes de uno abandonado hace dos años, y en salud la vigencia pesa.
    dateModified: post.updatedAt ?? post.publishedAt,
    // Quién responde del contenido médico.
    reviewedBy: { "@id": `${BASE_URL}/#doctor` },
    medicalAudience: { "@type": "MedicalAudience", audienceType: "Patient" },
    // Solo la referencia: la ficha completa de la doctora vive en el `@graph`
    // del layout. Repetir aquí nombre, cargo y redes con el MISMO `@id` servía
    // una segunda versión de la misma entidad —y con un `sameAs` distinto, sin
    // TikTok—, que es exactamente la contradicción que el `@id` viene a evitar.
    author: { "@id": `${BASE_URL}/#doctor` },
    // Referencia al negocio del `@graph` del layout, no una copia: la copia
    // creaba un editor homónimo («Medicina Estetica», sin tilde) sin relación
    // con la ficha real del consultorio.
    publisher: { "@id": `${BASE_URL}/#business` },
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

        {/* Mismo fondo que el artículo: `main` no pinta ninguno y las migas
            quedaban sobre el blanco del body, como una franja suelta. */}
        <div style={{ backgroundColor: "#F8F0E3" }}>
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />
        </div>

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
              {/* Sin fecha válida no se pinta nada: «Invalid Date» bajo el
                  titular de un artículo de salud es peor que no poner fecha. */}
              {fechaLegible(post.publishedAt) && (
                <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--vintage-gold)" }}>
                  <Calendar size={14} />
                  {fechaLegible(post.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--vintage-gold)" }}>
                <Clock size={14} />
                {post.readTime} de lectura
              </span>
              {/* La vigencia pesa en salud: un artículo revisado este mes vale
                  más que uno abandonado hace dos años. Solo se muestra cuando
                  la revisión existe de verdad. */}
              {fechaLegible(post.updatedAt) &&
                new Date(post.updatedAt as string).getTime() > new Date(post.publishedAt).getTime() && (
                  <span className="text-sm" style={{ color: "var(--primary-darkest)", opacity: 0.7 }}>
                    Revisado el {fechaLegible(post.updatedAt)}
                  </span>
                )}
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
              dangerouslySetInnerHTML={{ __html: sanitizeBody(post.content) }}
            />

            {/* Firma médica: lo que el JSON-LD ya afirma, dicho también en la
                página. En contenido de salud Google exige ver quién responde. */}
            <AuthorBox
              name={post.author}
              publishedAt={post.publishedAt}
              updatedAt={post.updatedAt}
              perfiles={perfilesSociales}
            />
          </div>
        </article>

        {/* Tratamientos que menciona el artículo.
            El fondo crema es explícito: la sección no declaraba ninguno, así
            que caía sobre el `background-color: #3a0f20` del body y pintaba
            texto `--primary-darkest` encima. El título y los tres enlaces a
            tratamientos eran ILEGIBLES —pulsables, pero invisibles—, que es
            justo la señal de enlace interno que este bloque existe para dar. */}
        {relatedTreatments.length > 0 && (
          <section
            className="py-12 px-6"
            aria-labelledby="tratamientos-mencionados"
            style={{ backgroundColor: "#F8F0E3" }}
          >
            <div className="max-w-3xl mx-auto">
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
