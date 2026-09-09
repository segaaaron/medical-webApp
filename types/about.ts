import type { SafeHtml } from "@/lib/html/safe-html"
export interface BioDoc {
  doctorTitle: string
  doctorName: string
  doctorDescription: string
  doctorImage: string
  badgeDoctor: string
  experienceInfoLabel: string
  experienceInfoValue: string
  pacientsLabel: string
  pacientValue: string
  treatmentLabel: string
  treatmentValue: string
}

export interface BioSection {
  chooseUs: string
  title: string
  /**
   * Se renderiza como HTML en el subtítulo de sección. El tipo obliga a que
   * venga limpia del servidor (`lib/data/about.ts`), no del componente.
   */
  description: SafeHtml
  card1Title: string
  card1Description: string
  card2Title: string
  card2Description: string
  card3Title: string
  card3Description: string
  card4Title: string
  card4Description: string
}
