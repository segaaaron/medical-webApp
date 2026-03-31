import { readContent } from "@/lib/store/content-store"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CourseSection } from "@/components/sections/CourseSection"
import { PresetsSection } from "@/components/sections/PresetsSection"
import { socialLinks } from "@/lib/data/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tratamientos | Dra. Yasmin Medrano Avila",
  description:
    "Conoce todos los tratamientos de medicina estética: faciales, corporales, rejuvenecimiento y más. Consulta de valoración gratuita.",
}

export default async function TratamientosPage() {
  const c = await readContent()

  return (
    <>
      <Navbar links={c.navLinks} />
      <main>
        {/* Page hero */}
        <div className="py-16 px-6 text-center" style={{ backgroundColor: "#1a0510" }}>
          <p className="text-sm uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: "#e8a0b4" }}>
            Medicina Estética
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Nuestros Tratamientos</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#fce4ec" }}>
            Tratamientos faciales y corporales con tecnología de vanguardia y los más altos estándares de seguridad médica.
          </p>
        </div>

        <CourseSection
          included={c.courseIncluded}
          modules={c.courseModules}
          pricing={c.coursePricing}
        />
        <PresetsSection presets={c.presets} />
      </main>
      <Footer groups={c.footerGroups} socials={socialLinks} />
    </>
  )
}
