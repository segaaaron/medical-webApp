import { afterAll, afterEach, beforeAll, vi } from "vitest"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

export const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
// `fromService` avisa una vez por forma inválida; en tests es ruido esperado.
vi.spyOn(console, "warn").mockImplementation(() => {})

const api = (path: string) => `${process.env.BACKEND_URL}/api${path}`

/** El backend responde `body` (JSON) en `path` (la query se ignora al emparejar). */
export function serve(path: string, body: unknown) {
  server.use(http.get(api(path), () => HttpResponse.json(body as never)))
}

export type Down = "500" | "network" | "204" | "404"

/** El backend falla en `path` del modo indicado. */
export function down(path: string, mode: Down) {
  server.use(
    http.get(api(path), () => {
      if (mode === "network") return HttpResponse.error()
      if (mode === "204") return new HttpResponse(null, { status: 204 })
      return HttpResponse.json({ error: "boom" }, { status: Number(mode) })
    })
  )
}

/** Todos los textos de un valor, recorrido en profundidad. */
export function strings(v: unknown): string[] {
  if (typeof v === "string") return [v]
  if (Array.isArray(v)) return v.flatMap(strings)
  if (v && typeof v === "object") return Object.values(v).flatMap(strings)
  return []
}

/** Ningún texto no vacío del respaldo aparece en la salida. */
export function leaked(output: unknown, fallback: unknown, allow: string[] = []): string[] {
  const fb = new Set(strings(fallback).filter((s) => s !== "" && !allow.includes(s)))
  return strings(output).filter((s) => fb.has(s))
}
