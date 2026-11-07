/**
 * Puerta única entre el sitio público y el backend.
 *
 * REGLA (del CEO): si el servicio responde, el sitio usa SOLO lo que manda el
 * servicio —un campo vacío es un elemento oculto—. El contenido escrito en el
 * código es un respaldo ENTERO que solo entra cuando el servicio no está
 * disponible. Nunca se mezclan campo a campo.
 *
 * `fromService` lo garantiza por construcción: devuelve o el resultado del
 * parser (que no puede ver el respaldo: `lib/content/parse/**` tiene prohibido
 * importarlo, y también `||`, `??` y el spread) o el respaldo tal cual. No hay
 * un tercer camino donde uno rellene huecos del otro.
 *
 * Nada fuera de `lib/content/**`, `app/dashboard/**` y `app/api/**` puede
 * importar `@/lib/backend-client` (regla de ESLint): una página nueva no puede
 * inventarse su propia mezcla.
 */

import { backendFetch } from "@/lib/backend-client"

export type Content<T> =
  | { source: "service"; data: T }
  | { source: "fallback"; data: T }

/**
 * Convierte la respuesta cruda del servicio en el tipo del sitio. Pura: solo
 * coerciona tipos, sanea, resuelve URLs de imagen y normaliza mayúsculas.
 * Devuelve `null` (o lanza) si la forma no es la esperada → respaldo entero.
 */
export type Parser<T> = (raw: unknown) => T | null

export interface ServiceOptions {
  /** Segundos de ISR. Sin valor = `no-store`. */
  revalidate?: number
}

const warned = new Set<string>()

/** Una forma inválida se registra una vez por ruta, no en cada render. */
function warnOnce(path: string, detail: string): void {
  if (warned.has(path)) return
  warned.add(path)
  // `console` y no `logger`: esto corre también en el runtime edge (imágenes
  // OG), donde `process.stdout` no existe.
  console.warn(JSON.stringify({ level: "warn", event: "content.invalid_shape", path, detail }))
}

/**
 * ¿Merece la pena reintentar este fallo?
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EL PROBLEMA QUE RESUELVE
 *
 * Search Console registró dos errores 5xx el 15/9/26 sobre
 * `/blog/todo-sobre-la-toxina-botulinica-botox-…` y `/blog/que-es-la-medicina-estetica`,
 * y las mantuvo fuera del índice casi dos meses. Hoy las dos responden 200.
 *
 * La cadena era: el backend parpadea → `fromService` devuelve `fallback` al
 * primer fallo → el slug no está en el respaldo → `app/blog/[slug]/page.tsx:132`
 * lanza a propósito (para no cachear un 404 por ISR, que es peor) → Googlebot
 * ve un 500. Solo cayeron dos de once posts porque fueron los que tocó
 * rastrear en esa ventana.
 *
 * La decisión de lanzar es correcta y se queda. Lo que faltaba es que un
 * parpadeo de un segundo no llegara hasta ahí: el único reintento que existía
 * era el de refresco de token 401 (lib/backend-client.ts:256), nada para fallos
 * de red ni para 5xx.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * QUÉ SE REINTENTA Y QUÉ NO
 *
 * - `status: 0` → inalcanzable (DNS, conexión rechazada, timeout).
 * - `status >= 500` → el backend contestó, pero mal.
 * - CUALQUIER OTRA COSA NO. Un 404 es una respuesta correcta («esto no
 *   existe»), y reintentarla solo añade latencia y carga. Lo mismo un 401 o un
 *   400: repetir la misma petición dará lo mismo.
 */
function esTransitorio(status: number): boolean {
  // Escrito con dos `return` y no con `||` a propósito: la regla ESLint de
  // este archivo prohíbe los operadores lógicos para que nadie rellene huecos
  // del servicio con el respaldo. Aquí sería un booleano inocente, pero una
  // barrera que se desactiva «solo esta vez» deja de ser una barrera.
  if (status === 0) return true
  return status >= 500
}

/**
 * ¿El fallo fue lo bastante rápido como para que reintentar salga a cuenta?
 *
 * Una conexión rechazada falla en milisegundos: reintentar es casi gratis. Un
 * timeout agota los 10 s de `AbortSignal.timeout`, y reintentarlo dejaría la
 * página tardando 20 s — peor para la paciente y peor para Googlebot, que
 * abandonaría igualmente. Ante un backend colgado, fallar rápido es lo
 * correcto; el reintento es para el parpadeo, no para la caída.
 */
const UMBRAL_REINTENTO_MS = 2_000

export async function fromService<T>(
  path: string,
  parse: Parser<T>,
  fallback: T,
  opts: ServiceOptions = {}
): Promise<Content<T>> {
  const inicio = Date.now()
  let respuesta = await backendFetch<unknown>(path, { revalidate: opts.revalidate })

  // Un solo reintento, y solo si el fallo fue transitorio Y rápido. Uno, no
  // tres: ante un backend que ya va justo, una tormenta de reintentos desde
  // cada render es parte del problema, no del arreglo.
  if (
    respuesta.error !== null &&
    esTransitorio(respuesta.status) &&
    Date.now() - inicio < UMBRAL_REINTENTO_MS
  ) {
    await new Promise((r) => setTimeout(r, 250))
    respuesta = await backendFetch<unknown>(path, { revalidate: opts.revalidate })
    if (respuesta.error === null) {
      console.warn(
        JSON.stringify({
          level: "warn",
          event: "content.retry_ok",
          path,
          detail: "el backend falló y el reintento funcionó",
        })
      )
    }
  }

  const { data, error, status } = respuesta
  // Error, inalcanzable o 204 sin cuerpo = servicio no disponible.
  if (error !== null) return { source: "fallback", data: fallback }
  if (status === 204) return { source: "fallback", data: fallback }
  if (data === null) return { source: "fallback", data: fallback }
  if (data === undefined) return { source: "fallback", data: fallback }

  let parsed: T | null = null
  try {
    parsed = parse(data)
  } catch (err) {
    warnOnce(path, err instanceof Error ? err.message : String(err))
    return { source: "fallback", data: fallback }
  }
  if (parsed === null) {
    warnOnce(path, "parser returned null")
    return { source: "fallback", data: fallback }
  }
  return { source: "service", data: parsed }
}
