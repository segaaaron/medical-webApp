import type { homeHeaderSection } from "@/components/sections/HomeSection"
import { backendFetch } from "@/lib/backend-client"
import { DEFAULTS } from "@/lib/store/content-store"
import type { HeroStat } from "@/types"
import type { ContentStore } from "@/types/content"

/**
 * Single fetch for /home — Next.js deduplicates identical fetch calls within
 * the same render, so getHomeData + getHomeDataService share one network request.
 */
async function fetchHomeRaw(): Promise<Record<string, unknown> | null> {
  const { data } = await backendFetch("/home", { revalidate: 60 })
  return data as Record<string, unknown> | null
}

export async function getHomeData(): Promise<ContentStore> {
  const data = await fetchHomeRaw()
  if (!data) return DEFAULTS
  const raw = data as Partial<ContentStore>

  function arr<T>(rawVal: T[] | undefined, fallback: T[]): T[] {
    return Array.isArray(rawVal) && rawVal.length > 0 ? rawVal : fallback
  }

  return {
    ...DEFAULTS,
    ...raw,
    heroStats:         arr(raw.heroStats,         DEFAULTS.heroStats),
    heroCTAs:          arr(raw.heroCTAs,          DEFAULTS.heroCTAs),
    valueFeatures:     arr(raw.valueFeatures,     DEFAULTS.valueFeatures),
    courseIncluded:    arr(raw.courseIncluded,    DEFAULTS.courseIncluded),
    courseModules:     arr(raw.courseModules,     DEFAULTS.courseModules),
    presets:           arr(raw.presets,           DEFAULTS.presets),
    freePDFs:          arr(raw.freePDFs,          DEFAULTS.freePDFs),
    faqs:              arr(raw.faqs,              DEFAULTS.faqs),
    navLinks:          arr(raw.navLinks,          DEFAULTS.navLinks),
    footerGroups:      arr(raw.footerGroups,      DEFAULTS.footerGroups),
    branding:          raw.branding          ?? DEFAULTS.branding,
    sectionHeaders:    raw.sectionHeaders    ?? DEFAULTS.sectionHeaders,
    promoPopup:        raw.promoPopup        ?? DEFAULTS.promoPopup,
    promoBanner:       raw.promoBanner       ?? DEFAULTS.promoBanner,
    freeResourcesForm: raw.freeResourcesForm ?? DEFAULTS.freeResourcesForm,
    about:             raw.about             ?? DEFAULTS.about,
    contact:           raw.contact           ?? DEFAULTS.contact,
  }
}

const HOME_SERVICE_FALLBACK: HomeServiceData = {
  id: null,
  headerSection: {
    specialties: "",
    doctorName: "",
    subtitleSpecialities: "",
    description: "",
  },
  heroStats: [],
  backgroundImage: DEFAULTS.branding.heroBackgroundImage,
  btn1Text: "",
  btn2Text: "",
}

export interface HomeServiceData {
  id: string | null
  headerSection: homeHeaderSection
  heroStats: HeroStat[]
  backgroundImage: string
  btn1Text: string
  btn2Text: string
  [key: string]: unknown
}

export async function getHomeDataService(): Promise<HomeServiceData> {
  const data = await fetchHomeRaw()
  if (!data) return HOME_SERVICE_FALLBACK

  const headerSection: homeHeaderSection = {
    specialties:          typeof data.specialties === "string"  ? data.specialties  : "",
    doctorName:           typeof data.doctorName  === "string"  ? data.doctorName   : "",
    subtitleSpecialities: typeof data.subtitle    === "string"  ? data.subtitle     : "",
    description:          typeof data.description === "string"  ? data.description  : "",
  }

  const heroStats: HeroStat[] = [
    { value: typeof data.stat1Value === "string" ? data.stat1Value : "", label: typeof data.stat1Label === "string" ? data.stat1Label : "" },
    { value: typeof data.stat2Value === "string" ? data.stat2Value : "", label: typeof data.stat2Label === "string" ? data.stat2Label : "" },
    { value: typeof data.stat3Value === "string" ? data.stat3Value : "", label: typeof data.stat3Label === "string" ? data.stat3Label : "" },
  ]

  return {
    ...data,
    headerSection,
    heroStats,
    backgroundImage: DEFAULTS.branding.heroBackgroundImage,
  } as HomeServiceData
}
