"use client"

import { useSyncExternalStore } from "react"
import { useReducedMotion } from "framer-motion"

const noopSubscribe = () => () => {}

/**
 * `useReducedMotion` de Framer ya vale `true` en el primer render del cliente,
 * pero el servidor siempre renderiza la versión animada. Si la preferencia
 * cambia NODOS o TEXTO (return null, ramas distintas), la hidratación falla
 * (#418) y React re-renderiza el árbol entero en el cliente. Este hook devuelve
 * `false` durante la hidratación y la preferencia real justo después.
 */
export function useReducedMotionSafe(): boolean {
  const reduced = useReducedMotion()
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  return hydrated && !!reduced
}
