/**
 * Client-safe conversion tracking helpers — Umami + optional Meta Pixel.
 * No-ops when scripts are not loaded (missing env vars, ad-blockers).
 */

type UmamiTrackFn = (eventName: string, data?: Record<string, unknown>) => void
type FbqFn = (...args: unknown[]) => void

declare global {
  interface Window {
    umami?: { track: UmamiTrackFn }
    fbq?: FbqFn
  }
}

export const UMAMI_URL = process.env.NEXT_PUBLIC_UMAMI_URL ?? ""
export const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? ""
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ""

function umami(eventName: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.umami?.track === "function") {
    window.umami.track(eventName, data)
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args)
  }
}

/**
 * Lead captured (contact form submitted).
 */
export function trackLead(params: { treatment?: string; source: string }) {
  umami("lead", {
    treatment: params.treatment || "(sin especificar)",
    source: params.source,
  })
  fbq("track", "Lead", { content_category: params.treatment || undefined })
}

/**
 * WhatsApp CTA clicked anywhere on the site.
 */
export function trackWhatsAppClick(source: string) {
  umami("whatsapp_click", { source })
  fbq("track", "Contact")
}
