import { BASE_URL } from "@/lib/seo/site-url"
import { safeJsonLd } from "@/lib/seo-utils"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ServiceSection } from "@/components/sections/CourseSection"
import { PresetsSection } from "@/components/sections/PresetsSection"
import { TreatmentsPaginated } from "@/components/sections/TreatmentsPaginated"
import { getFooter } from "@/lib/content/footer"
import { notFound } from "next/navigation"
import { getTreatmentsPageInfo } from "@/lib/content/treatments-page"
import {
  getActiveTreatments,
  getTreatmentsGridPage,
  FALLBACK_TREATMENT_CATEGORIES,
  type Treatment,
} from "@/lib/content/treatments"
import { getNavLinks } from "@/lib/content/site-main"
import { getSiteSeo } from "@/lib/content/seo"
import { pageSeoMetadata } from "@/lib/seo/meta"
import { PageHero } from "@/components/ui/PageHero"
import type { Metadata } from "next"
import { searchAliasesFor, displayNameFor, alternateNamesFor } from "@/lib/seo/treatment-names"

/** Normaliza el query param de página a un entero ≥ 1. */
function parsePage(raw: string | undefined): number {
  return Math.max(1, Number.parseInt(raw ?? "1", 10) || 1)
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const [{ page }, seo, { data: activos }] = await Promise.all([searchParams, getSiteSeo(), getActiveTreatments()])
  const pageNum = parsePage(page)
  // Canonical autorreferenciado por página → evita contenido duplicado entre ?page=N
  const canonical = pageNum > 1 ? `${BASE_URL}/tratamientos?page=${pageNum}` : `${BASE_URL}/tratamientos`

  // Título y descripción: Dashboard → SEO / Google (o su respaldo entero).
  // Las keywords salen de los tratamientos activos, no de una lista fija.
  return pageSeoMetadata(seo.tratamientos, {
    pageSuffix: pageNum > 1 ? ` — Página ${pageNum}` : "",
    keywords: [
      "tratamientos medicina estética Cochabamba",
      ...activos.flatMap((t) => searchAliasesFor(t).map((a) => `${a} Cochabamba`)),
    ],
    canonical,
    ogImageAlt: "Tratamientos de medicina estética en Cochabamba — Dra. Yasmin Medrano Avila",
  })
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
function buildTreatmentsJsonLd(treatments: Treatment[]) {
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
        // Nombre real del panel; el término de búsqueda va como alternativo.
        name: displayNameFor(t),
        ...(alternateNamesFor(t).length ? { alternateName: alternateNamesFor(t) } : {}),
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

  const [navLinks, footerData, grid, all, info] = await Promise.all([
    getNavLinks(),
    getFooter(),
    // Página actual del grid (el backend define el tamaño de página)
    getTreatmentsGridPage(requestedPage),
    // Lista completa de activos — alimenta "Tratamientos Disponibles" del ServiceSection
    getActiveTreatments(),
    getTreatmentsPageInfo(),
  ])

  const backendError = grid.source === "fallback"
  const allActive = all.data.filter((t) => t.active)

  // Paginación gobernada por el backend (él define el tamaño de página).
  // Si el backend aún no pagina (responde array suelto), se muestra todo en una sola página.
  const meta = grid.data.meta
  const totalPages = meta
    ? Math.max(1, meta.totalPages > 0 ? meta.totalPages : meta.total > 0 && meta.limit > 0 ? Math.ceil(meta.total / meta.limit) : 1)
    : 1
  // Página fuera de rango → 404: `/tratamientos?page=99` respondía 200 con las
  // once fichas y un canonical apuntándose a sí mismo (copias indexables).
  if (meta && requestedPage > totalPages) notFound()

  // Y cuando el backend NO pagina —responde la lista suelta, sin metadatos—
  // solo existe la página 1. Cualquier otra es la misma lista con otra URL.
  if (!meta && requestedPage > 1) notFound()

  const currentPage = Math.min(requestedPage, totalPages)
  const backendTreatments = meta ? grid.data.items.filter((t) => t.active) : allActive

  // Nombre del panel, solo sin el grito (ver lib/seo/treatment-names.ts).
  const liveModules = allActive.map((t) => ({
    title: displayNameFor(t),
    treatmentId: t.id,
    treatmentSlug: t.slug,
  }))

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
      <Navbar links={navLinks} />
      <main>
        <PageHero
          eyebrow="Medicina Estética"
          title="Nuestros Tratamientos"
          subtitle="Tratamientos de medicina estética con tecnología de vanguardia y los más altos estándares de seguridad médica."
        />

        <ServiceSection modules={liveModules} info={info.data} />

        {backendError
          ? <PresetsSection presets={FALLBACK_TREATMENT_CATEGORIES} />
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
