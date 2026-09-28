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

export async function fromService<T>(
  path: string,
  parse: Parser<T>,
  fallback: T,
  opts: ServiceOptions = {}
): Promise<Content<T>> {
  const { data, error, status } = await backendFetch<unknown>(path, { revalidate: opts.revalidate })
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
