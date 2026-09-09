/**
 * Enlace de salto al contenido. Marcado estático: no necesita ser componente de
 * cliente, y al vivir en el layout raíz su directiva `"use client"` abría una
 * frontera de cliente en TODAS las páginas para un `<a>` sin estado.
 */

export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
      style={{ backgroundColor: "var(--vintage-gold)", color: "#1a0510" }}
    >
      Saltar al contenido
    </a>
  )
}
