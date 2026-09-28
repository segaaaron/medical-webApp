/**
 * Coerción de tipos para los parsers. Devuelven el VACÍO de cada tipo
 * (""/[]/0/null), nunca contenido de respaldo: un campo que el servicio no
 * trae se oculta en el sitio.
 */
import { resolveImageUrl } from "@/lib/backend-client"

export type Raw = Record<string, unknown>

/** Objeto plano, o `null` si no lo es. */
export function obj(v: unknown): Raw | null {
  if (v === null) return null
  if (typeof v !== "object") return null
  if (Array.isArray(v)) return null
  return v as Raw
}

/** Texto recortado, o "". */
export function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : ""
}

/** Array, o []. */
export function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

/** Número finito, o 0. Acepta números en texto (multipart). */
export function num(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  if (typeof v !== "string") return 0
  if (v.trim() === "") return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** Booleano, aceptando "true"/"false" de un multipart. */
export function bool(v: unknown): boolean {
  if (typeof v === "boolean") return v
  return typeof v === "string" ? v.trim().toLowerCase() === "true" : false
}

/**
 * Primer texto no vacío entre ALIAS DEL MISMO CAMPO del servicio (el backend
 * ha servido `imageUrl` e `image_url` según la versión). No es para mezclar
 * con respaldo: todos los argumentos deben venir del mismo `raw`.
 */
export function firstStr(...vals: unknown[]): string {
  for (const v of vals) {
    const s = str(v)
    if (s) return s
  }
  return ""
}

/** URL de imagen servible por el navegador, o "". */
export function image(v: unknown): string {
  return resolveImageUrl(str(v))
}

/**
 * Lista de una respuesta que puede venir suelta o paginada (`{data: []}`,
 * `{reviews: []}`). `null` si no es ninguna de esas formas.
 */
export function list(raw: unknown): unknown[] | null {
  if (Array.isArray(raw)) return raw
  const o = obj(raw)
  if (!o) return null
  if (Array.isArray(o.data)) return o.data
  if (Array.isArray(o.reviews)) return o.reviews
  return null
}

/** `value` de un registro de `/site-content/:key`, o `null`. */
export function siteContentValue(raw: unknown): Raw | null {
  const o = obj(raw)
  return o ? obj(o.value) : null
}
