import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Las colas de conversión.
 *
 * Los píxeles publicitarios ahora esperan a la primera interacción
 * (components/analytics/AnalyticsScripts.tsx). Eso solo es seguro si los
 * eventos anteriores a su carga NO se pierden.
 *
 * El escenario que protege este archivo es concreto y vale dinero: una paciente
 * entra desde un anuncio y lo primero que hace es tocar «Agendar por WhatsApp».
 * Ese gesto es a la vez la primera interacción y la conversión.
 *
 * Meta y TikTok encolan. Google Ads NO tiene cola propia: depende de que el
 * `init` inline esté cargado antes, porque es él quien define `window.gtag` y
 * la cola `dataLayer`. Si alguien mueve ese `init` detrás de la interacción, la
 * conversión se descarta en silencio — y la última prueba de aquí falla.
 */

// Hay que fijar el entorno ANTES de importar el módulo: las constantes se leen
// en el momento de la carga.
const ENV = {
  NEXT_PUBLIC_META_PIXEL_ID: "111",
  NEXT_PUBLIC_TIKTOK_PIXEL_ID: "222",
  NEXT_PUBLIC_GOOGLE_ADS_ID: "AW-333",
  NEXT_PUBLIC_GADS_LABEL_WHATSAPP: "etiqueta-whatsapp",
  NEXT_PUBLIC_GADS_LABEL_LEAD: "etiqueta-lead",
}

async function cargarAnalytics() {
  for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v)
  vi.resetModules()
  return import("@/lib/analytics")
}

beforeEach(() => {
  // Un `window` mínimo: estas funciones solo tocan estas claves.
  vi.stubGlobal("window", {} as Window & typeof globalThis)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe("Meta: encola si el pixel aún no cargó", () => {
  it("un clic a WhatsApp antes de la carga queda en __fbqPending", async () => {
    const { trackWhatsAppClick } = await cargarAnalytics()
    trackWhatsAppClick("hero")
    expect(window.__fbqPending).toEqual([["track", "Contact"]])
  })

  it("si el pixel ya cargó, llama directo y no encola", async () => {
    const fbq = vi.fn()
    window.fbq = fbq
    const { trackWhatsAppClick } = await cargarAnalytics()
    trackWhatsAppClick("hero")
    expect(fbq).toHaveBeenCalledWith("track", "Contact")
    expect(window.__fbqPending).toBeUndefined()
  })
})

describe("TikTok: encola si el pixel aún no cargó", () => {
  it("el lead del formulario queda en __ttqPending", async () => {
    const { trackLead } = await cargarAnalytics()
    trackLead({ treatment: "Botox", source: "contacto" })
    expect(window.__ttqPending).toEqual([["SubmitForm", { content_name: "Botox" }]])
  })
})

describe("Google Ads: NO tiene cola propia — depende del init eager", () => {
  it("con el init cargado (window.gtag definido), la conversión se registra", async () => {
    // Esto es lo que hace el <Script id="google-ads-init"> que dejamos eager:
    // define gtag() empujando a dataLayer.
    const dataLayer: unknown[] = []
    window.dataLayer = dataLayer
    window.gtag = ((...args: unknown[]) => {
      dataLayer.push(args)
    }) as typeof window.gtag

    const { trackWhatsAppClick } = await cargarAnalytics()
    trackWhatsAppClick("hero")

    expect(dataLayer).toHaveLength(1)
    expect(dataLayer[0]).toEqual([
      "event",
      "conversion",
      { send_to: "AW-333/etiqueta-whatsapp" },
    ])
  })

  it("SIN el init (window.gtag ausente), la conversión se pierde en silencio", async () => {
    // Este test documenta el riesgo, no un comportamiento deseado. Si alguien
    // mueve el `init` de Google Ads detrás de la primera interacción, ESTE es
    // el estado en que queda la página: sin error, sin cola y sin conversión.
    const { trackWhatsAppClick } = await cargarAnalytics()
    expect(() => trackWhatsAppClick("hero")).not.toThrow()
    expect(window.dataLayer).toBeUndefined()
    // Meta y TikTok sí la guardaron; Google Ads no tiene dónde.
    expect(window.__fbqPending).toHaveLength(1)
  })
})

describe("Umami sigue siendo la medición que no depende de nada", () => {
  it("registra el evento cuando está presente", async () => {
    const track = vi.fn()
    window.umami = { track }
    const { trackWhatsAppClick } = await cargarAnalytics()
    trackWhatsAppClick("treatment-detail-cta", "Botox")
    expect(track).toHaveBeenCalledWith("whatsapp_click", {
      source: "treatment-detail-cta",
      treatment: "Botox",
    })
  })

  it("no explota si Umami está bloqueado por un adblocker", async () => {
    const { trackWhatsAppClick, trackLead } = await cargarAnalytics()
    expect(() => trackWhatsAppClick("navbar")).not.toThrow()
    expect(() => trackLead({ source: "contacto" })).not.toThrow()
  })
})
