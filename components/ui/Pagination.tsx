import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  /** Página actual (1-based). */
  currentPage: number
  /** Total de páginas. */
  totalPages: number
  /** Ruta base sin query, ej. "/tratamientos". */
  basePath: string
  /** Nombre del query param de página. Default "page". */
  pageParam?: string
}

/** Construye href conservando solo el param de página (page=1 => ruta limpia). */
function pageHref(basePath: string, pageParam: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?${pageParam}=${page}`
}

/** Devuelve la ventana de páginas a mostrar, con -1 como marcador de elipsis. */
function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: number[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push(-1)
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push(-1)
  pages.push(total)
  return pages
}

const baseItem =
  "inline-flex items-center justify-center min-w-[40px] h-10 px-3 rounded-full text-sm font-semibold transition-colors"

export function Pagination({ currentPage, totalPages, basePath, pageParam = "page" }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = pageWindow(currentPage, totalPages)
  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  return (
    <nav
      aria-label="Paginación de tratamientos"
      className="flex items-center justify-center gap-2 flex-wrap mt-12 mb-4"
    >
      {/* Anterior */}
      {prevDisabled ? (
        <span
          aria-disabled="true"
          className={`${baseItem} opacity-30 cursor-not-allowed`}
          style={{ color: "var(--vintage-gold)", border: "1px solid rgba(184,151,59,0.3)" }}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span className="sr-only">Página anterior</span>
        </span>
      ) : (
        <Link
          href={pageHref(basePath, pageParam, currentPage - 1)}
          scroll={false}
          rel="prev"
          aria-label="Página anterior"
          className={`${baseItem} hover:bg-[var(--vintage-gold)] hover:text-white`}
          style={{ color: "var(--vintage-gold)", border: "1px solid rgba(184,151,59,0.4)" }}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </Link>
      )}

      {/* Números */}
      {pages.map((p, i) =>
        p === -1 ? (
          <span key={`gap-${i}`} className="px-1 text-sm select-none" style={{ color: "rgba(184,151,59,0.5)" }}>
            …
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className={`${baseItem} text-white`}
            style={{ backgroundColor: "var(--vintage-gold)", border: "1px solid var(--vintage-gold)" }}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(basePath, pageParam, p)}
            scroll={false}
            aria-label={`Ir a la página ${p}`}
            className={`${baseItem} hover:bg-[var(--vintage-gold)] hover:text-white`}
            style={{ color: "var(--vintage-gold)", border: "1px solid rgba(184,151,59,0.3)" }}
          >
            {p}
          </Link>
        )
      )}

      {/* Siguiente */}
      {nextDisabled ? (
        <span
          aria-disabled="true"
          className={`${baseItem} opacity-30 cursor-not-allowed`}
          style={{ color: "var(--vintage-gold)", border: "1px solid rgba(184,151,59,0.3)" }}
        >
          <ChevronRight size={16} aria-hidden="true" />
          <span className="sr-only">Página siguiente</span>
        </span>
      ) : (
        <Link
          href={pageHref(basePath, pageParam, currentPage + 1)}
          scroll={false}
          rel="next"
          aria-label="Página siguiente"
          className={`${baseItem} hover:bg-[var(--vintage-gold)] hover:text-white`}
          style={{ color: "var(--vintage-gold)", border: "1px solid rgba(184,151,59,0.4)" }}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      )}
    </nav>
  )
}
