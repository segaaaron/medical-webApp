import { redirect } from "next/navigation"

/**
 * `/resena` — enlace corto para pedir reseñas en Google.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * PARA QUÉ
 *
 * La URL que Google da para dejar una reseña es impronunciable
 * (`g.page/r/CX...uEBM/review`). No se dicta al terminar una consulta, no cabe
 * en una tarjeta y nadie la teclea. Esta ruta la envuelve en algo que sí se
 * dice en voz alta —«entra a yasminmedrano.com/resena»— y que además cabe en un
 * QR pequeño y legible, para pegarlo en recepción o en la tarjeta de control.
 *
 * En el ranking local de 2026, la VELOCIDAD de reseñas —cuántas llegan este
 * mes— pesa más que el total acumulado. Pedirla en el momento de mayor
 * satisfacción, con un enlace que se recuerda, es lo que sostiene ese ritmo.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * CÓMO SE CONFIGURA
 *
 * `NEXT_PUBLIC_GOOGLE_REVIEW_URL` con el enlace que da la propia ficha
 * (Perfil de empresa → Pedir reseñas). Mientras no exista —la ficha aún no está
 * verificada—, el enlace NO se rompe: lleva al formulario de reseñas del propio
 * sitio, que ya funciona. Así el QR se puede imprimir hoy y seguir sirviendo
 * cuando la ficha esté lista, sin reimprimir nada.
 */

/** Respaldo: el flujo de reseñas propio del sitio. */
const FALLBACK = "/resenas/nueva"

/**
 * Enlace de la ficha de Google, validado.
 *
 * Esta ruta redirige a donde diga una variable de entorno, así que un valor mal
 * pegado —una ruta relativa, un `javascript:`, un dominio con una errata— se
 * convierte en una redirección desde nuestro dominio hacia cualquier parte, y
 * encima anunciada en material impreso. Se exige `https` y un dominio de
 * Google; si no encaja, se usa el formulario propio y no pasa nada.
 */
function destino(): string {
  const crudo = (process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ?? "").trim()
  if (!crudo) return FALLBACK
  try {
    const url = new URL(crudo)
    const dominioValido =
      url.protocol === "https:" &&
      /(^|\.)(google\.com|g\.page|goo\.gl|maps\.app\.goo\.gl)$/.test(url.hostname)
    return dominioValido ? url.toString() : FALLBACK
  } catch {
    return FALLBACK
  }
}

export function GET() {
  redirect(destino())
}
