import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import { DEFAULTS } from "@/lib/store/content-store"

export interface PromoDisplayData {
  active: boolean
  label: string
  badges: string[]
  title: string
  highlightedText: string
  description: string
  doctorName: string
  location: string
  ctaLabel: string
  ctaHref: string
  dismissLabel: string
  imageUrl: string
}

/** Convierte el string "a, b, c" del backend en lista de chips (sin vacíos, máx 4). */
function parseBadges(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((b) => String(b).trim()).filter(Boolean).slice(0, 4)
  if (typeof raw === "string") return raw.split(",").map((b) => b.trim()).filter(Boolean).slice(0, 4)
  return []
}

export const PROMO_FALLBACK: PromoDisplayData = {
  active: true,
  label: DEFAULTS.promoPopup.label,
  badges: [],
  title: "Biorevitalización con",
  highlightedText: "NCTF 135 HA",
  description: DEFAULTS.promoPopup.description,
  doctorName: DEFAULTS.branding.doctorName,
  location: DEFAULTS.branding.city,
  ctaLabel: DEFAULTS.promoPopup.ctaLabel,
  ctaHref: DEFAULTS.promoPopup.ctaHref,
  dismissLabel: DEFAULTS.promoPopup.dismissLabel,
  imageUrl: "",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPromo(raw: any): PromoDisplayData {
  return {
    active: raw.active ?? PROMO_FALLBACK.active,
    label: raw.tag || PROMO_FALLBACK.label,
    badges: parseBadges(raw.badges),
    title: raw.title || PROMO_FALLBACK.title,
    highlightedText: raw.highlightedText || PROMO_FALLBACK.highlightedText,
    description: raw.description || PROMO_FALLBACK.description,
    doctorName: raw.doctorName || PROMO_FALLBACK.doctorName,
    location: raw.location || PROMO_FALLBACK.location,
    ctaLabel: raw.whatsappText || PROMO_FALLBACK.ctaLabel,
    ctaHref: raw.whatsappUrl || PROMO_FALLBACK.ctaHref,
    dismissLabel: raw.dismissText || PROMO_FALLBACK.dismissLabel,
    imageUrl: resolveImageUrl(raw.imageUrl) || PROMO_FALLBACK.imageUrl,
  }
}

/**
 * Fetches promo banner data from the backend and returns it merged with fallback values.
 * Always resolves — never throws.
 */
export async function getPromoData(): Promise<PromoDisplayData> {
  const { data } = await backendFetch("/promo-banner", { revalidate: 300 })
  return data ? mapPromo(data) : PROMO_FALLBACK
}
