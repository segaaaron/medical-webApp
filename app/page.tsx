import { getHomeData, getHomeDataService } from "@/lib/data/home"
import { getFooterData } from "@/lib/data/footer"
import { getPromoData } from "@/lib/data/promo"
import { getAboutData } from "@/lib/data/about"
import { backendFetch, resolveImageUrl, extractList, extractReviewAggregate } from "@/lib/backend-client"
import { safeJsonLd } from "@/lib/seo-utils"
import dynamic from "next/dynamic"

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
import { HeroCTA } from "@/types"

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
function buildLocalBusinessJsonLd(reviews: PublicReview[], aggregate?: ReviewAggregate) {
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
      addressLocality: "Cochabamba",
      addressCountry: "BO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -17.386471,
      longitude: -66.152366,
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "19:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "09:00", closes: "14:00" },
    ],
    sameAs: SAME_AS,
    medicalSpecialty: "Medicina Estética",
    ...buildRatingFields(reviews, aggregate),
  }
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  name: "Dra. Yasmin Medrano Avila",
  url: BASE_URL,
  inLanguage: "es-BO",
  publisher: { "@id": `${BASE_URL}/#business` },
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
  id: string
  name: string
  description: string | null
  price: number
  tag: string
  imageUrl: string | null
  active: boolean
}

export const revalidate = 300 // 5 min ISR

export default async function HomePage() {
  const [homeData, homeServiceData, footerData, promoData, aboutData, treatment, infoResult, reviewsResult] = await Promise.all([
    getHomeData(),
    getHomeDataService(),
    getFooterData(),
    getPromoData(),
    getAboutData(),
    backendFetch<BackendTreatment[]>("/treatments?active=true", { revalidate: 60 }),
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
  const localBusinessJsonLd = buildLocalBusinessJsonLd(approvedReviews, reviewAggregate)
  const siteNavJsonLd = buildSiteNavJsonLd(homeData.navLinks)

  const backendError = treatment.error !== null
  const backendTreatments = backendError
    ? []
    : extractList<BackendTreatment>(treatment.data).map((t) => ({
        ...t,
        imageUrl: resolveImageUrl(t.imageUrl),
      }))

  const pageInfo: TreatmentsPageInfo | undefined =
  infoResult.error === null && infoResult.data?.value
    ? {
        ...infoResult.data.value,
        doctorImage: infoResult.data.value.doctorImage
          ? resolveImageUrl(infoResult.data.value.doctorImage as string)
          : undefined,
      }
    : undefined

  const liveModules =
    backendTreatments.length > 0
      ? backendTreatments.map((t) => ({ title: t.name, treatmentId: t.id }))
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(siteNavJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusinessJsonLd) }} />
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
        <TestimonialsSection reviews={approvedReviews.length > 0 ? approvedReviews : undefined} aggregate={reviewAggregate} />
        <FAQSection faqs={homeData.faqs} />
      </main>
      </FadeIn>
      <Footer data={footerData} />
    </>
  )
}
