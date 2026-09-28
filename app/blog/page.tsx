import { BASE_URL } from "@/lib/seo/site-url"
import { pageSeoMetadata } from "@/lib/seo/meta"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getFooter } from "@/lib/content/footer"
import { getNavLinks } from "@/lib/content/site-main"
import { getPosts } from "@/lib/content/blog"
import { getSiteSeo } from "@/lib/content/seo"
import { BlogCard } from "@/components/blog/BlogCard"
import { safeJsonLd } from "@/lib/seo-utils"
import type { Metadata } from "next"

export const revalidate = 300 // 5 minutos — ISR


const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
  ],
}

export async function generateMetadata(): Promise<Metadata> {
  const { blog } = await getSiteSeo()
  return pageSeoMetadata(blog, {
    canonical: `${BASE_URL}/blog`,
    ogImageAlt: "Blog de medicina estética — Dra. Yasmin Medrano Avila, Cochabamba",
  })
}

export default async function BlogPage() {
  const [posts, footerData, navLinks] = await Promise.all([getPosts(), getFooter(), getNavLinks()])
  // Del servicio o, si no responde, el respaldo entero (lib/content/blog.ts).
  const allPosts = posts.data

  const [featured, ...rest] = allPosts

  /**
   * El listado como `Blog` con su índice de artículos.
   *
   * Sin esto la página era, para un buscador, una rejilla de enlaces sueltos:
   * nada decía que fuera una publicación firmada por una médica ni qué
   * artículos la componen. `blogPost` con el orden real es además lo que un
   * motor de respuestas usa para enumerar («escribe sobre bótox, rellenos…»),
   * y `author`/`publisher` cuelgan de las entidades que ya sirve el layout.
   */
  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BASE_URL}/blog#blog`,
    name: "Blog de medicina estética — Dra. Yasmin Medrano Avila",
    description:
      "Artículos sobre medicina estética, cuidado de la piel y tratamientos faciales, escritos y revisados por la Dra. Yasmin Medrano Avila en Cochabamba, Bolivia.",
    url: `${BASE_URL}/blog`,
    inLanguage: "es-BO",
    author: { "@id": `${BASE_URL}/#doctor` },
    publisher: { "@id": `${BASE_URL}/#business` },
    blogPost: allPosts.slice(0, 30).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${BASE_URL}/blog/${p.slug}`,
      datePublished: p.publishedAt,
      author: { "@id": `${BASE_URL}/#doctor` },
      ...(p.imageUrl ? { image: p.imageUrl } : {}),
      ...(p.excerpt ? { description: p.excerpt } : {}),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(blogLd) }}
      />
      <Navbar links={navLinks} />
      <main>
        {/* Hero */}
        <section className="py-6 px-6 text-center" style={{ backgroundColor: "#1a0510" }}>
          <p
            className="text-sm uppercase tracking-[0.3em] font-semibold mb-3"
            style={{ color: "var(--meteorite)" }}
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
            <p className="text-lg" style={{ color: "var(--gray-mid)" }}>
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
                style={{ color: "var(--vintage-gold)", fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
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
              <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--primary-darkest)" }}>
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
