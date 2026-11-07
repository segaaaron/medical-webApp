"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * Consentimiento para los píxeles publicitarios.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * QUÉ PROBLEMA RESUELVE
 *
 * El sitio carga Meta Pixel, TikTok Pixel y Google Ads en todas las páginas,
 * incluidas las de tratamiento. La URL sola ya dice qué procedimiento médico
 * está mirando una persona identificable —
 * `/tratamientos/hiperhidrosis---tratamiento-para-sudoracion-excesiva-con-toxina-botulinica`
 * es un dato de salud—. Las Condiciones de las Herramientas Empresariales de
 * Meta prohíben enviarles información de salud.
 *
 * Bolivia no tiene una norma equivalente al RGPD que obligue a pedir
 * consentimiento, pero las condiciones de las propias plataformas sí aplican,
 * y en una web médica el listón razonable es más alto que el mínimo legal.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * QUÉ NO PIDE PERMISO
 *
 * Umami. Es analítica propia, alojada en el mismo servidor, sin cookies y sin
 * enviar nada a terceros: es medición interna, no seguimiento publicitario.
 * Sigue funcionando siempre, así que el consultorio nunca se queda a ciegas
 * aunque nadie acepte.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ `useSyncExternalStore` Y NO `useState` + `useEffect`
 *
 * El valor vive fuera de React (en `localStorage`) y el servidor no puede
 * conocerlo. Leerlo con un efecto obligaría a un `setState` dentro del efecto
 * —un render de más, y lo prohíbe `react-hooks/set-state-in-effect`—. Es el
 * mismo patrón con el que este proyecto resuelve las media queries y el «¿ya
 * estamos en el cliente?» en `components/sections/HeroLayout.tsx`.
 *
 * El `snapshot` se cachea en `memoria` porque React llama a `getSnapshot` en
 * cada render y debe devolver un valor estable: leer `localStorage` ahí
 * directamente crearía trabajo en el camino caliente.
 */

export const CLAVE = "ym_consent_ads"
export const ACEPTADO = "1"
export const RECHAZADO = "0"

export type Consentimiento = "pendiente" | "aceptado" | "rechazado"

let memoria: Consentimiento | null = null
const oyentes = new Set<() => void>()

function leerAlmacenamiento(): Consentimiento {
  try {
    const v = window.localStorage.getItem(CLAVE)
    if (v === ACEPTADO) return "aceptado"
    if (v === RECHAZADO) return "rechazado"
    return "pendiente"
  } catch {
    // Almacenamiento bloqueado (ventana privada, datos de sitio
    // deshabilitados): se trata como «aún no ha decidido», que no activa
    // ningún píxel. Ante la duda, no se rastrea.
    return "pendiente"
  }
}

/**
 * Estado actual del consentimiento.
 *
 * Exportado —además de alimentar el hook— para poder probar la lógica sin
 * montar React: el fallo que importa aquí («ante la duda, no se rastrea») vive
 * en estas funciones, no en el render.
 */
export function getSnapshot(): Consentimiento {
  if (memoria === null) memoria = leerAlmacenamiento()
  return memoria
}

/** En el servidor nunca hay consentimiento: no se pinta el aviso ni se carga nada. */
function getServerSnapshot(): Consentimiento {
  return "pendiente"
}

function subscribe(cb: () => void): () => void {
  oyentes.add(cb)
  return () => {
    oyentes.delete(cb)
  }
}

export function fijar(valor: Consentimiento, guardado: string): void {
  try {
    window.localStorage.setItem(CLAVE, guardado)
  } catch {
    // Si no se puede recordar la decisión, se respeta durante esta visita y se
    // volverá a preguntar en la siguiente. Es el fallo correcto: molesta un
    // poco, pero nunca rastrea a quien dijo que no.
  }
  memoria = valor
  for (const cb of oyentes) cb()
}

export function useTrackingConsent() {
  const estado = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const aceptar = useCallback(() => fijar("aceptado", ACEPTADO), [])
  const rechazar = useCallback(() => fijar("rechazado", RECHAZADO), [])

  return {
    estado,
    aceptado: estado === "aceptado",
    debePreguntar: estado === "pendiente",
    aceptar,
    rechazar,
  }
}

/** Solo para pruebas: olvida el valor cacheado y vuelve a leer del almacenamiento. */
export function _resetParaPruebas(): void {
  memoria = null
  oyentes.clear()
}
