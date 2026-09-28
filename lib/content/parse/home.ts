import type { homeHeaderSection } from "@/components/sections/HomeSection"
import type { FAQDraft, HeroStat } from "@/types"
import { arr, obj, str } from "./coerce"

export interface HomeContent {
  header: homeHeaderSection
  /** Una estadística sin valor no existe (no se pinta una tarjeta vacía). */
  stats: HeroStat[]
  ctaLabels: { treatments: string; booking: string }
  faqHeader: { eyebrow: string; title: string }
  /** Borrador crudo: se sanea al renderizar. Lista vacía = sección oculta. */
  faqs: FAQDraft[]
}

export function parseHome(input: unknown): HomeContent | null {
  const raw = obj(input)
  if (!raw) return null
  return {
    header: {
      specialties: str(raw.specialties),
      doctorName: str(raw.doctorName),
      subtitleSpecialities: str(raw.subtitle),
      description: str(raw.description),
    },
    stats: [
      { value: str(raw.stat1Value), label: str(raw.stat1Label) },
      { value: str(raw.stat2Value), label: str(raw.stat2Label) },
      { value: str(raw.stat3Value), label: str(raw.stat3Label) },
    ].filter((s) => s.value !== ""),
    ctaLabels: { treatments: str(raw.btn1Text), booking: str(raw.btn2Text) },
    faqHeader: { eyebrow: str(raw.faqSectionLabel), title: str(raw.faqTitle) },
    faqs: arr(raw.faqs)
      .map(obj)
      .filter((f): f is Record<string, unknown> => f !== null)
      .map((f) => ({ question: str(f.question), answer: str(f.answer) }))
      .filter((f) => f.question !== "" && f.answer !== ""),
  }
}
