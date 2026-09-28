import { sanitizeHtml } from "@/lib/html/sanitize"
import type { BioDoc, BioSection } from "@/types/about"
import type { HeroStat } from "@/types"
import { arr, firstStr, image, obj, str } from "./coerce"

export interface AboutData {
  bio: BioDoc
  features: BioSection
  gallery: string[]
  /**
   * Estadísticas del panel como pares enteros «valor + etiqueta» («12+» +
   * «Años de Experiencia»). Nada fija cuál es «años» o «pacientes», así que no
   * se interpretan: se citan tal cual, y un par incompleto no existe.
   */
  stats: HeroStat[]
}

/** Galería: array de strings o de objetos `{url}`/`{imageUrl}`. Máx. 10. */
function gallery(raw: Record<string, unknown>): string[] {
  const items = arr(raw.gallery).length ? arr(raw.gallery) : arr(raw.galleryImages).length ? arr(raw.galleryImages) : arr(raw.gallery_images)
  return items
    .map((item) => {
      const o = obj(item)
      return image(o ? firstStr(o.url, o.imageUrl) : item)
    })
    .filter(Boolean)
    .slice(0, 10)
}

export function parseAbout(input: unknown): AboutData | null {
  const raw = obj(input)
  if (!raw) return null

  const bio: BioDoc = {
    doctorTitle: str(raw.sectionLabel),
    doctorName: str(raw.doctorName),
    doctorDescription: str(raw.descriptionDoc),
    doctorImage: image(firstStr(raw.imageUrl, raw.image_url, raw.image)),
    badgeDoctor: str(raw.experienceBadgeValue),
    experienceInfoLabel: str(raw.stat1Label),
    experienceInfoValue: str(raw.stat1Value),
    pacientsLabel: str(raw.stat2Label),
    pacientValue: str(raw.stat2Value),
    treatmentLabel: str(raw.stat3Label),
    treatmentValue: str(raw.stat3Value),
  }

  const features: BioSection = {
    chooseUs: str(raw.whyChooseUsLabel),
    title: str(raw.whyChooseUsTitle),
    // Se limpia en la frontera por la que el contenido del panel entra al
    // sitio: el navegador nunca recibe HTML sin sanear.
    description: sanitizeHtml(str(raw.whyChooseUsDescription)),
    card1Title: str(raw.feature1Title),
    card1Description: str(raw.feature1Description),
    card2Title: str(raw.feature2Title),
    card2Description: str(raw.feature2Description),
    card3Title: str(raw.feature3Title),
    card3Description: str(raw.feature3Description),
    card4Title: str(raw.feature4Title),
    card4Description: str(raw.feature4Description),
  }

  const stats: HeroStat[] = [
    { value: bio.experienceInfoValue, label: bio.experienceInfoLabel },
    { value: bio.pacientValue, label: bio.pacientsLabel },
    { value: bio.treatmentValue, label: bio.treatmentLabel },
  ].filter((s) => s.value !== "" && s.label !== "")

  return { bio, features, gallery: gallery(raw), stats }
}
