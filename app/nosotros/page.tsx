import { readContent } from "@/lib/store/content-store"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AboutSection } from "@/components/sections/AboutSection"
import { ValuePropositionSection } from "@/components/sections/ValuePropositionSection"
import { socialLinks } from "@/lib/data/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nosotros | Dra. Yasmin Medrano Avila",
  description:
    "Conoce a la Dra. Yasmin Medrano Avila, especialista en medicina estética con más de 10 años de experiencia y más de 5000 pacientes atendidos.",
}

export default async function NosotrosPage() {
  const c = await readContent()

  return (
    <>
      <Navbar links={c.navLinks} />
      <main>
        {/* Page hero */}
        <div className="py-16 px-6 text-center" style={{ backgroundColor: "#1a0510" }}>
          <p className="text-sm uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: "#e8a0b4" }}>
            Nuestra Historia
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Sobre Nosotros</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#fce4ec" }}>
            Dedicados a realzar tu belleza natural con los más altos estándares médicos y un trato completamente personalizado.
          </p>
        </div>

        <AboutSection bio={c.about.bio} stats={c.about.stats} />
        <ValuePropositionSection features={c.valueFeatures} />
      </main>
      <Footer groups={c.footerGroups} socials={socialLinks} />
    </>
  )
}
