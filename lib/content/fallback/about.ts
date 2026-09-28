/**
 * Respaldo ENTERO de `/about`: solo entra si el servicio no está disponible.
 * Sin cifras: un respaldo no inventa años ni pacientes (con valor vacío,
 * AboutSection no pinta la estadística y las frases con cifras se omiten).
 */
import { trustedHtml } from "@/lib/html/safe-html"
import type { AboutData } from "@/lib/content/parse/about"

export const ABOUT_FALLBACK: AboutData = {
  bio: {
    doctorTitle: "Medicina Estética Avanzada",
    doctorName: "Dra. Yasmin Medrano Avila",
    doctorDescription:
      "La Dra. Yasmin Medrano Avila es médica especialista en medicina estética dedicada a realzar la belleza natural de sus pacientes.",
    doctorImage: "/images/DraMedrano.jpeg",
    badgeDoctor: "",
    experienceInfoLabel: "",
    experienceInfoValue: "",
    pacientsLabel: "",
    pacientValue: "",
    treatmentLabel: "",
    treatmentValue: "",
  },
  features: {
    chooseUs: "¿Por Qué Elegirnos?",
    title: "Tu bienestar y belleza son nuestra prioridad",
    // Literal del repositorio: no viene del panel, no hace falta sanearlo.
    description: trustedHtml(
      "En el consultorio de la Dra. Yasmin Medrano Avila encontrarás un espacio dedicado exclusivamente a realzar tu belleza natural con los más altos estándares médicos."
    ),
    card1Title: "Resultados Naturales y Seguros",
    card1Description:
      "Cada tratamiento está diseñado para realzar tu belleza natural con procedimientos seguros, avalados y de alta efectividad.",
    card2Title: "Atención Personalizada",
    card2Description:
      "Cada paciente recibe un plan de tratamiento individualizado, diseñado específicamente para sus necesidades y objetivos estéticos.",
    card3Title: "Tecnología de Vanguardia",
    card3Description:
      "Contamos con equipos de última generación para ofrecer tratamientos faciales con resultados óptimos y duraderos.",
    card4Title: "Bienestar Integral",
    card4Description:
      "Más allá de la estética, buscamos mejorar tu confianza y calidad de vida con tratamientos que te hacen sentir y verte mejor.",
  },
  gallery: [],
  stats: [],
}
