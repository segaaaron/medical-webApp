import { describe, expect, it } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "./setup"
import { fromService } from "@/lib/content/service"

/**
 * El reintento de `fromService`.
 *
 * Nace de un fallo real: Search Console registró dos errores 5xx el 15/9/26
 * sobre dos artículos del blog y los mantuvo fuera del índice casi dos meses.
 * La cadena era backend parpadea → `fallback` al primer fallo → el slug no
 * está en el respaldo → `app/blog/[slug]/page.tsx:132` lanza a propósito →
 * Googlebot ve un 500.
 *
 * Lo que estas pruebas fijan es la frontera: qué se reintenta, qué NO, y que
 * el camino feliz no paga nada por ello.
 */

const api = (path: string) => `${process.env.BACKEND_URL}/api${path}`
const parse = (raw: unknown) => (raw as { ok?: boolean })?.ok === true ? { ok: true } : null
const RESPALDO = { ok: false }

/** Responde `modo` la primera vez y JSON válido a partir de la segunda. */
function fallaUnaVezLuegoOk(path: string, modo: "network" | 500 | 503 | 404) {
  let llamadas = 0
  server.use(
    http.get(api(path), () => {
      llamadas++
      if (llamadas === 1) {
        if (modo === "network") return HttpResponse.error()
        return HttpResponse.json({ error: "boom" }, { status: modo })
      }
      return HttpResponse.json({ ok: true })
    })
  )
  return () => llamadas
}

describe("reintenta lo transitorio", () => {
  it("un fallo de red se reintenta y la página se salva", async () => {
    const veces = fallaUnaVezLuegoOk("/t1", "network")
    const out = await fromService("/t1", parse, RESPALDO)
    expect(veces()).toBe(2)
    // Lo importante: NO cae al respaldo, así que la página no lanza.
    expect(out.source).toBe("service")
    expect(out.data).toEqual({ ok: true })
  })

  it("un 500 del backend se reintenta", async () => {
    const veces = fallaUnaVezLuegoOk("/t2", 500)
    const out = await fromService("/t2", parse, RESPALDO)
    expect(veces()).toBe(2)
    expect(out.source).toBe("service")
  })

  it("un 503 del backend se reintenta", async () => {
    const veces = fallaUnaVezLuegoOk("/t3", 503)
    const out = await fromService("/t3", parse, RESPALDO)
    expect(veces()).toBe(2)
    expect(out.source).toBe("service")
  })
})

describe("NO reintenta lo que no es transitorio", () => {
  it("un 404 es una respuesta correcta: una sola llamada", async () => {
    const veces = fallaUnaVezLuegoOk("/t4", 404)
    const out = await fromService("/t4", parse, RESPALDO)
    // Si reintentara, la segunda llamada devolvería ok y daría "service".
    expect(veces()).toBe(1)
    expect(out.source).toBe("fallback")
  })

  it("un 401 tampoco: repetir daría lo mismo", async () => {
    let llamadas = 0
    server.use(
      http.get(api("/t5"), () => {
        llamadas++
        return HttpResponse.json({ error: "no" }, { status: 401 })
      })
    )
    const out = await fromService("/t5", parse, RESPALDO)
    expect(llamadas).toBe(1)
    expect(out.source).toBe("fallback")
  })

  it("una forma inválida no se reintenta: el servicio respondió bien", async () => {
    let llamadas = 0
    server.use(
      http.get(api("/t6"), () => {
        llamadas++
        return HttpResponse.json({ otra: "cosa" })
      })
    )
    const out = await fromService("/t6", parse, RESPALDO)
    expect(llamadas).toBe(1)
    expect(out.source).toBe("fallback")
    expect(out.data).toBe(RESPALDO)
  })
})

describe("el camino feliz no paga nada", () => {
  it("si responde a la primera, una sola llamada", async () => {
    let llamadas = 0
    server.use(
      http.get(api("/t7"), () => {
        llamadas++
        return HttpResponse.json({ ok: true })
      })
    )
    const out = await fromService("/t7", parse, RESPALDO)
    expect(llamadas).toBe(1)
    expect(out.source).toBe("service")
  })
})

describe("si el reintento también falla, se comporta como antes", () => {
  it("dos fallos seguidos caen al respaldo entero", async () => {
    let llamadas = 0
    server.use(
      http.get(api("/t8"), () => {
        llamadas++
        return HttpResponse.error()
      })
    )
    const out = await fromService("/t8", parse, RESPALDO)
    expect(llamadas).toBe(2)
    expect(out.source).toBe("fallback")
    // El respaldo entero, nunca mezclado: la regla del proyecto sigue en pie.
    expect(out.data).toBe(RESPALDO)
  })
})
