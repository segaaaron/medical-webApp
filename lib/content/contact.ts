import { cache } from "react"
import { openingHoursFrom, toE164, type OpeningHoursSpec } from "@/lib/seo/local"
import { fromService } from "./service"
import { parseContact, parseWhatsApp, type ContactData, type WhatsAppConfig } from "./parse/contact"
import { CONTACT_FALLBACK, WHATSAPP_FALLBACK } from "./fallback/contact"

export type { ContactData, WhatsAppConfig }

/** Contacto del panel (Dashboard → Contacto). */
export const getContact = cache(() =>
  fromService("/contact", parseContact, CONTACT_FALLBACK, { revalidate: 300 })
)

/**
 * WhatsApp del consultorio. Recurso aparte del contacto porque su validez es
 * estricta: un enlace que no es de WhatsApp invalida el recurso entero y se usa
 * el respaldo (el botón de todos los visitantes no puede apuntar a otro sitio).
 * Misma petición cacheada que `getContact`.
 */
export const getWhatsApp = cache(async (): Promise<WhatsAppConfig> => {
  const r = await fromService("/contact", parseWhatsApp, WHATSAPP_FALLBACK, { revalidate: 300 })
  return r.data
})

export interface ConsultorioLocation {
  latitude: number
  longitude: number
  /** Enlace al punto en Google Maps, derivado de las mismas coordenadas. */
  mapsUrl: string
}

/**
 * Coordenadas para el `geo` del schema, o `null`: mejor omitirlo que declarar
 * un punto falso (vacío, fuera de rango o 0,0 —el Golfo de Guinea—).
 */
export function locationOf(c: ContactData): ConsultorioLocation | null {
  if (c.latitude === "") return null
  if (c.longitude === "") return null
  const latitude = Number(c.latitude)
  const longitude = Number(c.longitude)
  if (Math.abs(latitude) > 90) return null
  if (Math.abs(longitude) > 180) return null
  if (latitude === 0 && longitude === 0) return null
  return { latitude, longitude, mapsUrl: c.mapsUrl }
}

/** Teléfono (E.164) y horario del schema, derivados del contacto. */
export function businessContactOf(c: ContactData): { telephone: string; openingHours: OpeningHoursSpec[] } {
  return {
    telephone: toE164(c.phone),
    openingHours: openingHoursFrom({
      weekdays: c.scheduleWeekdays,
      saturday: c.scheduleSaturday,
      sunday: c.scheduleSunday,
    }),
  }
}
