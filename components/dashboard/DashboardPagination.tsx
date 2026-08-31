"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { pageWindow } from "@/lib/pagination"

/**
 * Paginación del panel. Una sola implementación para blog y tratamientos: antes
 * cada página repetía el mismo bloque de 30 líneas con estilos ligeramente
 * distintos, y arreglar uno dejaba el otro atrás.
 *
 * El paginador público (`TreatmentsPaginated`) no sirve aquí: navega por URL y
 * refresca el grid contra la API; el panel pagina datos ya cargados en memoria.
 * Lo que sí comparten —qué números caben— vive en `lib/pagination`.
 */
export function DashboardPagination({
  currentPage,
  totalPages,
  onPageChange,
  label,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  label: string
}) {
  if (totalPages <= 1) return null

  const itemBase =
    "inline-flex items-center justify-center h-9 rounded-lg text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label={label}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="Página anterior"
        className={`${itemBase} w-9 border`}
        style={{ color: "var(--prem-muted)", borderColor: "var(--prem-border)" }}
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>

      {pageWindow(currentPage, totalPages).map((page, i) =>
        page === -1 ? (
          <span key={`gap-${i}`} className="px-1 text-sm select-none" style={{ color: "var(--prem-muted)" }}>
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Ir a la página ${page}`}
            className={`${itemBase} min-w-[36px] px-2 ${page === currentPage ? "text-white" : "border"}`}
            style={
              page === currentPage
                ? { backgroundColor: "var(--vintage-gold)" }
                : { color: "var(--prem-muted)", borderColor: "var(--prem-border)" }
            }
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="Página siguiente"
        className={`${itemBase} w-9 border`}
        style={{ color: "var(--prem-muted)", borderColor: "var(--prem-border)" }}
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  )
}
