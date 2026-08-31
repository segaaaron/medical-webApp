import { backendFetch } from "@/lib/backend-client"
import { WHATSAPP_FALLBACK, type WhatsAppConfig } from "@/lib/whatsapp"

/**
 * Fuente única del WhatsApp del consultorio: el registro de Contacto que se
 * edita en el panel (Dashboard → Contacto). Antes el número vivía cableado en
 * `lib/constants`, así que cambiarlo desde el panel no movía ni el botón
 * flotante ni los CTA — había que tocar código y volver a desplegar.
 *
 * Solo para Server Components: `backendFetch` lee cookies. El tipo y el
 * fallback viven en `lib/whatsapp` para que el provider cliente no arrastre
 * este módulo al bundle del navegador.
 *
 * Cacheado 5 minutos: es un dato que cambia de año en año, no por request.
 */
export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  const { data, error } = await backendFetch<unknown>("/contact", { revalidate: 300 })
  if (error || !data || typeof data !== "object") return WHATSAPP_FALLBACK

  const raw = data as Record<string, unknown>
  const url = typeof raw.whatsappUrl === "string" ? raw.whatsappUrl.trim() : ""

  // Solo se acepta un enlace de WhatsApp: un campo mal pegado en el panel no
  // debe convertirse en un enlace a cualquier sitio para todos los visitantes.
  const valid = /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(url)
  return { url: valid ? url : WHATSAPP_FALLBACK.url }
}
