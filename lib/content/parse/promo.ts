import { bool, image, obj, str } from "./coerce"

export interface PromoDisplayData {
  active: boolean
  label: string
  badges: string[]
  title: string
  highlightedText: string
  description: string
  doctorName: string
  location: string
  ctaLabel: string
  ctaHref: string
  dismissLabel: string
  imageUrl: string
}

/** "a, b, c" (o array) → chips sin vacíos, máx. 4. */
function badges(raw: unknown): string[] {
  const parts = Array.isArray(raw) ? raw.map(String) : typeof raw === "string" ? raw.split(",") : []
  return parts.map((b) => b.trim()).filter(Boolean).slice(0, 4)
}

export function parsePromo(input: unknown): PromoDisplayData | null {
  const raw = obj(input)
  if (!raw) return null
  return {
    active: bool(raw.active),
    label: str(raw.tag),
    badges: badges(raw.badges),
    title: str(raw.title),
    highlightedText: str(raw.highlightedText),
    description: str(raw.description),
    doctorName: str(raw.doctorName),
    location: str(raw.location),
    ctaLabel: str(raw.whatsappText),
    ctaHref: str(raw.whatsappUrl),
    dismissLabel: str(raw.dismissText),
    imageUrl: image(raw.imageUrl),
  }
}
