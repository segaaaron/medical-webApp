import { getHomeData, getHomeDataService } from "@/lib/data/home"
import { getFooterData } from "@/lib/data/footer"
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
import { CourseModule, HeroCTA } from "@/types"

// ─── Below-fold sections (lazy — split JS chunk, still SSR'd) ─────────────────
const ServiceSection = dynamic(() => import("@/components/sections/CourseSection").then(m => ({ default: m.ServiceSection })))
const ValuePropositionSection = dynamic(() => import("@/components/sections/ValuePropositionSection").then(m => ({ default: m.ValuePropositionSection })))
const TreatmentsGrid = dynamic(() => import("@/components/sections/TreatmentsGrid").then(m => ({ default: m.TreatmentsGrid })))
const FAQSection = dynamic(() => import("@/components/sections/FAQSection").then(m => ({ default: m.FAQSection })))
const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })))

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasminmedrano.com"

/** Campos de rating/reseñas para adjuntar al negocio (estrellas en Google). */
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
    review: reviews.slice(0, 6).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.patient_lastname ? `${r.patient_name} ${r.patient_lastname}` : r.patient_name },
      reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5", worstRating: "1" },
      reviewBody: r.body,
    })),
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

const SAME_AS = [
  "https://www.instagram.com/dra_yasmin.medrano",
  "https://www.facebook.com/DraMedranoMedesteticAntiaging",
]

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
  aggregate?: ReviewAggregate,
  treatments: BackendTreatment[] = []
) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${BASE_URL}/#business`,
    name: "Dra. Yasmin Medrano Avila — Medicina Estética",
    url: BASE_URL,
    logo: `${BASE_URL}/icon.svg`,
    telephone: "+59178751894",
    image: `${BASE_URL}/images/DraMedrano.jpeg`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle Paccieri #772, entre 16 de Julio y Antezana",
      addressLocality: "Cochabamba",
      addressRegion: "Cochabamba",
      addressCountry: "BO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -17.386471,
      longitude: -66.152366,
    },
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
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "19:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "09:00", closes: "14:00" },
    ],
    sameAs: SAME_AS,
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
  const [homeData, homeServiceData, footerData, promoData, aboutData, treatment, infoResult, reviewsResult] = await Promise.all([
    getHomeData(),
    getHomeDataService(),
    getFooterData(),
    getPromoData(),
    getAboutData(),
    backendFetch<BackendTreatment[]>("/treatments?active=true", { revalidate: 300 }),
    backendFetch<SiteContentTreatmentsPage>("/site-content/treatmentsPage", { revalidate: 60 }),
    backendFetch<PublicReview[]>("/reviews/public", { revalidate: 300 }),
  ])

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

  const localBusinessJsonLd = buildLocalBusinessJsonLd(
    approvedReviews,
    reviewAggregate,
    backendTreatments
  )

  const pageInfo: TreatmentsPageInfo | undefined =
  infoResult.error === null && infoResult.data?.value
    ? {
        ...infoResult.data.value,
        doctorImage: infoResult.data.value.doctorImage
          ? resolveImageUrl(infoResult.data.value.doctorImage as string)
          : undefined,
      }
    : undefined

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
      {/* Precarga del poster del hero → pinta de inmediato (sin "imagen cargando") */}
      <link rel="preload" as="image" href="/images/hero-poster.jpg" fetchPriority="high" />
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
        <FAQSection faqs={homeData.faqs} />
        <TestimonialsSection reviews={approvedReviews.length > 0 ? approvedReviews : undefined} aggregate={reviewAggregate} />
      </main>
      </FadeIn>
      <Footer data={footerData} />
    </>
  )
}
