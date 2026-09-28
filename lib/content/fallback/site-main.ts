/** Respaldo de la navegación (`/site-content/main`). */
import type { NavLink } from "@/types"

export const NAV_LINKS_FALLBACK: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Tratamientos", href: "/tratamientos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
]
