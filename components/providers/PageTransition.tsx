"use client"

import { m, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prefersReduced = useReducedMotion()

  if (prefersReduced) return <>{children}</>

  // Sin `exit`/AnimatePresence mode="wait": evita el hueco en blanco entre páginas
  // (ese era el "destello"). Solo un fade de entrada sutil de la nueva página.
  return (
    <m.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: "easeOut" }}>
      {children}
    </m.div>
  )
}
