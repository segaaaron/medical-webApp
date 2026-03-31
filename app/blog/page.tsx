import { readContent } from "@/lib/store/content-store"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { FAQSection } from "@/components/sections/FAQSection"
import { socialLinks } from "@/lib/data/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog | Dra. Yasmin Medrano Avila",
  description:
    "Artículos, consejos y novedades sobre medicina estética, cuidado de la piel y bienestar.",
}

export default async function BlogPage() {
  const c = await readContent()

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

        <FAQSection faqs={c.faqs} />
      </main>
      <Footer groups={c.footerGroups} socials={socialLinks} />
    </>
  )
}
