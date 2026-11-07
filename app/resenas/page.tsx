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

  /**
   * Reseñas como datos estructurados.
   *
   * ──────────────────────────────────────────────────────────────────────────
   * LO QUE ESTO NO HACE: ESTRELLAS EN GOOGLE
   *
   * Hay que decirlo claro porque es la confusión más común con este marcado.
   * Desde 2019 Google NO muestra fragmentos de reseña para `LocalBusiness` ni
   * `Organization` cuando la propia entidad controla las reseñas: una reseña
   * sobre la doctora, publicada en el sitio de la doctora, es «autoservida».
   * No importa si el marcado es correcto. No habrá estrellas.
   *
   * Por eso aquí NO se declara `aggregateRating` sobre el consultorio ni sobre
   * la doctora. No por miedo a una penalización —Google dice expresamente que
   * esto no acarrea acción manual— sino porque sería declarar una media para
   * ganar un adorno que no va a aparecer, y en una página de salud el marcado
   * que no sirve para nada es marcado que alguien tendrá que mantener.
   *
   * Las estrellas de verdad salen de la ficha de Google Business Profile. Ese
   * es el sitio donde pelear esto, y el flujo de `/resena` ya empuja a las
   * pacientes justo ahí.
   *
   * ──────────────────────────────────────────────────────────────────────────
   * PARA QUÉ SÍ SIRVE
   *
   * Para los motores de respuestas. Cuando alguien pregunta a una IA «¿qué tal
   * es la Dra. Yasmin Medrano?», lo que puede citar es el texto de las reseñas.
   * Declararlas como `Review` con autora, fecha y tratamiento le dice qué es
   * cada bloque de texto en vez de dejarlo como párrafos sueltos.
   *
   * Todo sale de reseñas reales aprobadas en el panel. Nada se genera: si no
   * hay reseñas, no hay marcado.
   */
  const reviewsLd =
    reviews.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Reseñas de pacientes",
          itemListElement: reviews.map((r, i) => {
            const autor = [r.patient_name, r.patient_lastname]
              .map((x) => (x ?? "").trim())
              .filter(Boolean)
              .join(" ")
            const fecha = r.approved_at ? new Date(r.approved_at) : null
            const fechaValida = fecha && !Number.isNaN(fecha.getTime()) ? fecha : null
            return {
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Review",
                // `itemReviewed` apunta al consultorio por `@id`: la reseña es
                // SOBRE él, y sin esto sería una reseña huérfana de objeto.
                itemReviewed: { "@id": `${BASE_URL}/#business` },
                reviewBody: r.body,
                inLanguage: "es-BO",
                ...(autor ? { author: { "@type": "Person", name: autor } } : {}),
                ...(fechaValida
                  ? { datePublished: fechaValida.toISOString().slice(0, 10) }
                  : {}),
                ...(r.treatment ? { about: r.treatment } : {}),
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: r.rating,
                  bestRating: 5,
                  worstRating: 1,
                },
              },
            }
          }),
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      {reviewsLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(reviewsLd) }}
        />
      )}
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
