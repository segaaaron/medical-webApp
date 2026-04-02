import { readContent } from "@/lib/store/content-store"

// ─── Layout ───────────────────────────────────────────────────────────────────
import { PromoBanner } from "@/components/layout/PromoBanner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

// ─── Sections ─────────────────────────────────────────────────────────────────
import { HeroSection } from "@/components/sections/HeroSection"
import { ValuePropositionSection } from "@/components/sections/ValuePropositionSection"
import { CourseSection } from "@/components/sections/CourseSection"
import { PresetsSection } from "@/components/sections/PresetsSection"
import { FreeResourcesSection } from "@/components/sections/FreeResourcesSection"
import { AboutSection } from "@/components/sections/AboutSection"
import { FAQSection } from "@/components/sections/FAQSection"

// ─── Social links (functions — never serialized, used in Server Component) ────
import { socialLinks } from "@/lib/data/navigation"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasminmedrano.com"

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

export default async function HomePage() {
  // Single source of truth: content-store merges data/content.json + defaults
  const c = await readContent()

  const faqJsonLd = buildFaqJsonLd(c.faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PromoBanner data={c.promoBanner} />
      <Navbar links={c.navLinks} />
      <main>
        <HeroSection stats={c.heroStats} ctas={c.heroCTAs} />
        <ValuePropositionSection features={c.valueFeatures} />
        <CourseSection included={c.courseIncluded} modules={c.courseModules} pricing={c.coursePricing} />
        <PresetsSection presets={c.presets} />
        <FreeResourcesSection pdfs={c.freePDFs} />
        <AboutSection bio={c.about.bio} stats={c.about.stats} />
        <FAQSection faqs={c.faqs} />
      </main>
      {/* socialLinks contains LucideIcon components — passed only to Footer (Server Component) */}
      <Footer groups={c.footerGroups} socials={socialLinks} />
    </>
  )
}
