import { resolveImageUrl } from "@/lib/backend-client"
import { sanitizeHtml } from "@/lib/html/sanitize"
import type { TreatmentsPageInfo } from "@/components/sections/CourseSection"

/**
 * Textos de la sección de servicios, tal y como los edita el panel.
 *
 * El mismo mapeo estaba escrito dos veces —en la portada y en `/tratamientos`—
 * y las dos copias tenían que acordarse de resolver la foto de la doctora. Al
 * añadir el saneado del subtítulo habrían sido dos sitios donde olvidarlo, así
 * que el mapeo pasa a vivir una sola vez.
 *
 * `subtitle` se inyecta como HTML en la página: se limpia aquí, en el servidor,
 * que es por donde el contenido del panel entra al sitio.
 */
export function mapTreatmentsPageInfo(raw: unknown): TreatmentsPageInfo | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const value = raw as Record<string, unknown>

  return {
    ...(value as TreatmentsPageInfo),
    subtitle: typeof value.subtitle === "string" ? sanitizeHtml(value.subtitle) : undefined,
    doctorImage:
      typeof value.doctorImage === "string" ? resolveImageUrl(value.doctorImage) : undefined,
  }
}
