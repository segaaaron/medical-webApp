import { homeHeaderSection } from "@/components/sections/HomeSection"
import { backendFetch } from "@/lib/backend-client"
import { DEFAULTS } from "@/lib/store/content-store"
import { HeroStat } from "@/types"
import type { ContentStore } from "@/types/content"

/**
 * Fetches home page content from the backend and merges with fallback defaults.
 * Arrays are only overridden if the backend provides a non-empty array.
 * Always resolves — never throws.
 */
export async function getHomeData(): Promise<ContentStore> {
  const { data } = await backendFetch("/home")
  if (!data) return DEFAULTS
  const raw = data as Partial<ContentStore>

  // Helper: use raw array only if non-empty, otherwise keep default
  function arr<T>(rawVal: T[] | undefined, fallback: T[]): T[] {
    return Array.isArray(rawVal) && rawVal.length > 0 ? rawVal : fallback
  }
  
  return {
    ...DEFAULTS,
    ...raw,
    // Arrays: guard against empty overrides erasing defaults
    heroStats: arr(raw.heroStats, DEFAULTS.heroStats),
    heroCTAs: arr(raw.heroCTAs, DEFAULTS.heroCTAs),
    valueFeatures: arr(raw.valueFeatures, DEFAULTS.valueFeatures),
    courseIncluded: arr(raw.courseIncluded, DEFAULTS.courseIncluded),
    courseModules: arr(raw.courseModules, DEFAULTS.courseModules),
    presets: arr(raw.presets, DEFAULTS.presets),
    freePDFs: arr(raw.freePDFs, DEFAULTS.freePDFs),
    faqs: arr(raw.faqs, DEFAULTS.faqs),
    navLinks: arr(raw.navLinks, DEFAULTS.navLinks),
    footerGroups: arr(raw.footerGroups, DEFAULTS.footerGroups),
    // Nested objects: only override if backend provides them
    branding: raw.branding ?? DEFAULTS.branding,
    sectionHeaders: raw.sectionHeaders ?? DEFAULTS.sectionHeaders,
    promoPopup: raw.promoPopup ?? DEFAULTS.promoPopup,
    promoBanner: raw.promoBanner ?? DEFAULTS.promoBanner,
    freeResourcesForm: raw.freeResourcesForm ?? DEFAULTS.freeResourcesForm,
    about: raw.about ?? DEFAULTS.about,
    contact: raw.contact ?? DEFAULTS.contact,
  }
}

export async function getHomeDataService(): Promise<any> {
  const { data } = await backendFetch("/home")
  const raw = data as Partial<any>
  if (!data) return DEFAULTS
  const headerSection: homeHeaderSection = {
    specialties: raw.specialties ?? "",
    doctorName: raw.doctorName ?? "",
    subtitleSpecialities: raw.subtitle ?? "",
    description: raw.description ?? "",
  }
  const heroStatsSection: HeroStat[] = [
    { value: raw.stat1Value, label: raw.stat1Label }, 
    { value: raw.stat2Value, label: raw.stat2Label}, 
    { value: raw.stat3Value, label: raw.stat3Label}]

  return {
    ...raw,
    headerSection: headerSection,
    heroStats: heroStatsSection,
    backgroundImage: DEFAULTS.branding.heroBackgroundImage
  }
}