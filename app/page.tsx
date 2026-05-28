import { getHomeData, getHomeDataService } from "@/lib/data/home"
import { getFooterData } from "@/lib/data/footer"
import { getPromoData } from "@/lib/data/promo"
import { getAboutData } from "@/lib/data/about"
import { backendFetch, resolveImageUrl, extractList } from "@/lib/backend-client"
import { safeJsonLd } from "@/lib/seo-utils"

// ─── Layout ───────────────────────────────────────────────────────────────────
import { PromoBanner } from "@/components/layout/PromoBanner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

// ─── Sections ─────────────────────────────────────────────────────────────────
import { HeroSectionFallback } from "@/components/sections/HeroSection"
import { ValuePropositionSection } from "@/components/sections/ValuePropositionSection"
import { ServiceSection, TreatmentsPageInfo } from "@/components/sections/CourseSection"
import { PresetsSection } from "@/components/sections/PresetsSection"
import { FreeResourcesSection } from "@/components/sections/FreeResourcesSection"
import { AboutSection } from "@/components/sections/AboutSection"
import { FAQSection } from "@/components/sections/FAQSection"
import { TestimonialsSection } from "@/components/sections/TestimonialsSection"
import { TreatmentsGrid } from "@/components/sections/TreatmentsGrid"
import { HeroCTA } from "@/types"
import { HomeSection } from "@/components/sections/HomeSection"

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

export default async function HomePage() {
  const [homeData, homeServiceData ,footerData, promoData, aboutData, treatment, infoResult] = await Promise.all([
    getHomeData(),
    getHomeDataService(),
    getFooterData(),
    getPromoData(),
    getAboutData(),
    backendFetch<BackendTreatment[]>("/treatments?active=true"),
    backendFetch<SiteContentTreatmentsPage>("/site-content/treatmentsPage"),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
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
