import { normalizeSocialUrl } from "@/lib/seo/meta"
import type { ContactData } from "@/types/content"
import { obj, str } from "./coerce"

import type { WhatsAppConfig } from "@/lib/whatsapp"

export type { ContactData, WhatsAppConfig }

/**
 * Coordenada como texto numérico, o "" si viene vacía o no es un número.
 * `Number("")` vale 0 —el Golfo de Guinea—, así que el vacío se descarta antes.
 */
function coord(v: unknown): string {
  const text = typeof v === "number" ? String(v) : str(v)
  if (text === "") return ""
  const n = Number(text)
  return Number.isFinite(n) ? String(n) : ""
}

export function parseContact(input: unknown): ContactData | null {
  const raw = obj(input)
  if (!raw) return null
  const lat = coord(raw.latitude)
  const lng = coord(raw.longitude)
  const hasCoords = lat !== "" && lng !== ""
  return {
    whatsappNumber: str(raw.whatsappNumber),
    whatsappUrl: str(raw.whatsappUrl),
    phone: str(raw.phone),
    instagram: str(raw.instagramUsername),
    instagramUrl: str(raw.instagramUrl),
    facebook: str(raw.facebookName),
    facebookUrl: str(raw.facebookUrl),
    tiktok: str(raw.tiktokUsername),
    // La app de TikTok da el enlace con `?_r=1&_t=…`; se limpia al leer.
    tiktokUrl: normalizeSocialUrl(str(raw.tiktokUrl)),
    scheduleWeekdays: str(raw.mondayFridayHours),
    scheduleSaturday: str(raw.saturdayHours),
    scheduleSunday: str(raw.sundayStatus),
    location: str(raw.locationDescription),
    latitude: lat,
    longitude: lng,
    // Derivado de las coordenadas, no del `mapsUrl` del panel: ese campo se
    // quedó apuntando al punto viejo cuando se corrigieron las coordenadas.
    mapsUrl: hasCoords ? `https://www.google.com/maps?q=${lat},${lng}` : "",
  }
}

/**
 * Solo un enlace de WhatsApp es válido: un campo mal pegado no debe convertir
 * el botón de todos los visitantes en un enlace a cualquier sitio. Inválido →
 * `null` → respaldo entero del recurso WhatsApp.
 */
export function parseWhatsApp(input: unknown): WhatsAppConfig | null {
  const raw = obj(input)
  if (!raw) return null
  const url = str(raw.whatsappUrl)
  return /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(url) ? { url } : null
}
