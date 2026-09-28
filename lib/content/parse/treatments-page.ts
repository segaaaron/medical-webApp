import { sanitizeHtml } from "@/lib/html/sanitize"
import type { TreatmentsPageInfo } from "@/components/sections/CourseSection"
import { arr, image, siteContentValue, str } from "./coerce"

export type { TreatmentsPageInfo }

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** `consultationItems` viaja como JSON dentro del FormData del panel. */
function items(v: unknown): string[] {
  let parsed: unknown = v
  if (typeof v === "string") {
    try {
      parsed = JSON.parse(v)
    } catch {
      parsed = []
    }
  }
  return arr(parsed).map(str).filter(Boolean)
}

/**
 * `/site-content/treatmentsPage` (app/dashboard/tratamientos/info). El panel
 * guarda `description` en texto plano + `descriptionHighlight` (el fragmento a
 * resaltar en dorado); el subtítulo HTML se construye y sanea aquí.
 */
export function parseTreatmentsPage(input: unknown): TreatmentsPageInfo | null {
  const value = siteContentValue(input)
  if (!value) return null

  const description = escapeHtml(str(value.description))
  const highlight = escapeHtml(str(value.descriptionHighlight))
  const subtitleHtml =
    highlight !== "" && description.includes(highlight)
      ? description.replace(
          highlight,
          // Función, no cadena: un `$&`/`$'` escrito en el panel no se interpreta.
          () => `<span style="color:var(--vintage-gold);font-weight:700;">${highlight}</span>`
        )
      : description

  return {
    label: str(value.label),
    title: str(value.title),
    subtitle: sanitizeHtml(subtitleHtml),
    consultationTitle: str(value.consultationTitle),
    consultationItems: items(value.consultationItems),
    doctorImage: image(value.doctorImage),
    ctaTitle: str(value.ctaTitle),
    ctaSubtitle: str(value.ctaSubtitle),
    buttonText: str(value.buttonText),
    disclaimer: str(value.disclaimer),
  }
}
