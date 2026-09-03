import { backendFetch, extractList } from "@/lib/backend-client"
import { treatmentLinks, type TreatmentRef } from "@/lib/seo/treatment-names"
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
  // Vacío: el perfil se carga desde el panel y vive en la base de datos, como
  // Facebook e Instagram. Sin dato no se pinta el icono ni se declara el
  // perfil en el schema — nunca se inventa una red social.
  tiktokUrl: "",
  facialTreatments: [
    { label: "Toxina Botulínica (Botox)", href: "/tratamientos" },
    { label: "Rellenos con Ácido Hialurónico", href: "/tratamientos" },
    { label: "Rejuvenecimiento Facial", href: "/tratamientos" },
    { label: "Tratamiento de Manchas", href: "/tratamientos" },
  ],
  // Respaldo por si el backend no responde. Vacío a propósito: los enlaces
  // reales vienen del panel. La lista anterior anunciaba reducción de medidas,
  // celulitis, depilación láser y estrías, que el consultorio no ofrece — un
  // respaldo nunca debe inventar servicios.
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFooter(raw: any): FooterData {
  return {
    doctorName: raw.doctorName || FOOTER_FALLBACK.doctorName,
    specialty: raw.specialty || FOOTER_FALLBACK.specialty,
    description: raw.description || FOOTER_FALLBACK.description,
    whatsappUrl: raw.whatsappUrl || FOOTER_FALLBACK.whatsappUrl,
    // `??` y no `||`: con `||`, una cadena vacía —el campo BORRADO a propósito
    // en el panel— caía al valor de reserva y el sitio seguía anunciando el
    // perfil antiguo. Verificado: con `instagramUrl: ""` desde el backend, el
    // `sameAs` seguía declarando la cuenta anterior. Con `??`, vacío significa
    // vacío y solo se usa la reserva cuando el backend no manda el campo.
    facebookUrl: raw.facebookUrl ?? FOOTER_FALLBACK.facebookUrl,
    instagramUrl: raw.instagramUrl ?? FOOTER_FALLBACK.instagramUrl,
    tiktokUrl: raw.tiktokUrl ?? FOOTER_FALLBACK.tiktokUrl,
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
  // Los tratamientos del footer salen del panel, no de una lista fija: la
  // anterior anunciaba depilación láser, celulitis, estrías y reducción de
  // medidas —ninguno se ofrece— y además enlazaba todo a `/tratamientos`
  // genérico en vez de a la ficha de cada uno.
  const [{ data }, treatmentsResult] = await Promise.all([
    backendFetch("/footer", { revalidate: 300 }),
    backendFetch<TreatmentRef[]>("/treatments?active=true", { revalidate: 300 }),
  ])

  const base = data ? mapFooter(data) : FOOTER_FALLBACK

  const activos =
    treatmentsResult.error === null
      ? extractList<TreatmentRef>(treatmentsResult.data).filter((t) => t.slug)
      : []

  // Sin datos del backend se conserva lo que hubiera: nunca se deja al
  // paciente sin enlaces, pero tampoco se inventan servicios.
  if (activos.length === 0) return base

  const enlaces = treatmentLinks(activos)
  return {
    ...base,
    facialTreatments: enlaces.slice(0, 5),
    bodyTreatments: enlaces.slice(5, 10),
  }
}
