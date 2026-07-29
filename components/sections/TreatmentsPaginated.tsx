"use client"

import { useState, useTransition } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TreatmentsGrid, type Treatment } from "@/components/sections/TreatmentsGrid"

interface Props {
  initialTreatments: Treatment[]
  initialPage: number
  totalPages: number
}

const baseItem =
  "inline-flex items-center justify-center min-w-[42px] h-[42px] px-3 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[var(--vintage-gold)] hover:text-[#1a0510] hover:border-[var(--vintage-gold)]"

// Botón inactivo / flechas — superficie glassy sutil sobre fondo oscuro
const idleStyle: React.CSSProperties = {
  color: "var(--vintage-gold-light, #D4B483)",
  backgroundColor: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(212,180,131,0.45)",
}
// Página activa — dorado sólido con glow
const activeStyle: React.CSSProperties = {
  color: "#1a0510",
  backgroundColor: "var(--vintage-gold)",
  border: "1px solid var(--vintage-gold)",
  boxShadow: "0 0 0 1px rgba(184,151,59,0.35), 0 6px 18px rgba(184,151,59,0.3)",
}

/** Devuelve la ventana de páginas con -1 como marcador de elipsis. */
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

/**
 * Paginación client-side del grid público: al cambiar de página solo se actualizan
 * las cards (fetch al proxy), sin re-renderizar Navbar/hero/footer ni saltar el scroll.
 * Sembrado con la página 1 renderizada en el servidor (SSR/SEO).
 */
export function TreatmentsPaginated({ initialTreatments, initialPage, totalPages }: Props) {
  const [treatments, setTreatments] = useState<Treatment[]>(initialTreatments)
  const [page, setPage] = useState(initialPage)
  const [pending, startTransition] = useTransition()

  async function goTo(next: number) {
    if (next === page || next < 1 || next > totalPages || pending) return
    try {
      const res = await fetch(`/api/treatments?active=true&page=${next}`)
      if (!res.ok) return
      const json = await res.json()
      const items: Treatment[] = Array.isArray(json) ? json : (json.data ?? [])
      startTransition(() => {
        setTreatments(items)
        setPage(next)
      })
      // URL compartible/SEO sin navegación de ruta (no re-renderiza el resto de la página)
      window.history.replaceState(null, "", next > 1 ? `/tratamientos?page=${next}` : "/tratamientos")
      // Sin scroll automático: el paginador está a la vista, cambiar de página en el
      // sitio mantiene el cursor sobre el botón (mejor UX que saltar al top).
    } catch {
      /* sin cambios si falla la red */
    }
  }

  const pages = pageWindow(page, totalPages)

  const pager =
    totalPages > 1 ? (
      <nav className="flex items-center justify-end gap-2 flex-wrap mt-8" aria-label="Paginación de tratamientos">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page <= 1 || pending}
          aria-label="Página anterior"
          className={baseItem}
          style={idleStyle}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        {pages.map((p, i) =>
          p === -1 ? (
            <span key={`gap-${i}`} className="px-1 text-sm select-none" style={{ color: "rgba(212,180,131,0.55)" }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p)}
              disabled={pending}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Ir a la página ${p}`}
              className={p === page ? baseItem.replace("hover:bg-[var(--vintage-gold)] hover:text-[#1a0510] hover:border-[var(--vintage-gold)]", "") : baseItem}
              style={p === page ? activeStyle : idleStyle}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages || pending}
          aria-label="Página siguiente"
          className={baseItem}
          style={idleStyle}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>
    ) : null

  return (
    <div style={{ opacity: pending ? 0.6 : 1, transition: "opacity 0.2s ease" }} aria-busy={pending}>
      <TreatmentsGrid
        treatments={treatments}
        isHome={false}
        pager={pager}
      />
    </div>
  )
}
