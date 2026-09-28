import { describe, expect, it } from "vitest"
import { buildMetaDescription } from "@/lib/seo/meta"

describe("buildMetaDescription", () => {
  it("given entidades HTML, then las decodifica y no quedan literales", () => {
    const d = buildMetaDescription("<p>Botox&nbsp;en&nbsp;Cochabamba &amp; m&aacute;s &#8212; &#x2013; &laquo;hola&raquo;</p>", "")
    expect(d).toBe("Botox en Cochabamba & más — – «hola»")
    expect(d).not.toMatch(/&[a-z#0-9]+;/i)
  })

  it("given &amp;nbsp;, then decodifica una sola vez", () => {
    expect(buildMetaDescription("a &amp;nbsp; b", "")).toBe("a &nbsp; b")
  })

  it("given firma y numeración al inicio, then las omite", () => {
    const html = "<p>Por: Dra. Yasmin Medrano Avila</p><p>1. Qué es el botox</p>"
    expect(buildMetaDescription(html, "")).toBe("Qué es el botox")
  })

  it("given texto largo, then ≤155 caracteres, corte en palabra y «…»", () => {
    const d = buildMetaDescription("palabra ".repeat(60), "")
    expect(d.length).toBeLessThanOrEqual(155)
    expect(d.endsWith("palabra…")).toBe(true)
  })

  it("given sufijo, then el total no pasa de 155", () => {
    const suffix = " | Dra. Yasmin Medrano, medicina estética en Cochabamba."
    const d = buildMetaDescription("texto&nbsp;largo ".repeat(30), suffix)
    expect(d.length).toBeLessThanOrEqual(155)
    expect(d.endsWith(suffix)).toBe(true)
  })

  it("given texto vacío, then solo el sufijo", () => {
    expect(buildMetaDescription("", " Sufijo.")).toBe("Sufijo.")
  })
})

describe("buildMetaDescription — rótulos iniciales", () => {
  it("given firma, credencial y títulos cortos, then empieza en la primera frase", () => {
    const html =
      "<p><strong>Por: Dra. Y</strong> · Agosto</p><p>Médica Especialista en Medicina Estética</p>" +
      "<h2>MESOTERAPIA NCTF</h2><p>&nbsp;</p><h2>Introducción</h2><p>La mesoterapia es un procedimiento.</p>"
    expect(buildMetaDescription(html, "")).toBe("La mesoterapia es un procedimiento.")
  })

  it("given solo rótulos, then los conserva", () => {
    expect(buildMetaDescription("<h2>Título</h2><p>Subtítulo</p>", "")).toBe("Título Subtítulo")
  })
})
