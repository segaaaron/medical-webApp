/**
 * Respaldo de `/promo-banner`: sin banner. Una promoción no se inventa — si el
 * panel no responde, no hay oferta que anunciar.
 */
import type { PromoDisplayData } from "@/lib/content/parse/promo"

export const PROMO_FALLBACK: PromoDisplayData = {
  active: false,
  label: "",
  badges: [],
  title: "",
  highlightedText: "",
  description: "",
  doctorName: "",
  location: "",
  ctaLabel: "",
  ctaHref: "",
  dismissLabel: "",
  imageUrl: "",
}
