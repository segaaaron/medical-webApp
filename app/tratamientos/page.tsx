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
import { Pagination } from "@/components/ui/Pagination"
import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

const BASE_TITLE = "Tratamientos Estéticos Cochabamba — Botox, Rellenos & Más | Dra. Yasmin Medrano"
const BASE_DESCRIPTION =
  "Botox, rellenos, armonización facial, depilación láser y mesoterapia en Cochabamba. Especialista certificada en Bolivia. +5.000 pacientes. ¡Consulta GRATIS!"

/** Normaliza el query param de página a un entero ≥ 1. */
function parsePage(raw: string | undefined): number {
  return Math.max(1, Number.parseInt(raw ?? "1", 10) || 1)
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const { page } = await searchParams
  const pageNum = parsePage(page)
  // Canonical autorreferenciado por página → evita contenido duplicado entre ?page=N
  const canonical = pageNum > 1 ? `${BASE_URL}/tratamientos?page=${pageNum}` : `${BASE_URL}/tratamientos`
  const title = pageNum > 1 ? `${BASE_TITLE} — Página ${pageNum}` : BASE_TITLE

  return {
    title,
    description: BASE_DESCRIPTION,
    keywords: [
      "tratamientos medicina estética Cochabamba",
      "botox Cochabamba precio",
      "botox natural Bolivia",
      "ácido hialurónico Cochabamba",
      "armonización facial Bolivia precio",
      "depilación láser definitiva Cochabamba",
      "mesoterapia facial Bolivia",
      "rejuvenecimiento facial Cochabamba",
      "radiofrecuencia facial Bolivia",
      "bioestimulación polinucleótidos Cochabamba",
      "tratamientos antiedad Bolivia",
      "eliminar manchas piel Cochabamba",
      "reducción medidas Bolivia",
      "peeling químico Cochabamba",
      "tratamiento estrías Bolivia",
      "mejores tratamientos estéticos Bolivia",
    ],
    alternates: { canonical },
    openGraph: {
      title: "Tratamientos Estéticos en Cochabamba — Botox, Rellenos & Rejuvenecimiento",
      description:
        "✨ Los mejores tratamientos estéticos en Bolivia. Botox natural, rellenos ácido hialurónico, armonización facial, depilación láser y más. +5.000 pacientes satisfechos. ¡Consulta GRATIS ahora!",
      url: canonical,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Mejores tratamientos estéticos Cochabamba Bolivia — Dra. Yasmin Medrano Avila" }],
      type: "website",
      locale: "es_BO",
    },
    twitter: {
      card: "summary_large_image",
      title: "Botox, Rellenos & Rejuvenecimiento en Cochabamba ✨ | Dra. Yasmin Medrano",
      description:
        "Tratamientos estéticos de calidad internacional en Bolivia. Botox natural, armonización facial, depilación láser. +5.000 pacientes felices. ¡Agenda GRATIS!",
      images: ["/og-image.jpg"],
    },
  }
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

/** Metadata de paginación que envía el backend (incluido el tamaño de página). */
interface PaginatedMeta {
  total?: number
  totalPages?: number
  page?: number
  limit?: number
}

/** Lee la metadata de paginación si la respuesta es un objeto {data, total, ...}. */
function readPaginationMeta(raw: unknown): PaginatedMeta | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as PaginatedMeta
    if (typeof o.total === "number" || typeof o.totalPages === "number") return o
  }
  return null
}

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${BASE_URL}` },
    { "@type": "ListItem", position: 2, name: "Tratamientos", item: `${BASE_URL}/tratamientos` },
  ],
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

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function TratamientosPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const requestedPage = parsePage(pageParam)

  const [c, footerData, gridResult, allResult, infoResult] = await Promise.all([
    readContent(),
    getFooterData(),
    // Página actual del grid (el backend define el tamaño de página)
    backendFetch<BackendTreatment[]>(`/treatments?active=true&page=${requestedPage}`, { revalidate: 300 }),
    // Lista completa de activos — alimenta "Tratamientos Disponibles" del ServiceSection
    backendFetch<BackendTreatment[]>("/treatments?active=true", { revalidate: 300 }),
    backendFetch<SiteContentTreatmentsPage>("/site-content/treatmentsPage", { revalidate: 300 }),
  ])
  const backendResult = gridResult

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

  // Lista completa de activos (para el sidebar "Tratamientos Disponibles" y como fallback de paginación)
  const allActive = backendError
    ? []
    : extractList<BackendTreatment>(allResult.data).filter((t) => t.active)

  // Paginación gobernada por el backend (él define el tamaño de página).
  // Si el backend aún no pagina (responde array suelto), se muestra todo en una sola página.
  const meta = readPaginationMeta(gridResult.data)
  const totalPages = meta
    ? Math.max(
        1,
        meta.totalPages ??
          (meta.total && meta.limit ? Math.ceil(meta.total / meta.limit) : 1)
      )
    : 1
  const currentPage = Math.min(requestedPage, totalPages)

  const pageItemsRaw = meta
    ? extractList<BackendTreatment>(gridResult.data).filter((t) => t.active)
    : allActive

  const backendTreatments = pageItemsRaw.map((t) => ({
    ...t,
    imageUrl: resolveImageUrl(t.imageUrl),
  }))

  const liveModules =
    allActive.length > 0
      ? allActive.map((t) => ({ title: t.name }))
      : c.courseModules

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
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
          : (
            <>
              <TreatmentsGrid treatments={backendTreatments} isHome={false} />
              <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/tratamientos" />
            </>
          )
        }
      </main>
      <Footer data={footerData} />
    </>
  )
}
