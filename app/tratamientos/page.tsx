import { readContent } from "@/lib/store/content-store"
import { safeJsonLd } from "@/lib/seo-utils"
import { backendFetch, resolveImageUrl, extractList } from "@/lib/backend-client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ServiceSection, type TreatmentsPageInfo } from "@/components/sections/CourseSection"
import { PresetsSection } from "@/components/sections/PresetsSection"
import { TreatmentsPaginated } from "@/components/sections/TreatmentsPaginated"
import { getFooterData } from "@/lib/data/footer"
import { PageHero } from "@/components/ui/PageHero"
import type { Metadata } from "next"
import { seoTitleFor, searchAliasesFor } from "@/lib/seo/treatment-names"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

// Sin marca: el template del layout añade "| Dra. Yasmin Medrano Avila".
// Con el sufijo el title queda en 64 caracteres; Google corta cerca de 60.
const BASE_TITLE = "Tratamientos Estéticos en Cochabamba"
// Solo se nombran tratamientos que el consultorio presta. La versión anterior
// anunciaba armonización facial y depilación láser, que no están entre los
// activos. Sin superlativos («los mejores»): no son demostrables y en
// publicidad sanitaria son terreno resbaladizo.
const BASE_DESCRIPTION =
  "Botox, ácido hialurónico, rellenos de labios, mesoterapia y peeling en Cochabamba. Medicina estética con la Dra. Yasmin Medrano Avila."

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
      "mesoterapia facial Bolivia",
      "rejuvenecimiento facial Cochabamba",
      "radiofrecuencia facial Bolivia",
      "bioestimulación polinucleótidos Cochabamba",
      "tratamientos antiedad Bolivia",
      "eliminar manchas piel Cochabamba",
      "peeling químico Cochabamba",
    ],
    alternates: { canonical },
    openGraph: {
      // Sin marca: el template del layout añade "| Dra. Yasmin Medrano Avila".
      // Google corta el title a ~60 caracteres; con el sufijo esto queda en 64.
      title: "Tratamientos Estéticos en Cochabamba",
      description:
        "Botox, ácido hialurónico, rellenos de labios, rinomodelación, mesoterapia y peeling químico en Cochabamba, con la Dra. Yasmin Medrano Avila.",
      url: canonical,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Tratamientos de medicina estética en Cochabamba — Dra. Yasmin Medrano Avila" }],
      type: "website",
      locale: "es_BO",
    },
    twitter: {
      card: "summary_large_image",
      images: ["/opengraph-image"],
      title: "Tratamientos Estéticos en Cochabamba | Dra. Yasmin Medrano",
      description:
        "Botox, ácido hialurónico, rellenos de labios, rinomodelación y más. Agenda tu consulta de valoración con la Dra. Yasmin Medrano Avila.",
    },
  }
}

interface SiteContentTreatmentsPage {
  key: string
  value: TreatmentsPageInfo
}

interface BackendTreatment {
  id: string
  slug: string
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

/**
 * Catálogo de tratamientos para buscadores, derivado del panel.
 *
 * Aquí vivía una lista de DOCE procedimientos escrita a mano, de los que cinco
 * no se ofrecen: armonización facial, depilación láser, reducción de medidas,
 * celulitis y estrías. Es el mismo fallo que el título de la home — una
 * constante que nadie sincroniza acaba anunciando lo que el consultorio no
 * hace, y en medicina estética eso no es solo mal SEO.
 *
 * Ahora sale de `/treatments?active=true`: lo que la doctora activa se anuncia,
 * lo que desactiva desaparece. Sin listas paralelas que mantener.
 */
function buildTreatmentsJsonLd(treatments: BackendTreatment[]) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Tratamientos de Medicina Estética",
    description:
      "Catálogo de tratamientos de medicina estética de la Dra. Yasmin Medrano Avila en Cochabamba.",
    url: `${BASE_URL}/tratamientos`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: treatments.length,
      itemListElement: treatments.map((t, i) => ({
        "@type": "MedicalProcedure",
        position: i + 1,
        name: seoTitleFor(t.slug, t.name),
        alternateName: searchAliasesFor(t.slug, t.name),
        url: `${BASE_URL}/tratamientos/${t.slug}`,
        ...(t.description
          ? {
              description: t.description
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 200),
            }
          : {}),
      })),
    },
  }
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
      // Nombre legible, no el gritado del panel (ver lib/seo/treatment-names.ts).
      ? allActive.map((t) => ({
          title: seoTitleFor(t.slug, t.name),
          treatmentId: t.id,
          treatmentSlug: t.slug,
        }))
      : c.courseModules

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(buildTreatmentsJsonLd(allActive)) }}
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
            <TreatmentsPaginated
              initialTreatments={backendTreatments}
              initialPage={currentPage}
              totalPages={totalPages}
            />
          )
        }
      </main>
      <Footer data={footerData} />
    </>
  )
}
