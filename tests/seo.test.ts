import { describe, expect, it } from "vitest"
import { down, serve } from "./setup"
import { getAbout, statsClaim } from "@/lib/content/about"
import { openingHoursFrom, parseHoursRange, toE164 } from "@/lib/seo/local"
import { generateMetadata } from "@/app/tratamientos/[slug]/page"

const T = { id: "t1", slug: "toxina-botulinica", name: "TOXINA BOTULÍNICA", description: "Relaja la musculatura." }
const params = Promise.resolve({ slug: "toxina-botulinica" })

describe("metadata del tratamiento", () => {
  it("given seoTitle, then el título lo usa", async () => {
    const t = { ...T, seoTitle: "Botox" }
    serve("/treatments", [t])
    serve("/treatments/t1", t)
    serve("/blog", [])
    expect((await generateMetadata({ params })).title).toBe("Botox en Cochabamba")
  })

  it("given seoTitle vacío, then el nombre del panel sin el grito", async () => {
    const t = { ...T, seoTitle: "" }
    serve("/treatments", [t])
    serve("/treatments/t1", t)
    serve("/blog", [])
    expect((await generateMetadata({ params })).title).toBe("Toxina Botulínica en Cochabamba")
  })
})

describe("statsClaim", () => {
  it("given pares completos e incompletos, then cita solo los completos", async () => {
    serve("/about", {
      stat1Value: "12+", stat1Label: "Años de Experiencia",
      stat2Value: "1000", stat2Label: "Pacientes Atendidos",
      stat3Value: "", stat3Label: "Tratamientos",
    })
    const { data } = await getAbout()
    expect(statsClaim(data.stats)).toBe("12+ años de experiencia y 1000 pacientes atendidos")
  })

  it("given una etiqueta sin valor, then se omite", async () => {
    serve("/about", { stat1Value: "12+", stat1Label: "", stat2Value: "1000", stat2Label: "Pacientes" })
    expect(statsClaim((await getAbout()).data.stats)).toBe("1000 pacientes")
  })

  it("given servicio caído, then vacío", async () => {
    down("/about", "404")
    expect(statsClaim((await getAbout()).data.stats)).toBe("")
  })
})

describe("horario del schema", () => {
  it("given «9:00 AM – 7:00 PM - A Coordinar», then 09:00–19:00", () => {
    expect(parseHoursRange("9:00 AM – 7:00 PM - A Coordinar")).toEqual({ opens: "09:00", closes: "19:00" })
  })

  it("given «Cerrado», then null", () => {
    expect(parseHoursRange("Cerrado")).toBeNull()
  })

  it("given los tres campos, then sábado 08:30–12:00 y domingo cerrado omitido", () => {
    const spec = openingHoursFrom({ weekdays: "9:00 AM – 7:00 PM - A Coordinar", saturday: "8:30 - 12:00", sunday: "Cerrado" })
    expect(spec).toEqual([
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "19:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "08:30", closes: "12:00" },
    ])
  })

  it("toE164 normaliza y descarta lo que no es teléfono", () => {
    expect(toE164("+591 78751894")).toBe("+59178751894")
    expect(toE164("")).toBe("")
    expect(toE164("123")).toBe("")
  })
})
