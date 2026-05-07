import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import type { BioDoc, BioSection } from "@/app/nosotros/page"

export interface AboutData {
  bio: BioDoc | null
  features: BioSection | null
}

const BIO_FALLBACK: BioDoc = {
  doctorTitle: "Medicina Estética Avanzada",
  doctorName: "Dra. Yasmin Medrano Avila",
  doctorDescription:
    "La Dra. Yasmin Medrano Avila es médica especialista en medicina estética con más de 10 años de experiencia dedicados a realzar la belleza natural de sus pacientes.",
  doctorImage: "/images/DraMedrano.jpeg",
  badgeDoctor: "10",
  experienceInfoLabel: "Años de Experiencia",
  experienceInfoValue: "10+",
  pacientsLabel: "Pacientes Atendidos",
  pacientValue: "5000+",
  treatmentLabel: "Tratamientos Disponibles",
  treatmentValue: "30+",
}

const FEATURES_FALLBACK: BioSection = {
  chooseUs: "¿Por Qué Elegirnos?",
  title: "Tu bienestar y belleza son nuestra prioridad",
  description:
    "En el consultorio de la Dra. Yasmin Medrano Avila encontrarás un espacio dedicado exclusivamente a realzar tu belleza natural con los más altos estándares médicos.",
  card1Title: "Resultados Naturales y Seguros",
  card1Description:
    "Cada tratamiento está diseñado para realzar tu belleza natural con procedimientos seguros, avalados y de alta efectividad.",
  card2Title: "Atención Personalizada",
  card2Description:
    "Cada paciente recibe un plan de tratamiento individualizado, diseñado específicamente para sus necesidades y objetivos estéticos.",
  card3Title: "Tecnología de Vanguardia",
  card3Description:
    "Contamos con equipos de última generación para ofrecer tratamientos faciales y corporales con resultados óptimos y duraderos.",
  card4Title: "Bienestar Integral",
  card4Description:
    "Más allá de la estética, buscamos mejorar tu confianza y calidad de vida con tratamientos que te hacen sentir y verte mejor.",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAbout(raw: any): AboutData {
  const bio: BioDoc = {
    doctorTitle: raw.sectionLabel || BIO_FALLBACK.doctorTitle,
    doctorName: raw.doctorName || BIO_FALLBACK.doctorName,
    doctorDescription: raw.descriptionDoc || BIO_FALLBACK.doctorDescription,
    doctorImage: resolveImageUrl(raw.imageUrl ?? raw.image_url ?? raw.image ?? null) || BIO_FALLBACK.doctorImage,
    badgeDoctor: raw.experienceBadgeValue || BIO_FALLBACK.badgeDoctor,
    experienceInfoLabel: raw.stat1Label || BIO_FALLBACK.experienceInfoLabel,
    experienceInfoValue: raw.stat1Value || BIO_FALLBACK.experienceInfoValue,
    pacientsLabel: raw.stat2Label || BIO_FALLBACK.pacientsLabel,
    pacientValue: raw.stat2Value || BIO_FALLBACK.pacientValue,
    treatmentLabel: raw.stat3Label || BIO_FALLBACK.treatmentLabel,
    treatmentValue: raw.stat3Value || BIO_FALLBACK.treatmentValue,
  }

  const features: BioSection = {
    chooseUs: raw.whyChooseUsLabel?.trim() || FEATURES_FALLBACK.chooseUs,
    title: raw.whyChooseUsTitle?.trim() || FEATURES_FALLBACK.title,
    description: raw.whyChooseUsDescription?.trim() || FEATURES_FALLBACK.description,
    card1Title: raw.feature1Title?.trim() || FEATURES_FALLBACK.card1Title,
    card1Description: raw.feature1Description?.trim() || FEATURES_FALLBACK.card1Description,
    card2Title: raw.feature2Title?.trim() || FEATURES_FALLBACK.card2Title,
    card2Description: raw.feature2Description?.trim() || FEATURES_FALLBACK.card2Description,
    card3Title: raw.feature3Title?.trim() || FEATURES_FALLBACK.card3Title,
    card3Description: raw.feature3Description?.trim() || FEATURES_FALLBACK.card3Description,
    card4Title: raw.feature4Title?.trim() || FEATURES_FALLBACK.card4Title,
    card4Description: raw.feature4Description?.trim() || FEATURES_FALLBACK.card4Description,
  }

  return { bio, features }
}

/**
 * Fetches about/doctor data from the backend and returns it merged with fallback values.
 * Always resolves — never throws.
 */
export async function getAboutData(): Promise<AboutData> {
  const { data } = await backendFetch("/about")
  if (!data) return { bio: BIO_FALLBACK, features: FEATURES_FALLBACK }
  return mapAbout(data)
}
