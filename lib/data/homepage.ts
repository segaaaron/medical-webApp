import type { HeroStat, HeroCTA, ValueFeature, AboutStat, PromoBannerData, FreePDF } from "@/types"

export const promoBanner: PromoBannerData = {
  text: "💉 ¡Promoción especial en Biorevitalización con NCTF 135 HA! Renueva tu piel con el tratamiento estrella de la medicina estética —",
  ctaLabel: "¡Reserva tu cita por WhatsApp!",
  ctaHref: "https://wa.me/59178751894",
}

export const heroStats: HeroStat[] = [
  { value: "10+", label: "Años de Experiencia" },
  { value: "5000+", label: "Pacientes Satisfechos" },
  { value: "30+", label: "Tratamientos Disponibles" },
]

export const heroCTAs: HeroCTA[] = [
  { label: "VER TRATAMIENTOS", href: "#tratamientos", variant: "primary" },
  { label: "AGENDA TU CITA", href: "https://wa.me/59178751894", variant: "warning" },
]

// iconName is a string — safe to pass across the server→client boundary
export const valueFeatures: ValueFeature[] = [
  {
    iconName: "Eye",
    title: "Resultados Naturales y Seguros",
    description:
      "Cada tratamiento está diseñado para realzar tu belleza natural con procedimientos seguros, avalados y de alta efectividad.",
  },
  {
    iconName: "Award",
    title: "Tecnología de Vanguardia",
    description:
      "Contamos con equipos de última generación para ofrecer tratamientos faciales y corporales con resultados óptimos y duraderos.",
  },
  {
    iconName: "Zap",
    title: "Atención Personalizada",
    description:
      "Cada paciente recibe un plan de tratamiento individualizado, diseñado específicamente para sus necesidades y objetivos estéticos.",
  },
  {
    iconName: "TrendingUp",
    title: "Bienestar Integral",
    description:
      "Más allá de la estética, buscamos mejorar tu confianza y calidad de vida con tratamientos que te hacen sentir y verte mejor.",
  },
]

export const aboutStats: AboutStat[] = [
  { value: "10+", label: "Años de Experiencia" },
  { value: "5000+", label: "Pacientes Atendidos" },
  { value: "30+", label: "Tratamientos Disponibles" },
]

export const freePDFs: FreePDF[] = [
  {
    title: "Guía Completa de Medicina Estética Facial",
    description: "Aprende todo sobre los principales tratamientos faciales: botox, rellenos, rejuvenecimiento y más.",
    icon: "💆‍♀️",
  },
  {
    title: "Cómo Prepararte para tu Primera Consulta",
    description: "Todo lo que necesitas saber antes de tu primera visita al consultorio de medicina estética.",
    icon: "📋",
  },
  {
    title: "Cuidados Post-Tratamiento Esenciales",
    description: "Maximiza los resultados de tus tratamientos con esta guía completa de cuidados posteriores.",
    icon: "✨",
  },
]
