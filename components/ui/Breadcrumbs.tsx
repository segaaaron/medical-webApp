import Link from "next/link"

/**
 * Migas de pan visibles.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ
 *
 * El `BreadcrumbList` estaba en el JSON-LD de todas las páginas, pero en la
 * pantalla no había ninguna. Eso deja dos cosas a medias:
 *
 * 1. Google pide que lo que afirman los datos estructurados sea visible en la
 *    página. Un breadcrumb declarado y no mostrado es una señal a medio
 *    cumplir, y las migas son de los pocos adornos que Google llega a pintar
 *    en el propio resultado de búsqueda, en lugar de la URL.
 * 2. Quien llega desde Google a la ficha de un tratamiento —que es por donde
 *    entra casi todo el tráfico— no tenía forma de subir al catálogo. O usaba
 *    el menú, o se iba.
 *
 * El componente NO emite JSON-LD: cada página ya construye el suyo con las URL
 * absolutas que necesita. Duplicarlo aquí crearía dos listas para la misma
 * página, que es el tipo de contradicción que este sitio ya arregló dos veces.
 */

export interface Crumb {
  label: string
  /** Sin `href` en el último: la página actual no se enlaza a sí misma. */
  href?: string
}

interface BreadcrumbsProps {
  items: Crumb[]
  /** Sobre fondo oscuro se invierten los colores del texto. */
  tone?: "light" | "dark"
}

export function Breadcrumbs({ items, tone = "light" }: BreadcrumbsProps) {
  if (items.length === 0) return null

  const color = tone === "dark" ? "rgba(255,255,255,0.72)" : "var(--primary-darkest)"

  return (
    // `max-w-3xl mx-auto px-6` es EXACTAMENTE el contenedor que usan el hero y
    // el cuerpo de las fichas y los artículos. Con un ancho distinto las migas
    // quedaban pegadas al borde izquierdo mientras el resto de la página estaba
    // centrada, y se leían como un elemento suelto en vez de como el principio
    // del contenido.
    <nav aria-label="Ruta de navegación" className="pt-6">
      <ol className="max-w-3xl mx-auto px-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {items.map((item, i) => {
          const ultimo = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.href && !ultimo ? (
                <Link
                  href={item.href}
                  className="hover:opacity-70 transition-opacity underline underline-offset-4"
                  style={{ color }}
                >
                  {item.label}
                </Link>
              ) : (
                <span style={{ color, opacity: ultimo ? 0.7 : 1 }} aria-current={ultimo ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!ultimo && (
                <span aria-hidden="true" style={{ color: "var(--vintage-gold)" }}>
                  /
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
