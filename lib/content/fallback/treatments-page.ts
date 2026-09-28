/**
 * Respaldo ENTERO de `/site-content/treatmentsPage` (sección de servicios):
 * solo si el servicio no está disponible.
 */
import { trustedHtml } from "@/lib/html/safe-html"
import type { TreatmentsPageInfo } from "@/lib/content/parse/treatments-page"

export const TREATMENTS_PAGE_INFO_FALLBACK: TreatmentsPageInfo = {
  label: "Nuestros Servicios",
  title: "Tratamientos de Medicina Estética",
  subtitle: trustedHtml(
    "Tratamientos de medicina estética con <span style='color:var(--vintage-gold);font-weight:700;'>tecnología de vanguardia</span> y los más altos estándares de seguridad médica."
  ),
  consultationTitle: "Lo Que Incluye Cada Consulta",
  consultationItems: [
    "Consulta de valoración personalizada",
    "Plan de tratamiento individualizado",
    "Seguimiento post-tratamiento",
    "Productos de calidad certificada",
    "Tecnología de última generación",
    "Atención médica especializada",
  ],
  doctorImage: "/images/draMedrano2.jpeg",
  ctaTitle: "Agenda tu Cita",
  ctaSubtitle: "Consulta personalizada con la Dra. Yasmin",
  buttonText: "RESERVAR MI CONSULTA",
  disclaimer: "Sin compromiso · Atención personalizada garantizada",
}
