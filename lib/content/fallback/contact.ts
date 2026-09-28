/** Respaldo ENTERO de `/contact`: solo si el servicio no está disponible. */
import type { ContactData, WhatsAppConfig } from "@/lib/content/parse/contact"

export const CONTACT_FALLBACK: ContactData = {
  whatsappNumber: "+591 78751894",
  whatsappUrl: "https://wa.me/59178751894",
  phone: "+591 78751894",
  instagram: "@dra_yasmin.medrano",
  instagramUrl: "https://www.instagram.com/dra_yasmin.medrano",
  facebook: "DraMedranoMedesteticAntiaging",
  facebookUrl: "https://www.facebook.com/DraMedranoMedesteticAntiaging",
  tiktok: "",
  tiktokUrl: "",
  scheduleWeekdays: "9:00 AM – 7:00 PM",
  scheduleSaturday: "9:00 AM – 2:00 PM",
  scheduleSunday: "Cerrado",
  location: "Bolivia — Consulta vía WhatsApp para confirmar dirección exacta del consultorio.",
  // Sin coordenadas: las que había en el código eran las viejas (90 m más
  // allá, sobre otra calle). Sin punto fiable no se pinta mapa ni `geo`.
  latitude: "",
  longitude: "",
  mapsUrl: "",
}

/** El sitio nunca se queda sin canal de contacto. */
export const WHATSAPP_FALLBACK: WhatsAppConfig = { url: "https://wa.me/59178751894" }
