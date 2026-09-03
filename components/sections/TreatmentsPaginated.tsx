"use client"

import { useState, useTransition } from "react"
import { TreatmentsGrid, type Treatment } from "@/components/sections/TreatmentsGrid"
import { Pager } from "@/components/ui/Pager"

interface Props {
  initialTreatments: Treatment[]
  initialPage: number
  totalPages: number
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


  const pager = (
    <Pager
      page={page}
      totalPages={totalPages}
      onNavigate={goTo}
      pending={pending}
      label="tratamientos"
    />
  )

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
