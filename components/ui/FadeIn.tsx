"use client"

import { m, useReducedMotion } from "framer-motion"

/**
 * Fade-in de entrada (solo al montar). Se usa en la home para enmascarar la
 * carga del hero/poster. No se aplica globalmente para no animar cada navegación.
 */
export function FadeIn({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <m.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {children}
    </m.div>
  )
}
