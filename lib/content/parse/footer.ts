import type { FooterData } from "@/components/layout/Footer"
import { arr, obj, str } from "./coerce"

export type { FooterData }

/**
 * Enlaces legales canónicos. No son contenido del panel sino las rutas reales
 * del sitio: el backend servía placeholders "#" y una Política de Reembolso
 * que no existe.
 */
export const LEGAL_LINKS = [
  { label: "Política de Privacidad", href: "/privacidad" },
  { label: "Términos y Condiciones", href: "/terminos" },
]

type Link = { label: string; href: string }

function links(v: unknown): Link[] {
  return arr(v)
    .map(obj)
    .filter((l): l is Record<string, unknown> => l !== null)
    .map((l) => ({ label: str(l.label), href: str(l.href) }))
    .filter((l) => l.label !== "" && l.href !== "")
}

/**
 * `/footer` tal cual. Las columnas de tratamientos NO salen de aquí (el panel
 * guardaba listas escritas a mano y desfasadas): las rellena el getter con el
 * servicio de tratamientos.
 */
export function parseFooter(input: unknown): FooterData | null {
  const raw = obj(input)
  if (!raw) return null
  return {
    doctorName: str(raw.doctorName),
    specialty: str(raw.specialty),
    description: str(raw.description),
    whatsappUrl: str(raw.whatsappUrl),
    facebookUrl: str(raw.facebookUrl),
    instagramUrl: str(raw.instagramUrl),
    tiktokUrl: str(raw.tiktokUrl),
    facialTreatments: [],
    bodyTreatments: [],
    officeLinks: links(raw.officeLinks),
    legalLinks: LEGAL_LINKS,
    copyrightText: str(raw.copyrightText),
    designedByText: str(raw.designedByText),
  }
}
