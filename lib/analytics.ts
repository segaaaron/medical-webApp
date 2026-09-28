/**
 * Client-safe conversion tracking helpers — Umami + optional Meta / TikTok Pixel.
 * No-ops when scripts are not loaded (missing env vars, ad-blockers).
 */

type UmamiTrackFn = (eventName: string, data?: Record<string, unknown>) => void
type FbqFn = (...args: unknown[]) => void
type TtqFn = {
  track: (event: string, params?: Record<string, unknown>) => void
  page: () => void
  identify: (params: Record<string, unknown>) => void
}

declare global {
  interface Window {
    umami?: { track: UmamiTrackFn }
    fbq?: FbqFn
    ttq?: TtqFn
    gtag?: (...args: unknown[]) => void
    /** Eventos anteriores a la carga diferida del pixel; los vacía AnalyticsScripts. */
    __fbqPending?: unknown[][]
    __ttqPending?: [string, Record<string, unknown> | undefined][]
  }
}

export const UMAMI_URL = process.env.NEXT_PUBLIC_UMAMI_URL ?? ""
export const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? ""
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ""
export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? ""
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? ""
/** Etiquetas de conversión de Google Ads. Vacías = no se dispara conversión. */
export const GADS_LABEL_WHATSAPP = process.env.NEXT_PUBLIC_GADS_LABEL_WHATSAPP ?? ""
export const GADS_LABEL_LEAD = process.env.NEXT_PUBLIC_GADS_LABEL_LEAD ?? ""

function umami(eventName: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.umami?.track === "function") {
    window.umami.track(eventName, data)
  }
}

// Los pixels cargan con lazyOnload: si aún no están, el evento se encola y el
// script de inicio lo envía tras `init` (ver AnalyticsScripts). Sin ID, no-op.
function fbq(...args: unknown[]) {
  if (typeof window === "undefined" || !META_PIXEL_ID) return
  if (typeof window.fbq === "function") window.fbq(...args)
  else (window.__fbqPending ??= []).push(args)
}

function ttq(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !TIKTOK_PIXEL_ID) return
  if (typeof window.ttq?.track === "function") window.ttq.track(event, params)
  else (window.__ttqPending ??= []).push([event, params])
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args)
  }
}

/** Google Ads conversion — no-op if the account ID or the label is missing. */
function gadsConversion(label: string) {
  const etiqueta = label.trim()
  if (!GOOGLE_ADS_ID || !etiqueta) return
  gtag("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${etiqueta}` })
}

/** Lead captured via contact form. */
export function trackLead(params: { treatment?: string; source: string }) {
  umami("lead", {
    treatment: params.treatment || "(sin especificar)",
    source: params.source,
  })
  fbq("track", "Lead", { content_category: params.treatment || undefined })
  ttq("SubmitForm", { content_name: params.treatment || "(sin especificar)" })
  gadsConversion(GADS_LABEL_LEAD)
}

/** WhatsApp CTA clicked — pass source label (navbar, footer, hero, treatment-card, etc). */
export function trackWhatsAppClick(source: string, treatment?: string) {
  umami("whatsapp_click", { source, ...(treatment ? { treatment } : {}) })
  fbq("track", "Contact")
  ttq("Contact", { content_name: treatment || source })
  gadsConversion(GADS_LABEL_WHATSAPP)
}

/** Treatment detail page viewed. */
export function trackTreatmentView(params: { id: string; name: string }) {
  umami("treatment_view", { id: params.id, name: params.name })
}

/** Treatment card clicked on /tratamientos grid. */
export function trackTreatmentClick(params: { id: string; name: string }) {
  umami("treatment_click", { id: params.id, name: params.name })
}

/** Blog post viewed. */
export function trackBlogView(params: { slug: string; title: string }) {
  umami("blog_view", { slug: params.slug, title: params.title })
}

/** Blog card clicked on /blog list. */
export function trackBlogClick(params: { slug: string; title: string }) {
  umami("blog_click", { slug: params.slug, title: params.title })
}

/** Enlace que abre WhatsApp (wa.me o api.whatsapp.com). */
export function isWhatsAppHref(href: string) {
  return /(^|\/\/)(wa\.me|api\.whatsapp\.com)\//.test(href)
}

/** Hero CTA clicked (primary/secondary buttons in hero). Si va a WhatsApp, cuenta también como conversión. */
export function trackHeroCTA(params: { label: string; href: string }) {
  umami("hero_cta_click", { label: params.label, href: params.href })
  if (isWhatsAppHref(params.href)) trackWhatsAppClick("hero")
}

/** Scroll depth milestones (25/50/75/100%). */
export function trackScrollDepth(percent: number) {
  umami("scroll_depth", { percent })
}
