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

export default async function HomePage() {
  // Single source of truth: content-store merges data/content.json + defaults
  const c = await readContent()

  return (
    <>
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
