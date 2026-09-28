import type { NavLink } from "@/types"
import { arr, obj, siteContentValue, str } from "./coerce"

/**
 * `/site-content/main`: de este registro antiguo el sitio solo usa la
 * navegación. El resto (módulos, categorías, contacto…) anuncia servicios que
 * el consultorio no ofrece y no se lee.
 */
export function parseNavLinks(input: unknown): NavLink[] | null {
  const value = siteContentValue(input)
  if (!value) return null
  return arr(value.navLinks)
    .map(obj)
    .filter((l): l is Record<string, unknown> => l !== null)
    .map((l) => ({ label: str(l.label), href: str(l.href) }))
    .filter((l) => l.label !== "" && l.href !== "")
}
