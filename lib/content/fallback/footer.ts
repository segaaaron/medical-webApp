/** Respaldo ENTERO de `/footer`: solo si el servicio no está disponible. */
import type { FooterData } from "@/lib/content/parse/footer"
import { LEGAL_LINKS } from "@/lib/content/parse/footer"

export const FOOTER_FALLBACK: FooterData = {
  doctorName: "Dra. Yasmin Medrano Avila",
  specialty: "Medicina Estética Avanzada",
  description:
    "Especialista en medicina estética dedicada a realzar tu belleza natural con tratamientos seguros y efectivos.",
  whatsappUrl: "https://wa.me/59178751894",
  facebookUrl: "https://www.facebook.com/DraMedranoMedesteticAntiaging",
  instagramUrl: "https://www.instagram.com/dra_yasmin.medrano",
  // Sin dato no se pinta el icono ni se declara el perfil: nunca se inventa
  // una red social.
  tiktokUrl: "",
  // Las columnas de tratamientos las pone el getter con SU servicio.
  facialTreatments: [],
  bodyTreatments: [],
  officeLinks: [
    { label: "Nosotros", href: "/nosotros" },
    { label: "Blog", href: "/blog" },
    { label: "Contacto", href: "/contacto" },
    { label: "Agenda tu Cita", href: "https://wa.me/59178751894" },
  ],
  legalLinks: LEGAL_LINKS,
  copyrightText: `© ${new Date().getFullYear()} Dra. Yasmin Medrano Avila — Medicina Estética Avanzada. Todos los derechos reservados.`,
  designedByText: "Diseñado con ❤️ para tu bienestar y belleza.",
}

/** Columna de tratamientos si ESE servicio falla: un enlace honesto. */
export const FOOTER_TREATMENT_LINKS_FALLBACK = [{ label: "Ver tratamientos", href: "/tratamientos" }]
