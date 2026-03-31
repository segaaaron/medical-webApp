import { readContent } from "@/lib/store/content-store"
import { backendFetch } from "@/lib/backend-client"
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
  openGraph: {
    title: "Tratamientos | Dra. Yasmin Medrano Avila",
    description:
      "Conoce todos los tratamientos de medicina estética: faciales, corporales, rejuvenecimiento y más. Consulta de valoración gratuita.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tratamientos`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
    locale: "es_BO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tratamientos | Dra. Yasmin Medrano Avila",
    description:
      "Conoce todos los tratamientos de medicina estética: faciales, corporales, rejuvenecimiento y más. Consulta de valoración gratuita.",
    images: ["/og-image.jpg"],
  },
}

interface BackendTreatment {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
  active: boolean
}

export default async function TratamientosPage() {
  const [c, backendResult] = await Promise.all([
    readContent(),
    backendFetch<BackendTreatment[]>("/treatments?active=true"),
  ])

  // If the backend has treatments, override the module list with live data
  const backendTreatments = backendResult.data ?? []
  const liveModules =
    backendTreatments.length > 0
      ? backendTreatments.map((t) => ({ title: t.name }))
      : c.courseModules

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
          modules={liveModules}
          pricing={c.coursePricing}
        />
        <PresetsSection presets={c.presets} />
      </main>
      <Footer groups={c.footerGroups} socials={socialLinks} />
    </>
  )
}
