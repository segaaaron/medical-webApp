/**
 * Tipo del WhatsApp del consultorio, sin dependencias de servidor: lo importa
 * el provider cliente. El dato (y su respaldo) sale de lib/content/contact.ts.
 */
export interface WhatsAppConfig {
  /** Enlace base, sin `?text=`. Ej: https://wa.me/59178751894 */
  url: string
}
