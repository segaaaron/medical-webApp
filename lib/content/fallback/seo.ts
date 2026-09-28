/**
 * Respaldo ENTERO de `/site-content/seo` (Dashboard → SEO / Google): los
 * metadatos estáticos que el sitio servía antes del panel, limpios — sin
 * servicios concretos que puedan dejar de ofrecerse y sin cifras.
 *
 * `home` va vacío a propósito: sin título del panel, la portada deriva el suyo
 * de los tratamientos activos (ver app/page.tsx).
 */
import type { SiteSeo } from "@/lib/content/parse/seo"

export const SEO_FALLBACK: SiteSeo = {
  home: { title: "", description: "" },
  nosotros: {
    title: "Dra. Yasmin Medrano Avila — Medicina Estética Cochabamba",
    description:
      "Dra. Yasmin Medrano Avila, médica especialista en medicina estética en Cochabamba, Bolivia. Consulta de valoración personalizada.",
  },
  tratamientos: {
    title: "Tratamientos Estéticos en Cochabamba | Dra. Yasmin Medrano Avila",
    description:
      "Tratamientos de medicina estética facial en Cochabamba con la Dra. Yasmin Medrano Avila. Consulta de valoración personalizada.",
  },
  contacto: {
    title: "Agenda tu Consulta en Cochabamba | Dra. Yasmin Medrano Avila",
    description:
      "Agenda tu consulta con la Dra. Yasmin Medrano en Cochabamba: horarios, ubicación y atención por WhatsApp e Instagram.",
  },
  blog: {
    title: "Blog de Medicina Estética | Dra. Yasmin Medrano Avila",
    description:
      "Medicina estética y cuidado de la piel explicados por la Dra. Yasmin Medrano, médica estética en Cochabamba. Guías reales, sin promesas de resultado.",
  },
}
