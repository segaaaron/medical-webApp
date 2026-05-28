import { readContent } from "@/lib/store/content-store"
import { safeJsonLd } from "@/lib/seo-utils"
import { backendFetch, resolveImageUrl, extractList } from "@/lib/backend-client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ServiceSection, type TreatmentsPageInfo } from "@/components/sections/CourseSection"
import { PresetsSection } from "@/components/sections/PresetsSection"
import { TreatmentsGrid } from "@/components/sections/TreatmentsGrid"
import { getFooterData } from "@/lib/data/footer"
import { PageHero } from "@/components/ui/PageHero"
import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

export const metadata: Metadata = {
  title: "Tratamientos Estéticos | Dra. Yasmin Medrano Avila",
  description:
    "Botox, acido hialuronico, armonizacion facial, depilacion laser y mesoterapia. Consulta de valoracion gratuita con la Dra. Yasmin Medrano Avila.",
  keywords: [
    "tratamientos medicina estetica",
    "botox",
    "acido hialuronico",
    "armonizacion facial",
    "depilacion laser",
    "mesoterapia facial",
    "rejuvenecimiento facial",
    "tratamientos corporales esteticos",
    "radiofrecuencia facial",
    "bioestimulacion",
  ],
  alternates: {
    canonical: `${BASE_URL}/tratamientos`,
  },
  openGraph: {
    title: "Tratamientos de Medicina Estetica | Dra. Yasmin Medrano Avila",
    description:
      "Botox, rellenos con acido hialuronico, rejuvenecimiento facial, depilacion laser y mas. Consulta de valoracion gratuita.",
    url: `${BASE_URL}/tratamientos`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Tratamientos de medicina estetica - Dra. Yasmin Medrano Avila" }],
    type: "website",
    locale: "es_BO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tratamientos de Medicina Estetica | Dra. Yasmin Medrano Avila",
    description:
      "Botox, rellenos, armonizacion facial, depilacion laser y mas. Consulta gratuita este mes.",
    images: ["/og-image.jpg"],
  },
}

interface SiteContentTreatmentsPage {
  key: string
  value: TreatmentsPageInfo
}

interface BackendTreatment {
  id: string
  name: string
  description: string | null
  price: number
  tag: string
  imageUrl: string | null
  active: boolean
}

const treatmentsJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  name: "Tratamientos de Medicina Estetica",
  description: "Catalogo completo de tratamientos de medicina estetica ofrecidos por la Dra. Yasmin Medrano Avila.",
  url: `${BASE_URL}/tratamientos`,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      { "@type": "MedicalProcedure", position: 1, name: "Toxina Botulinica (Botox)", description: "Tratamiento para lineas de expresion y arrugas con resultados desde los 3-7 dias." },
      { "@type": "MedicalProcedure", position: 2, name: "Rellenos con Acido Hialuronico", description: "Aumento de volumen y correccion de surcos con resultados inmediatos y naturales." },
      { "@type": "MedicalProcedure", position: 3, name: "Armonizacion Facial", description: "Equilibrio de proporciones faciales para un aspecto natural y armonioso." },
      { "@type": "MedicalProcedure", position: 4, name: "Depilacion Laser", description: "Eliminacion definitiva del vello con tecnologia laser de ultima generacion." },
      { "@type": "MedicalProcedure", position: 5, name: "Mesoterapia Facial", description: "Hidratacion profunda y rejuvenecimiento de la piel con microinyecciones." },
      { "@type": "MedicalProcedure", position: 6, name: "Radiofrecuencia Facial", description: "Estimulacion de colageno para firmeza y rejuvenecimiento de la piel." },
      { "@type": "MedicalProcedure", position: 7, name: "Bioestimulacion con Polinucleotidos", description: "Regeneracion celular avanzada para rejuvenecimiento profundo." },
      { "@type": "MedicalProcedure", position: 8, name: "Peeling Quimico", description: "Renovacion de la piel para tratar manchas, textura y tono desigual." },
      { "@type": "MedicalProcedure", position: 9, name: "Reduccion de Medidas", description: "Tratamientos corporales para modelado y reduccion de medidas." },
      { "@type": "MedicalProcedure", position: 10, name: "Tratamiento de Celulitis", description: "Tecnicas avanzadas para mejorar la textura de la piel y reducir celulitis." },
      { "@type": "MedicalProcedure", position: 11, name: "Tratamiento de Estrias", description: "Procedimientos para atenuar y mejorar la apariencia de estrias." },
      { "@type": "MedicalProcedure", position: 12, name: "Tratamiento de Manchas", description: "Eliminacion de manchas faciales con tecnicas medicas especializadas." },
    ],
  },
}

export default async function TratamientosPage() {
  const [c, footerData, backendResult, infoResult] = await Promise.all([
    readContent(),
    getFooterData(),
    backendFetch<BackendTreatment[]>("/treatments", { revalidate: 300 }),
    backendFetch<SiteContentTreatmentsPage>("/site-content/treatmentsPage", { revalidate: 300 }),
  ])

  // Use site-content info only when the service responds correctly; otherwise undefined = fallback to hardcoded
  const pageInfo: TreatmentsPageInfo | undefined =
    infoResult.error === null && infoResult.data?.value
      ? {
          ...infoResult.data.value,
          doctorImage: infoResult.data.value.doctorImage
            ? resolveImageUrl(infoResult.data.value.doctorImage as string)
            : undefined,
        }
      : undefined

  const backendError = backendResult.error !== null
  const backendTreatments = backendError
    ? []
    : extractList<BackendTreatment>(backendResult.data).map((t) => ({
        ...t,
        imageUrl: resolveImageUrl(t.imageUrl),
      }))

  const handleFilterList = backendTreatments.filter(x => x.active)
  const liveModules =
    handleFilterList.length > 0
      ? handleFilterList.map((t) => ({ title: t.name }))
      : c.courseModules

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(treatmentsJsonLd) }}
      />
      <Navbar links={c.navLinks} />
      <main>
        <PageHero
          eyebrow="Medicina Estética"
          title="Nuestros Tratamientos"
          subtitle="Tratamientos faciales y corporales con tecnología de vanguardia y los más altos estándares de seguridad médica."
        />

        <ServiceSection
          included={c.courseIncluded}
          modules={liveModules}
          info={pageInfo}
        />

        {backendError
          ? <PresetsSection presets={c.presets} />
          : <TreatmentsGrid treatments={backendTreatments} isHome={false}  />
        }
      </main>
      <Footer data={footerData} />
    </>
  )
}
