import { backendFetch } from "@/lib/backend-client"
import type { FooterData } from "@/components/layout/Footer"

// Canonical legal links. Forced on the frontend so they always resolve to the
// real pages regardless of what the backend returns (the backend previously
// served placeholder "#" hrefs and a Refund Policy page that does not exist).
const LEGAL_LINKS = [
  { label: "Política de Privacidad", href: "/privacidad" },
  { label: "Términos y Condiciones", href: "/terminos" },
]

export const FOOTER_FALLBACK: FooterData = {
  doctorName: "Dra. Yasmin Medrano Avila",
  specialty: "Medicina Estética Avanzada",
  description:
    "Especialista en medicina estética dedicada a realzar tu belleza natural con tratamientos seguros y efectivos.",
  whatsappUrl: "https://wa.me/59178751894",
  facebookUrl: "https://www.facebook.com/DraMedranoMedesteticAntiaging",
  instagramUrl: "https://www.instagram.com/dra_yasmin.medrano",
  facialTreatments: [
    { label: "Toxina Botulínica (Botox)", href: "/tratamientos" },
    { label: "Rellenos con Ácido Hialurónico", href: "/tratamientos" },
    { label: "Rejuvenecimiento Facial", href: "/tratamientos" },
    { label: "Tratamiento de Manchas", href: "/tratamientos" },
  ],
  bodyTreatments: [
    { label: "Reducción de Medidas", href: "/tratamientos" },
    { label: "Eliminación de Celulitis", href: "/tratamientos" },
    { label: "Depilación Láser", href: "/tratamientos" },
    { label: "Tratamiento de Estrías", href: "/tratamientos" },
  ],
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFooter(raw: any): FooterData {
  return {
    doctorName: raw.doctorName || FOOTER_FALLBACK.doctorName,
    specialty: raw.specialty || FOOTER_FALLBACK.specialty,
    description: raw.description || FOOTER_FALLBACK.description,
    whatsappUrl: raw.whatsappUrl || FOOTER_FALLBACK.whatsappUrl,
    facebookUrl: raw.facebookUrl || FOOTER_FALLBACK.facebookUrl,
    instagramUrl: raw.instagramUrl || FOOTER_FALLBACK.instagramUrl,
    facialTreatments:
      Array.isArray(raw.facialTreatments) && raw.facialTreatments.length
        ? raw.facialTreatments
        : FOOTER_FALLBACK.facialTreatments,
    bodyTreatments:
      Array.isArray(raw.bodyTreatments) && raw.bodyTreatments.length
        ? raw.bodyTreatments
        : FOOTER_FALLBACK.bodyTreatments,
    officeLinks:
      Array.isArray(raw.officeLinks) && raw.officeLinks.length
        ? raw.officeLinks
        : FOOTER_FALLBACK.officeLinks,
    // Always use our canonical legal links — never the backend's (which served
    // placeholder "#" hrefs and a non-existent Refund Policy).
    legalLinks: LEGAL_LINKS,
    copyrightText: raw.copyrightText || FOOTER_FALLBACK.copyrightText,
    designedByText: raw.designedByText || FOOTER_FALLBACK.designedByText,
  }
}

/**
 * Fetches footer data from the backend and returns it merged with fallback values.
 * Always resolves — never throws.
 */
export async function getFooterData(): Promise<FooterData> {
  const { data } = await backendFetch("/footer", { revalidate: 300 })
  return data ? mapFooter(data) : FOOTER_FALLBACK
}
