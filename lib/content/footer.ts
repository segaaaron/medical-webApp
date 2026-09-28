import { cache } from "react"
import { treatmentLinks } from "@/lib/seo/treatment-names"
import { fromService } from "./service"
import { getActiveTreatments } from "./treatments"
import { parseFooter, type FooterData } from "./parse/footer"
import { FOOTER_FALLBACK, FOOTER_TREATMENT_LINKS_FALLBACK } from "./fallback/footer"

export type { FooterData }

/**
 * Footer = dos servicios, cada uno entero por su lado:
 * - `/footer` responde → sus campos tal cual; falla → su respaldo entero.
 * - `/treatments` responde → TODOS los activos, repartidos en dos columnas;
 *   falla → un solo «Ver tratamientos».
 */
export const getFooter = cache(async (): Promise<FooterData> => {
  const [footer, treatments] = await Promise.all([
    fromService("/footer", parseFooter, FOOTER_FALLBACK, { revalidate: 300 }),
    getActiveTreatments(),
  ])
  const links =
    treatments.source === "service" ? treatmentLinks(treatments.data) : FOOTER_TREATMENT_LINKS_FALLBACK
  const half = Math.ceil(links.length / 2)
  const f = footer.data
  return {
    doctorName: f.doctorName,
    specialty: f.specialty,
    description: f.description,
    whatsappUrl: f.whatsappUrl,
    facebookUrl: f.facebookUrl,
    instagramUrl: f.instagramUrl,
    tiktokUrl: f.tiktokUrl,
    facialTreatments: links.slice(0, half),
    bodyTreatments: links.slice(half),
    officeLinks: f.officeLinks,
    legalLinks: f.legalLinks,
    copyrightText: f.copyrightText,
    designedByText: f.designedByText,
  }
})
