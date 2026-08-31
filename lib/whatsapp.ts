import { WHATSAPP_URL } from "@/lib/constants"

export interface WhatsAppConfig {
  /** Enlace base, sin `?text=`. Ej: https://wa.me/59178751894 */
  url: string
}

/** Se usa si el backend no responde: la web nunca se queda sin contacto. */
export const WHATSAPP_FALLBACK: WhatsAppConfig = { url: WHATSAPP_URL }
