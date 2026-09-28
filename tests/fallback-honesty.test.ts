/// <reference types="vite/client" />
/**
 * Un respaldo solo entra cuando el panel no responde: no puede afirmar
 * servicios que el consultorio no presta ni cifras que nadie ha verificado.
 */
import { describe, expect, it } from "vitest"
import { strings } from "./setup"

const modules = import.meta.glob("../lib/content/fallback/*.ts", { eager: true }) as Record<string, Record<string, unknown>>

const BANNED_SERVICE = /manchas|estr[ií]as|celulitis|depilaci[oó]n|reducci[oó]n de medidas|armonizaci[oó]n|corporal|hidrataci[oó]n profunda/i
const BANNED_STAT = [/\b\d[\d.,]*\s*\+?\s*(a[nñ]os|pacientes)/i, /\+\s*\d/]
// Teléfonos y URLs no son afirmaciones («+591 78751894»).
const NOT_A_CLAIM = /^(\+?[\d\s()-]+|https?:\/\/\S+)$/

const entries = Object.entries(modules).flatMap(([file, mod]) =>
  Object.entries(mod).map(([name, value]) => [`${file.split("/").pop()}:${name}`, value] as const)
)

describe("honestidad de los respaldos", () => {
  it("hay respaldos que revisar", () => expect(entries.length).toBeGreaterThan(5))

  it.each(entries)("%s no afirma servicios ni cifras inventadas", (_name, value) => {
    const offending = strings(value)
      .filter((s) => !NOT_A_CLAIM.test(s.trim()))
      .flatMap((s) =>
        [BANNED_SERVICE, ...BANNED_STAT]
          .map((re) => s.match(re)?.[0])
          .filter((m): m is string => Boolean(m))
      )
    expect(offending).toEqual([])
  })
})
