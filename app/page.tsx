import { getHomeData, getHomeDataService } from "@/lib/data/home"
import { BASE_URL } from "@/lib/seo/site-url"
import { getFooterData } from "@/lib/data/footer"
import { sanitizeHtml } from "@/lib/html/sanitize"
import { mapTreatmentsPageInfo } from "@/lib/data/treatments-page"
import { ADDRESS, AREA_SERVED, LANGUAGES, OPENING_HOURS, PHONE, geoFields } from "@/lib/seo/local"
import { normalizeSocialUrl } from "@/lib/seo/meta"
import { getPromoData } from "@/lib/data/promo"
import { getAboutData } from "@/lib/data/about"
import { backendFetch, resolveImageUrl, extractList, extractReviewAggregate } from "@/lib/backend-client"
import { safeJsonLd } from "@/lib/seo-utils"
import type { PromoDisplayData } from "@/lib/data/promo"
import dynamic from "next/dynamic"
import type { Metadata } from "next"

// ─── Layout ───────────────────────────────────────────────────────────────────
import { PromoBanner } from "@/components/layout/PromoBanner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

// ─── Above-fold sections (eager) ──────────────────────────────────────────────
import { HeroSectionFallback } from "@/components/sections/HeroSection"
import { FadeIn } from "@/components/ui/FadeIn"
import { AboutSection } from "@/components/sections/AboutSection"
import { HomeSection } from "@/components/sections/HomeSection"
import { TreatmentsPageInfo } from "@/components/sections/CourseSection"
import type { PublicReview, ReviewAggregate } from "@/components/sections/TestimonialsSection"
import { seoTitleFor, searchAliasesFor } from "@/lib/seo/treatment-names"
import { getConsultorioLocation, type ConsultorioLocation } from "@/lib/data/location"
import { CourseModule, HeroCTA } from "@/types"

// ─── Below-fold sections (lazy — split JS chunk, still SSR'd) ─────────────────
const ServiceSection = dynamic(() => import("@/components/sections/CourseSection").then(m => ({ default: m.ServiceSection })))
const ValuePropositionSection = dynamic(() => import("@/components/sections/ValuePropositionSection").then(m => ({ default: m.ValuePropositionSection })))
const TreatmentsGrid = dynamic(() => import("@/components/sections/TreatmentsGrid").then(m => ({ default: m.TreatmentsGrid })))
const FAQSection = dynamic(() => import("@/components/sections/FAQSection").then(m => ({ default: m.FAQSection })))
const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })))


/**
 * Valoración media para adjuntar al negocio.
 *
 * Sin el array `review[]`: Google declara INELEGIBLES para el fragmento de
 * estrellas las reseñas que la propia entidad aloja sobre sí misma en
 * `LocalBusiness` u `Organization` («self-serving reviews»), y en julio de 2026
 * endureció además la redacción sobre reseñas incentivadas. Ese bloque no podía
 * ganar estrellas y sí podía leerse como auto-servicio. Las estrellas reales de
 * un negocio local salen de la ficha de Google, no del schema de su web.
 *
 * El `aggregateRating` se mantiene: describe a la entidad, se calcula de las
 * reseñas aprobadas y solo se emite si existen. Las reseñas siguen visibles en
 * la página como contenido, que es donde le sirven al paciente.
 */
function buildRatingFields(reviews: PublicReview[], aggregate?: ReviewAggregate) {
  const hasReviews = reviews.length > 0
  const avg = aggregate?.avg_rating != null
    ? aggregate.avg_rating.toFixed(1)
    : hasReviews
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null
  const reviewCount = aggregate?.total_count ?? reviews.length
  if (!hasReviews || !avg) return {}
  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg,
      reviewCount: String(reviewCount),
      bestRating: "5",
      worstRating: "1",
    },
  }
}

function buildFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.replace(/<[^>]*>/g, ""),
      },
    })),
  }
}


/** MedicalBusiness (subtipo de Organization) con datos del negocio + estrellas. */
/**
 * Promoción vigente como dato estructurado.
 *
 * El banner se pintaba solo como HTML decorado: para un buscador —y para un
 * motor de respuestas tipo ChatGPT o Perplexity— era texto suelto, no una
 * oferta. Marcarlo como `Offer` colgando del negocio (@id #business) permite
 * que la promoción se entienda como tal y pueda citarse cuando alguien
 * pregunte por ofertas de medicina estética en Cochabamba.
 *
 * Solo se emite si está activa en el panel: una oferta caducada en el schema
 * es peor que no tener ninguna.
 */
// El nodo `WebSite` no se declara aquí: ya va en el `@graph` del layout, que
// lo sirve en todas las páginas. Estaban los dos con el MISMO `@id` (#website)
// y nombres distintos —«Dra. Yasmin Medrano» frente a «Dra. Yasmin Medrano
// Avila»—, así que Google recibía dos versiones contradictorias de la misma
// entidad y tenía que elegir una.

function buildPromoJsonLd(promo: PromoDisplayData) {
  if (!promo.active || !promo.title) return null

  const nombre = [promo.title, promo.highlightedText].filter(Boolean).join(" ").trim()

  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: nombre,
    ...(promo.description ? { description: promo.description } : {}),
    url: promo.ctaHref?.startsWith("http") ? promo.ctaHref : BASE_URL,
    availability: "https://schema.org/InStock",
    areaServed: { "@type": "City", name: "Cochabamba" },
    offeredBy: { "@id": `${BASE_URL}/#business` },
    seller: { "@id": `${BASE_URL}/#business` },
  }
}

function buildLocalBusinessJsonLd(
  reviews: PublicReview[],
  aggregate: ReviewAggregate | undefined,
  treatments: BackendTreatment[],
  ubicacion: ConsultorioLocation | null,
  perfiles: string[]
) {
  return {
    "@context": "https://schema.org",
    // `MedicalClinic` es subtipo de `MedicalBusiness` Y de `LocalBusiness` a la
    // vez: hereda las funciones locales (Maps, 3-pack) y añade las médicas.
    // Es el tipo que corresponde a una consulta privada; `MedicalBusiness` a
    // secas dejaba fuera media descripción de lo que es el negocio.
    "@type": "MedicalClinic",
    "@id": `${BASE_URL}/#business`,
    // Sin `name` ni `description`: los pone el `@graph` del layout, que va en
    // TODAS las páginas. Aquí había un nombre distinto sobre el MISMO `@id`
    // («Dra. Yasmin Medrano Avila — Medicina Estética» frente a «Consultorio
    // Dra. Yasmin Medrano Avila»), o sea dos versiones de la misma entidad
    // contradiciéndose en la misma página — el error que ya se corrigió una vez
    // con el nodo `WebSite`. Este bloque solo AÑADE lo que el layout no puede
    // saber: el catálogo de servicios y la valoración media.
    url: BASE_URL,
    logo: `${BASE_URL}/icon.svg`,
    telephone: PHONE,
    image: `${BASE_URL}/images/DraMedrano.jpeg`,
    priceRange: "$$",
    address: ADDRESS,
    // Área metropolitana de Cochabamba: quien busca «cerca de mí» escribe
    // desde Quillacollo o Sacaba tanto como desde Cercado.
    areaServed: AREA_SERVED,
    availableLanguage: LANGUAGES,
    currenciesAccepted: "BOB",
    paymentAccepted: "Efectivo, Tarjeta de crédito, Tarjeta de débito, QR",
    // Coordenadas del panel (Dashboard → Contacto). Estaban escritas a mano y
    // se quedaron desfasadas cuando la doctora corrigió el punto. Sin dato se
    // omite el `geo`: mejor ninguno que uno equivocado.
    ...geoFields(ubicacion),
    // Catálogo de servicios.
    //
    // El negocio declaraba su especialidad pero no QUÉ hace: nada conectaba la
    // entidad «consultorio» con los once procedimientos ni con sus páginas. Es
    // la lista que un buscador —y un motor de respuestas tipo ChatGPT o
    // Perplexity, que citan enumerando servicios— necesita para saber que aquí
    // se pone botox. Se deriva de los tratamientos activos, así que activar uno
    // nuevo en el panel lo añade solo.
    ...(treatments.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Tratamientos de medicina estética en Cochabamba",
            itemListElement: treatments.map((t) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "MedicalProcedure",
                name: seoTitleFor(t.slug, t.name),
                alternateName: searchAliasesFor(t.slug, t.name),
                url: `${BASE_URL}/tratamientos/${t.slug}`,
              },
            })),
          },
        }
      : {}),
    openingHoursSpecification: OPENING_HOURS,
    sameAs: perfiles,
    medicalSpecialty: "Medicina Estética",
    ...buildRatingFields(reviews, aggregate),
  }
}


function buildSiteNavJsonLd(navLinks: { label?: string; name?: string; href?: string; url?: string }[]) {
  const items = navLinks
    .map((l) => ({ name: l.label ?? l.name ?? "", href: l.href ?? l.url ?? "" }))
    .filter((l) => l.name && l.href)
  return {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: items.map((l) => l.name),
    url: items.map((l) => (l.href.startsWith("http") ? l.href : `${BASE_URL}${l.href.startsWith("/") ? "" : "/"}${l.href}`)),
  }
}

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
  ],
}

interface SiteContentTreatmentsPage {
  key: string
  value: TreatmentsPageInfo
}

interface BackendTreatment {
  slug: string
  id: string
  name: string
  description: string | null
  price: number
  tag: string
  imageUrl: string | null
  active: boolean
}

/**
 * Metadatos de la home, derivados de los tratamientos REALES del panel.
 *
 * Antes el título vivía escrito a mano en el layout. Eso tiene un fallo que no
 * es de posicionamiento sino de honestidad: la lista se desincroniza del
 * consultorio. Llegó a anunciar «Armonización Facial» sin que existiera ese
 * tratamiento, y las keywords declaraban depilación láser y mesoterapia
 * corporal, que tampoco se ofrecen.
 *
 * El panel es la fuente de verdad. Si la doctora activa un tratamiento, aparece
 * aquí; si lo desactiva, desaparece. No se puede prometer lo que no se hace.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { data, error } = await backendFetch<BackendTreatment[]>(
    "/treatments?active=true",
    { revalidate: 300 }
  )

  const activos = error === null ? extractList<BackendTreatment>(data) : []
  const nombres = activos.filter((t) => t.slug).map((t) => seoTitleFor(t.slug, t.name))

  // Sin datos del backend se cae al título genérico del layout en vez de
  // inventar una lista: mejor decir menos que decir algo falso.
  if (nombres.length === 0) return {}

  // Se añaden tratamientos mientras quepan.
  //
  // Coger tres fijos daba títulos de 94 caracteres («Ácido Hialurónico, Botox,
  // Rinomodelación sin Cirugía en Cochabamba | Dra. Yasmin Medrano Avila») y
  // Google corta en unos 60: el tercer tratamiento y media marca no llegaban a
  // verse. El límite es de espacio, no de cantidad, así que se mide.
  const COLA = " en Cochabamba"
  // El presupuesto se mide SIN la marca, aunque el template del layout la
  // añada después. Google corta por el final, y el final es la marca: es lo
  // prescindible. Lo que tiene que caber en los ~60 caracteres visibles son
  // los tratamientos y la ciudad, que es por lo que la gente busca. Reservar
  // sitio para la marca dejaba entrar un solo tratamiento.
  const PRESUPUESTO = 60 - COLA.length

  const elegidos: string[] = []
  for (const nombre of nombres) {
    const tentativa = [...elegidos, nombre].join(", ")
    if (elegidos.length > 0 && tentativa.length > PRESUPUESTO) break
    elegidos.push(nombre)
  }

  const lista = elegidos.join(", ")

  return {
    title: `${lista} en Cochabamba`,
    alternates: { canonical: BASE_URL },
    description:
      `${lista} y más tratamientos de medicina estética en Cochabamba, ` +
      "con la Dra. Yasmin Medrano Avila. Consulta de valoración personalizada.",
    // `keywords` se deriva de lo que el consultorio ofrece de verdad. Google
    // ignora esta etiqueta desde 2009, así que no posiciona: se mantiene
    // sincronizada por coherencia, no porque trabaje.
    keywords: [
      ...activos.flatMap((t) => (t.slug ? searchAliasesFor(t.slug, t.name) : [])),
      "medicina estética Cochabamba",
      "Dra. Yasmin Medrano Avila",
    ],
  }
}

export const revalidate = 300 // 5 min ISR

export default async function HomePage() {
  const [homeData, homeServiceData, footerData, promoData, aboutData, treatment, infoResult, reviewsResult, ubicacion] = await Promise.all([
    getHomeData(),
    getHomeDataService(),
    getFooterData(),
    getPromoData(),
    getAboutData(),
    backendFetch<BackendTreatment[]>("/treatments?active=true", { revalidate: 300 }),
    backendFetch<SiteContentTreatmentsPage>("/site-content/treatmentsPage", { revalidate: 60 }),
    backendFetch<PublicReview[]>("/reviews/public", { revalidate: 300 }),
    getConsultorioLocation(),
  ])

  // Las respuestas del panel se sanean aquí, en el servidor, antes de cruzar al
  // componente de cliente que las inyecta como HTML. Antes se limpiaban en el
  // navegador: el texto sin sanear viajaba igual y DOMPurify se descargaba en
  // todas las páginas para limpiarlo allí.
  const faqsLimpias = homeData.faqs.map((faq) => ({
    question: faq.question,
    answer: sanitizeHtml(faq.answer),
  }))

  const faqJsonLd = buildFaqJsonLd(homeData.faqs)

  const approvedReviews = reviewsResult.error === null
    ? extractList<PublicReview>(reviewsResult.data)
    : []
  const backendAggregate = reviewsResult.error === null
    ? extractReviewAggregate(reviewsResult.data)
    : null
  const reviewAggregate: ReviewAggregate | undefined =
    backendAggregate && backendAggregate.total_count > 0
      ? {
          avg_rating:
            backendAggregate.avg_rating ??
            approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length,
          total_count: backendAggregate.total_count,
        }
      : approvedReviews.length > 0
        ? {
            avg_rating: approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length,
            total_count: approvedReviews.length,
          }
        : undefined
  const siteNavJsonLd = buildSiteNavJsonLd(homeData.navLinks)
  const promoJsonLd = buildPromoJsonLd(promoData)

  const backendError = treatment.error !== null
  const backendTreatments = backendError
    ? []
    : extractList<BackendTreatment>(treatment.data).map((t) => ({
        ...t,
        imageUrl: resolveImageUrl(t.imageUrl),
      }))

  // Redes del panel: la lista fija de esta página no tenía TikTok y
  // contradecía la del layout sobre la MISMA entidad (@id #business).
  const perfilesSociales = [
    footerData.facebookUrl,
    footerData.instagramUrl,
    footerData.tiktokUrl,
  ]
    .map(normalizeSocialUrl)
    .filter(Boolean)

  const localBusinessJsonLd = buildLocalBusinessJsonLd(
    approvedReviews,
    reviewAggregate,
    backendTreatments,
    ubicacion,
    perfilesSociales
  )

  const pageInfo =

    infoResult.error === null ? mapTreatmentsPageInfo(infoResult.data?.value) : undefined

  const liveModules: CourseModule[] =
    backendTreatments.length > 0
      // `seoTitleFor` y no `t.name`: el panel guarda los nombres en MAYÚSCULAS
      // SOSTENIDAS y la home los pintaba gritando («ÁCIDO HIALURÓNICO»).
      ? backendTreatments.map((t) => ({
          title: seoTitleFor(t.slug, t.name),
          treatmentId: t.id,
          treatmentSlug: t.slug,
        }))
      : homeData.courseModules

  const heroCTAsSection: HeroCTA[] = [
    {label: homeServiceData.btn1Text, href: '/tratamientos', variant: 'primary'},
    {label: homeServiceData.btn2Text, href: footerData.whatsappUrl, variant: 'primary'}
  ]

  return (
    <>
      {/* Precarga del póster del hero → pinta de inmediato, sin "imagen cargando".
          Van los dos con `media`, cada uno para su forma de pantalla. Precargar
          solo el apaisado hacía que en móvil se bajaran 38 KB que no se pintan
          nunca, y encima con prioridad alta: competían con el póster que sí se
          muestra, que es el elemento más grande de la primera pantalla.
          El criterio es el mismo que en globals.css y en HeroLayout. */}
      <link
        rel="preload"
        as="image"
        href="/images/hero-poster.jpg"
        media="(min-aspect-ratio: 1/1)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/hero-poster-mobile.jpg"
        media="(max-aspect-ratio: 1/1)"
        fetchPriority="high"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(siteNavJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusinessJsonLd) }} />
      {promoJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(promoJsonLd) }} />
      )}
      <PromoBanner data={promoData} />
      <Navbar links={homeData.navLinks} />
      <FadeIn>
      <main>
        { homeServiceData.id === null ?
        <HeroSectionFallback
          stats={homeData.heroStats}
          ctas={homeData.heroCTAs}
          tagline={homeData.branding.heroTagline}
          doctorName={homeData.branding.doctorName}
          specialty={homeData.branding.specialty}
          subtitle={homeData.branding.heroSubtitle}
          backgroundImage={homeData.branding.heroBackgroundImage}
        /> : <HomeSection 
          headerInfo={homeServiceData.headerSection} 
          backgroundImage={homeServiceData.backgroundImage} 
          ctas={heroCTAsSection} 
          stats={homeServiceData.heroStats} />

        }
        <AboutSection bio={aboutData.bio} />
        <ServiceSection included={homeData.courseIncluded} modules={liveModules} info={pageInfo} />
        <ValuePropositionSection features={aboutData.features} />
        <TreatmentsGrid treatments={backendTreatments.slice(0, 4)} isHome={true} totalCount={backendTreatments.length} />
        {/* <FreeResourcesSection pdfs={homeData.freePDFs} /> */}
        <FAQSection faqs={faqsLimpias} />
        <TestimonialsSection reviews={approvedReviews.length > 0 ? approvedReviews : undefined} aggregate={reviewAggregate} />
      </main>
      </FadeIn>
      <Footer data={footerData} />
    </>
  )
}
