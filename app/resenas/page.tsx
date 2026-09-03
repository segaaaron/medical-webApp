import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { backendFetch, extractList, extractReviewAggregate } from "@/lib/backend-client"
import { safeJsonLd } from "@/lib/seo-utils"
import { getFooterData } from "@/lib/data/footer"
import { readContent, DEFAULTS } from "@/lib/store/content-store"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PageHero } from "@/components/ui/PageHero"
import { Pager } from "@/components/ui/Pager"
import {
  TestimonialsSection,
  type PublicReview,
  type ReviewAggregate,
} from "@/components/sections/TestimonialsSection"

/**
 * Listado completo de reseñas, paginado.
 *
 * Antes las reseñas solo existían como un bloque de seis en la home: la
 * séptima aprobada no aparecía en ninguna parte del sitio. Con el consultorio
 * pidiendo reseñas por invitación, ese techo se alcanza pronto.
 *
 * La paginación sigue el mismo contrato que `/tratamientos` —`?page=N`, con el
 * backend fijando el tamaño de página— para no inventar una convención nueva.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

export const revalidate = 300

function parsePage(raw: string | undefined): number {
  return Math.max(1, Number.parseInt(raw ?? "1", 10) || 1)
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}): Promise<Metadata> {
  const { page } = await searchParams
  const pageNum = parsePage(page)

  // Canonical autorreferenciado por página: sin él, `?page=2` y `?page=3`
  // compiten entre sí como contenido duplicado.
  const canonical =
    pageNum > 1 ? `${BASE_URL}/resenas?page=${pageNum}` : `${BASE_URL}/resenas`

  const base = "Reseñas de Pacientes"

  return {
    title: pageNum > 1 ? `${base} — Página ${pageNum}` : base,
    description:
      "Opiniones verificadas de pacientes de la Dra. Yasmin Medrano Avila, medicina estética en Cochabamba. Cada reseña se publica tras aprobación.",
    alternates: { canonical },
    openGraph: {
      title: `${base} | Dra. Yasmin Medrano Avila`,
      description:
        "Opiniones verificadas de pacientes de medicina estética en Cochabamba.",
      url: canonical,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Reseñas de pacientes — Dra. Yasmin Medrano Avila, Cochabamba",
        },
      ],
      type: "website",
      locale: "es_BO",
    },
  }
}

/** Metadata de paginación, cuando el backend la envía. */
function readPaginationMeta(data: unknown): { page: number; totalPages: number } | null {
  if (!data || typeof data !== "object") return null
  const d = data as Record<string, unknown>
  if (typeof d.page !== "number" || typeof d.totalPages !== "number") return null
  return { page: d.page, totalPages: d.totalPages }
}

export default async function ResenasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const requestedPage = parsePage(page)

  const [c, footerData, reviewsResult] = await Promise.all([
    readContent(),
    getFooterData(),
    backendFetch<PublicReview[]>(`/reviews/public?page=${requestedPage}`, {
      revalidate: 300,
    }),
  ])

  const reviews =
    reviewsResult.error === null ? extractList<PublicReview>(reviewsResult.data) : []
  const backendAggregate =
    reviewsResult.error === null ? extractReviewAggregate(reviewsResult.data) : null

  const aggregate: ReviewAggregate | undefined =
    backendAggregate && backendAggregate.total_count > 0
      ? {
          avg_rating:
            backendAggregate.avg_rating ??
            reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1),
          total_count: backendAggregate.total_count,
        }
      : undefined

  const meta = readPaginationMeta(reviewsResult.data)
  const totalPages = meta?.totalPages ?? 1

  // Página fuera de rango → 404.
  //
  // Sin esto, `/resenas?page=99` respondía HTTP 200 con cero reseñas: para
  // Google, una página real y vacía. Con paginación, ese hueco es infinito —
  // hay tantas URLs vacías como números se quieran probar— y todas entrarían
  // al índice como contenido pobre.
  //
  // Solo se aplica cuando el backend confirmó cuántas páginas hay (`meta`): si
  // no respondió, se muestra lo que haya en vez de dar por perdida la página.
  if (meta && requestedPage > totalPages) notFound()

  // Segunda red, por si el backend no informa de la paginación (aún no
  // desplegada, o versión antigua): una página distinta de la primera que no
  // trae ni una reseña no existe, y devolverla con 200 la convierte en
  // contenido pobre indexable.
  if (requestedPage > 1 && reviews.length === 0) notFound()

  const currentPage = Math.min(requestedPage, totalPages)

  const navLinks = c?.navLinks ?? DEFAULTS.navLinks

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Reseñas", item: `${BASE_URL}/resenas` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <Navbar links={navLinks} />

      <main>
        <PageHero
          eyebrow="Lo que dicen nuestras pacientes"
          title="Reseñas Verificadas"
          subtitle="Cada opinión la escribe una paciente por invitación y se publica tras revisión. No hay testimonios de archivo."
        />

        {reviews.length > 0 ? (
          <TestimonialsSection
            reviews={reviews}
            aggregate={aggregate}
            limit={reviews.length}
            showAllLink={false}
          />
        ) : (
          <section className="px-6 py-24 text-center">
            <p style={{ color: "var(--prem-muted)" }}>
              Todavía no hay reseñas publicadas.
            </p>
          </section>
        )}

        {/* Mismo paginador que el catálogo de tratamientos.
            Aquí navega por enlaces reales en vez de en cliente: cada página de
            reseñas es una URL propia que Google puede rastrear e indexar. */}
        <div
          className="px-6 pb-20"
          style={{ backgroundColor: "var(--prem-dark)" }}
        >
          <Pager
            page={currentPage}
            totalPages={totalPages}
            basePath="/resenas"
            label="reseñas"
            className="flex items-center justify-center gap-2 flex-wrap"
          />
        </div>

      </main>

      <Footer data={footerData} />
    </>
  )
}
