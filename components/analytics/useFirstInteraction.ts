"use client"

import { useEffect, useState } from "react"

/**
 * ¿Ya interactuó la visitante con la página?
 *
 * ────────────────────────────────────────────────────────────────────────────
 * PARA QUÉ
 *
 * Los tres píxeles publicitarios (Meta, TikTok, Google Ads) suman ~472 KB de
 * JavaScript y cuatro tareas largas de más de 50 ms en la carga de cada página.
 * Medido: gtag 160 KB, TikTok 156 KB y `fbevents` una tarea larga de 66 ms, con
 * un TTI simulado de 8,7 s.
 *
 * Ninguno de los tres hace falta para pintar la página. Esperar al primer
 * gesto los saca de la ruta crítica sin perder medición, porque los eventos de
 * conversión que ocurren antes se encolan (ver `lib/analytics.ts`).
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ TAMBIÉN HAY UN RESPALDO POR TIEMPO
 *
 * Una visitante puede leer la página entera sin tocarla —en escritorio, sin
 * mover el ratón ni hacer scroll— y luego irse. Sin respaldo, esa visita no se
 * contaría nunca en los píxeles y la vista de página se perdería. El
 * temporizador garantiza que el `PageView` acabe saliendo.
 *
 * Los eventos se registran en `capture` y con `once`, así que el oyente se
 * desengancha solo y no vuelve a costar nada.
 */
export function useFirstInteraction(delayMs = 4000): boolean {
  const [interactuado, setInteractuado] = useState(false)

  useEffect(() => {
    if (interactuado) return

    const disparar = () => setInteractuado(true)

    // `pointerdown` cubre ratón, dedo y lápiz con un solo oyente.
    const eventos = ["pointerdown", "keydown", "scroll", "touchstart"] as const
    for (const e of eventos) {
      window.addEventListener(e, disparar, { once: true, passive: true, capture: true })
    }
    const t = setTimeout(disparar, delayMs)

    return () => {
      clearTimeout(t)
      for (const e of eventos) {
        window.removeEventListener(e, disparar, { capture: true })
      }
    }
  }, [interactuado, delayMs])

  return interactuado
}
