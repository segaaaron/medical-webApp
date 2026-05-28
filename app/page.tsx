import { getHomeData, getHomeDataService } from "@/lib/data/home"
import { getFooterData } from "@/lib/data/footer"
import { getPromoData } from "@/lib/data/promo"
import { getAboutData } from "@/lib/data/about"
import { backendFetch, resolveImageUrl, extractList } from "@/lib/backend-client"
import { safeJsonLd } from "@/lib/seo-utils"
import dynamic from "next/dynamic"

// ─── Layout ───────────────────────────────────────────────────────────────────
import { PromoBanner } from "@/components/layout/PromoBanner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

// ─── Above-fold sections (eager) ──────────────────────────────────────────────
import { HeroSectionFallback } from "@/components/sections/HeroSection"
import { AboutSection } from "@/components/sections/AboutSection"
import { HomeSection } from "@/components/sections/HomeSection"
import { TreatmentsPageInfo } from "@/components/sections/CourseSection"
import { HeroCTA } from "@/types"

// ─── Below-fold sections (lazy — split JS chunk, still SSR'd) ─────────────────
const ServiceSection = dynamic(() => import("@/components/sections/CourseSection").then(m => ({ default: m.ServiceSection })))
const ValuePropositionSection = dynamic(() => import("@/components/sections/ValuePropositionSection").then(m => ({ default: m.ValuePropositionSection })))
const TreatmentsGrid = dynamic(() => import("@/components/sections/TreatmentsGrid").then(m => ({ default: m.TreatmentsGrid })))
const FAQSection = dynamic(() => import("@/components/sections/FAQSection").then(m => ({ default: m.FAQSection })))

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

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

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "Dra. Yasmin Medrano Avila — Medicina Estética",
  url: BASE_URL,
  telephone: "+591 78751894",
  image: `${BASE_URL}/images/DraMedrano.jpeg`,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cochabamba",
    addressCountry: "BO",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -17.3895,
    longitude: -66.1568,
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "19:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "09:00", closes: "14:00" },
  ],
  sameAs: [
    "https://www.instagram.com/dra_yasmin.medrano",
    "https://www.facebook.com/DraMedranoMedesteticAntiaging",
  ],
  medicalSpecialty: "Aesthetic Medicine",
}

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Tratamientos", item: `${BASE_URL}/tratamientos` },
    { "@type": "ListItem", position: 3, name: "Nosotros", item: `${BASE_URL}/nosotros` },
    { "@type": "ListItem", position: 4, name: "Blog", item: `${BASE_URL}/blog` },
    { "@type": "ListItem", position: 5, name: "Contacto", item: `${BASE_URL}/contacto` },
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
  const [homeData, homeServiceData, footerData, promoData, aboutData, treatment, infoResult] = await Promise.all([
    getHomeData(),
    getHomeDataService(),
    getFooterData(),
    getPromoData(),
    getAboutData(),
    backendFetch<BackendTreatment[]>("/treatments?active=true", { revalidate: 60 }),
    backendFetch<SiteContentTreatmentsPage>("/site-content/treatmentsPage", { revalidate: 60 }),
  ])

  const faqJsonLd = buildFaqJsonLd(homeData.faqs)
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
      ? backendTreatments.map((t) => ({ title: t.name }))
      : homeData.courseModules

  const heroCTAsSection: HeroCTA[] = [
    {label: homeServiceData.btn1Text, href: '/tratamientos', variant: 'primary'},
    {label: homeServiceData.btn2Text, href: footerData.whatsappUrl, variant: 'primary'}
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusinessJsonLd) }} />
      <PromoBanner data={promoData} />
      <Navbar links={homeData.navLinks} />
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
        <TreatmentsGrid treatments={backendTreatments.slice(0, 4)} isHome={true} />
        {/* <FreeResourcesSection pdfs={homeData.freePDFs} /> */}
        {/* <TestimonialsSection /> */}
        <FAQSection faqs={homeData.faqs} />
      </main>
      <Footer data={footerData} />
    </>
  )
}
