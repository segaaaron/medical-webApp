import { describe, expect, it } from "vitest"
import { down, serve } from "./setup"
import { getFooter } from "@/lib/content/footer"
import { FOOTER_FALLBACK, FOOTER_TREATMENT_LINKS_FALLBACK } from "@/lib/content/fallback/footer"

const FOOTER = { doctorName: "Dra. Panel", specialty: "Esp", officeLinks: [{ label: "Blog", href: "/blog" }] }

const names = Array.from({ length: 13 }, (_, i) => `Tratamiento ${i + 1}`)
const treatments = [
  { id: "botox", slug: "toxina-botulinica", name: "Toxina Botulínica", seoTitle: "Botox" },
  ...names.map((name, i) => ({ id: `t${i}`, slug: `t-${i}`, name })),
]

describe("footer", () => {
  it("given tratamientos activos, then todos (sin tope de 10) en dos columnas parejas", async () => {
    serve("/footer", FOOTER)
    serve("/treatments", treatments)
    const f = await getFooter()
    const all = [...f.facialTreatments, ...f.bodyTreatments]
    expect(all).toHaveLength(14)
    expect(Math.abs(f.facialTreatments.length - f.bodyTreatments.length)).toBeLessThanOrEqual(1)
    expect(all.map((l) => l.href)).toContain("/tratamientos/t-12")
  })

  it("given seoTitle «Botox», then el footer pinta el nombre del panel", async () => {
    serve("/footer", FOOTER)
    serve("/treatments", treatments)
    const f = await getFooter()
    const labels = [...f.facialTreatments, ...f.bodyTreatments].map((l) => l.label)
    expect(labels).toContain("Toxina Botulínica")
    expect(labels.some((l) => /botox/i.test(l))).toBe(false)
  })

  it("given servicio de tratamientos caído, then un solo «Ver tratamientos»", async () => {
    serve("/footer", FOOTER)
    down("/treatments", "500")
    const f = await getFooter()
    expect([...f.facialTreatments, ...f.bodyTreatments]).toEqual(FOOTER_TREATMENT_LINKS_FALLBACK)
    expect(f.doctorName).toBe("Dra. Panel")
  })

  it("given /footer con campos vacíos, then vacíos (sin textos del respaldo)", async () => {
    serve("/footer", { doctorName: "", specialty: "", description: "", copyrightText: "", officeLinks: [] })
    serve("/treatments", [])
    const f = await getFooter()
    expect(f).toMatchObject({ doctorName: "", specialty: "", description: "", copyrightText: "", officeLinks: [] })
    expect(f.facialTreatments).toEqual([])
    expect(f.bodyTreatments).toEqual([])
  })

  it.each(["500", "network", "204"] as const)("given todo caído (%s), then respaldo entero", async (mode) => {
    down("/footer", mode)
    down("/treatments", mode)
    expect(await getFooter()).toEqual({
      ...FOOTER_FALLBACK,
      facialTreatments: FOOTER_TREATMENT_LINKS_FALLBACK,
      bodyTreatments: [],
    })
  })

  it("given /footer con forma inválida, then respaldo entero del footer", async () => {
    serve("/footer", "no soy un objeto")
    serve("/treatments", [])
    const f = await getFooter()
    expect({ ...f, facialTreatments: [], bodyTreatments: [] }).toEqual(FOOTER_FALLBACK)
  })
})
