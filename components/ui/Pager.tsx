"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { pageWindow } from "@/lib/pagination"

/**
 * Paginador del sitio público.
 *
 * Estaba escrito dentro de `TreatmentsPaginated`, así que la página de reseñas
 * nació con su propio paginador: mismos botones, otra forma —cuadrados, sin
 * flechas, otros tamaños—. Dos paginadores distintos en el mismo sitio se leen
 * como dos sitios distintos.
 *
 * Aquí vive el único. Sirve a los dos modos de navegación que existen:
 *
 * - `onNavigate` → cambia de página sin recargar (tratamientos: solo se
 *   refresca la rejilla, sin tocar navbar ni footer).
 * - `basePath`    → enlaces reales (reseñas: cada página es una URL propia que
 *   Google puede rastrear e indexar).
 *
 * Al usar enlaces se renderiza `<a>` y no `<button>`: un buscador no pulsa
 * botones, pero sí sigue enlaces.
 */

interface PagerProps {
  page: number
  totalPages: number
  /** Navegación en cliente. Excluyente con `basePath`. */
  onNavigate?: (page: number) => void
  /**
   * Ruta base para navegar por enlaces. Excluyente con `onNavigate`.
   *
   * Es una cadena y no una función a propósito: este componente es de cliente
   * y React no permite pasarle funciones desde un componente de servidor.
   * La página 1 apunta a la ruta limpia, sin `?page=1`, para no tener dos URLs
   * con el mismo contenido.
   */
  basePath?: string
  /** Deshabilita los controles mientras carga. Solo con `onNavigate`. */
  pending?: boolean
  /** Para el `aria-label` del bloque: «Paginación de {label}». */
  label: string
  className?: string
}

const BASE =
  "inline-flex items-center justify-center min-w-[42px] h-[42px] px-3 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"

const HOVER =
  " hover:bg-[var(--vintage-gold)] hover:text-[#1a0510] hover:border-[var(--vintage-gold)]"

/** Botón inactivo y flechas: superficie translúcida sobre fondo oscuro. */
const IDLE: React.CSSProperties = {
  color: "var(--vintage-gold-light, #D4B483)",
  backgroundColor: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(212,180,131,0.45)",
}

/** Página actual: dorado sólido con halo. */
const ACTIVE: React.CSSProperties = {
  color: "#1a0510",
  backgroundColor: "var(--vintage-gold)",
  border: "1px solid var(--vintage-gold)",
  boxShadow: "0 0 0 1px rgba(184,151,59,0.35), 0 6px 18px rgba(184,151,59,0.3)",
}

export function Pager({
  page,
  totalPages,
  onNavigate,
  basePath,
  pending = false,
  label,
  className = "flex items-center justify-end gap-2 flex-wrap mt-8",
}: PagerProps) {
  if (totalPages <= 1) return null

  /** Un control: enlace si hay `basePath`, botón si hay `onNavigate`. */
  function Control({
    target,
    disabled,
    ariaLabel,
    current,
    children,
  }: {
    target: number
    disabled: boolean
    ariaLabel: string
    current?: boolean
    children: React.ReactNode
  }) {
    const style = current ? ACTIVE : IDLE
    const cls = BASE + (current ? "" : HOVER)

    if (basePath && !disabled) {
      return (
        <a
          href={target === 1 ? basePath : `${basePath}?page=${target}`}
          aria-label={ariaLabel}
          aria-current={current ? "page" : undefined}
          className={cls}
          style={style}
        >
          {children}
        </a>
      )
    }

    return (
      <button
        type="button"
        onClick={() => onNavigate?.(target)}
        disabled={disabled || pending}
        aria-label={ariaLabel}
        aria-current={current ? "page" : undefined}
        className={cls}
        style={style}
      >
        {children}
      </button>
    )
  }

  return (
    <nav className={className} aria-label={`Paginación de ${label}`}>
      <Control target={page - 1} disabled={page <= 1} ariaLabel="Página anterior">
        <ChevronLeft size={16} aria-hidden="true" />
      </Control>

      {pageWindow(page, totalPages).map((p, i) =>
        p === -1 ? (
          <span
            key={`gap-${i}`}
            className="select-none px-1 text-sm"
            style={{ color: "rgba(212,180,131,0.55)" }}
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Control
            key={p}
            target={p}
            disabled={false}
            current={p === page}
            ariaLabel={`Ir a la página ${p}`}
          >
            {p}
          </Control>
        )
      )}

      <Control
        target={page + 1}
        disabled={page >= totalPages}
        ariaLabel="Página siguiente"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </Control>
    </nav>
  )
}
