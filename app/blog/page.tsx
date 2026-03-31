import { readContent } from "@/lib/store/content-store"
import { backendFetch } from "@/lib/backend-client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { FAQSection } from "@/components/sections/FAQSection"
import { socialLinks } from "@/lib/data/navigation"
import { Calendar } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog | Dra. Yasmin Medrano Avila",
  description:
    "Artículos, consejos y novedades sobre medicina estética, cuidado de la piel y bienestar.",
  openGraph: {
    title: "Blog | Dra. Yasmin Medrano Avila",
    description:
      "Artículos, consejos y novedades sobre medicina estética, cuidado de la piel y bienestar.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
    locale: "es_BO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Dra. Yasmin Medrano Avila",
    description:
      "Artículos, consejos y novedades sobre medicina estética, cuidado de la piel y bienestar.",
    images: ["/og-image.jpg"],
  },
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  imageUrl: string | null
  publishedAt: string | null
  createdAt: string
}

export default async function BlogPage() {
  const [c, backendResult] = await Promise.all([
    readContent(),
    backendFetch<BlogPost[]>("/blog?published=true"),
  ])

  const posts = backendResult.data ?? []

  return (
    <>
      <Navbar links={c.navLinks} />
      <main>
        {/* Page hero */}
        <div className="py-16 px-6 text-center" style={{ backgroundColor: "#1a0510" }}>
          <p className="text-sm uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: "#e8a0b4" }}>
            Consejos & Novedades
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#fce4ec" }}>
            Resolvemos tus dudas y compartimos información útil sobre medicina estética y cuidado personal.
          </p>
        </div>

        {/* Blog posts from backend */}
        {posts.length > 0 ? (
          <section className="py-20 px-6" style={{ backgroundColor: "#faf5f7" }}>
            <div className="container-xl max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {post.imageUrl && (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="font-bold text-lg mb-3 leading-tight" style={{ color: "#3a0f20" }}>
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm leading-relaxed mb-4" style={{ color: "#7a6570" }}>
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs" style={{ color: "#b5496a" }}>
                        <Calendar size={13} />
                        {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("es-BO", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : (
          /* Fallback: show FAQs while there are no posts */
          <FAQSection faqs={c.faqs} />
        )}
      </main>
      <Footer groups={c.footerGroups} socials={socialLinks} />
    </>
  )
}
