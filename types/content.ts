import type {
  PromoBannerData,
  HeroStat,
  HeroCTA,
  ValueFeature,
  CourseIncluded,
  CourseModule,
  CoursePricing,
  PresetCategory,
  FreePDF,
  AboutStat,
  FAQ,
  NavLink,
  FooterGroup,
  BrandingData,
  SectionHeaders,
  PromoPopupData,
  FreeResourcesFormData,
} from "@/types"

// ─── ContentStore ─────────────────────────────────────────────────────────────
// Single source of truth at runtime.
// Populated by readContent() which merges data/content.json with lib/data/* defaults.
// To connect a DB later: replace lib/store/content-store.ts only.

export interface AboutContent {
  bio: string[]       // array of paragraph strings
  stats: AboutStat[]
}

export interface ContentStore {
  branding: BrandingData
  sectionHeaders: SectionHeaders
  promoBanner: PromoBannerData
  promoPopup: PromoPopupData
  heroStats: HeroStat[]
  heroCTAs: HeroCTA[]
  valueFeatures: ValueFeature[]
  courseIncluded: CourseIncluded[]
  courseModules: CourseModule[]
  coursePricing: CoursePricing
  presets: PresetCategory[]
  freePDFs: FreePDF[]
  freeResourcesForm: FreeResourcesFormData
  about: AboutContent
  faqs: FAQ[]
  navLinks: NavLink[]
  footerGroups: FooterGroup[]
}

// Partial override saved to data/content.json
export type ContentOverride = Partial<ContentStore>
