/**
 * Respaldo de `/treatments`: lista vacía. Un respaldo no afirma qué
 * tratamientos se ofrecen hoy; sin servicio, las fichas no se enlazan.
 */
import type { Treatment, TreatmentsPageData } from "@/lib/content/parse/treatments"
import type { PresetCategory } from "@/types"

export const TREATMENTS_FALLBACK: Treatment[] = []
export const TREATMENTS_PAGE_FALLBACK: TreatmentsPageData = { items: [], meta: null }

/**
 * Lo que `/tratamientos` enseña en lugar del catálogo cuando el servicio de
 * tratamientos no responde: áreas generales, no una lista de procedimientos.
 */
export const TREATMENT_CATEGORIES_FALLBACK: PresetCategory[] = [
  {
    name: "Tratamientos Faciales",
    description: "Botox, rellenos, rejuvenecimiento y luminosidad facial con técnicas avanzadas.",
    tag: "Popular",
    tagColor: "#b5496a",
  },
  {
    name: "Medicina Regenerativa",
    description: "Bioestimulación con factores de crecimiento, polinucleótidos y plasma rico en plaquetas para rejuvenecer.",
    tag: "Innovador",
    tagColor: "#8f3452",
  },
  {
    name: "Hidratación y Nutrición Cutánea",
    description: "Mesoterapia, vitaminas, ácido hialurónico y tratamientos hidratantes para una piel radiante y saludable.",
    tag: "Esencial",
    tagColor: "#c9a96e",
  },
]
