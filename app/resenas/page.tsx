import type { Metadata } from "next"
import { BASE_URL } from "@/lib/seo/site-url"
import { notFound } from "next/navigation"
import { safeJsonLd } from "@/lib/seo-utils"
import { getFooter } from "@/lib/content/footer"
import { getNavLinks } from "@/lib/content/site-main"
import { getReviewsPage } from "@/lib/content/reviews"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PageHero } from "@/components/ui/PageHero"
import { Pager } from "@/components/ui/Pager"
import { TestimonialsSection } from "@/components/sections/TestimonialsSection"

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

export default async function ResenasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const requestedPage = parsePage(page)

  const [navLinks, footerData, result] = await Promise.all([
    getNavLinks(),
    getFooter(),
    getReviewsPage(requestedPage),
  ])
  const { reviews, aggregate, meta } = result.data
  const totalPages = meta ? meta.totalPages : 1

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
            aggregate={aggregate ?? undefined}
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
