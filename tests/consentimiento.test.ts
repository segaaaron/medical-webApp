import { afterEach, describe, expect, it, vi } from "vitest"

/**
 * El consentimiento publicitario.
 *
 * La invariante que protege: **ante la duda, no se rastrea**. Si la lectura
 * del almacenamiento falla, el estado seguro es «pendiente», que NO carga
 * ningún píxel. Un fallo al revés —cargar Meta, TikTok y Google en una página
 * de tratamiento sin permiso— es el problema que este archivo existe para
 * evitar.
 */

function almacenamientoFalso({ bloqueado = false, inicial = {} as Record<string, string> } = {}) {
  const datos: Record<string, string> = { ...inicial }
  return {
    getItem(k: string) {
      if (bloqueado) throw new Error("acceso denegado")
      return k in datos ? datos[k] : null
    },
    setItem(k: string, v: string) {
      if (bloqueado) throw new Error("acceso denegado")
      datos[k] = v
    },
    datos,
  }
}

async function cargar(storage: ReturnType<typeof almacenamientoFalso>) {
  vi.stubGlobal("window", { localStorage: storage } as unknown as Window & typeof globalThis)
  vi.resetModules()
  const mod = await import("@/components/analytics/useTrackingConsent")
  mod._resetParaPruebas()
  return mod
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe("estado inicial", () => {
  it("sin decisión previa queda pendiente, así que no se rastrea", async () => {
    const s = almacenamientoFalso()
    const { getSnapshot } = await cargar(s)
    expect(getSnapshot()).toBe("pendiente")
  })

  it("recuerda una aceptación anterior", async () => {
    const s = almacenamientoFalso({ inicial: { ym_consent_ads: "1" } })
    const { getSnapshot } = await cargar(s)
    expect(getSnapshot()).toBe("aceptado")
  })

  it("recuerda un rechazo anterior", async () => {
    const s = almacenamientoFalso({ inicial: { ym_consent_ads: "0" } })
    const { getSnapshot } = await cargar(s)
    expect(getSnapshot()).toBe("rechazado")
  })

  it("un valor corrupto se trata como pendiente, no como aceptado", async () => {
    const s = almacenamientoFalso({ inicial: { ym_consent_ads: "sí claro" } })
    const { getSnapshot } = await cargar(s)
    expect(getSnapshot()).toBe("pendiente")
  })
})

describe("falla seguro", () => {
  it("si el almacenamiento está bloqueado, queda pendiente y no lanza", async () => {
    const s = almacenamientoFalso({ bloqueado: true })
    const { getSnapshot } = await cargar(s)
    expect(() => getSnapshot()).not.toThrow()
    expect(getSnapshot()).toBe("pendiente")
  })

  it("guardar con el almacenamiento bloqueado no lanza y respeta la decisión en esta visita", async () => {
    const s = almacenamientoFalso({ bloqueado: true })
    const { fijar, getSnapshot, RECHAZADO } = await cargar(s)
    expect(() => fijar("rechazado", RECHAZADO)).not.toThrow()
    expect(getSnapshot()).toBe("rechazado")
  })
})

describe("guardar la decisión", () => {
  it("aceptar persiste y se refleja", async () => {
    const s = almacenamientoFalso()
    const { fijar, getSnapshot, ACEPTADO, CLAVE } = await cargar(s)
    fijar("aceptado", ACEPTADO)
    expect(getSnapshot()).toBe("aceptado")
    expect(s.datos[CLAVE]).toBe("1")
  })

  it("rechazar persiste y se refleja", async () => {
    const s = almacenamientoFalso()
    const { fijar, getSnapshot, RECHAZADO, CLAVE } = await cargar(s)
    fijar("rechazado", RECHAZADO)
    expect(getSnapshot()).toBe("rechazado")
    expect(s.datos[CLAVE]).toBe("0")
  })
})
