import { describe, expect, it } from "vitest"
import { seoTitleFor, readsAsTreatment } from "@/lib/seo/treatment-names"
import { pageTitle, absoluteUrl, absoluteUrls } from "@/lib/seo/meta"
import { treatmentFaqs, faqPageLd } from "@/lib/seo/faq"
import { mensajeSegunRuta } from "@/components/ui/WhatsAppFAB"

const BASE = "https://yasminmedrano.com"

/**
 * Lo que estas pruebas protegen son fallos que YA estuvieron en producción y
 * que nadie vio desde el navegador. Todos se detectaron midiendo el HTML
 * servido, no revisando el código.
 */

describe("seoTitleFor: la ciudad la pone la plantilla, no el panel", () => {
  it("quita «en Cochabamba» del seoTitle del panel", () => {
    // El caso real: la ficha de glúteos servía
    // «… en Cochabamba en Cochabamba | Dra. …» (90 caracteres).
    const t = {
      name: "AUMENTO DE GLÚTEOS",
      seoTitle: "Aumento de Glúteos con Hialurónico en Cochabamba",
    }
    expect(seoTitleFor(t)).toBe("Aumento de Glúteos con Hialurónico")
  })

  it("quita también «en Bolivia» y tolera separadores", () => {
    expect(seoTitleFor({ name: "x", seoTitle: "Botox en Bolivia" })).toBe("Botox")
    expect(seoTitleFor({ name: "x", seoTitle: "Botox, en Cochabamba" })).toBe("Botox")
    expect(seoTitleFor({ name: "x", seoTitle: "Botox en Cochabamba, Bolivia" })).toBe("Botox")
  })

  it("no toca un nombre que contiene la ciudad en medio", () => {
    // «en Cochabamba» solo se quita al FINAL: en medio puede ser parte del
    // nombre real y recortarlo mutilaría el título.
    expect(seoTitleFor({ name: "x", seoTitle: "Curso en Cochabamba para médicos" })).toBe(
      "Curso en Cochabamba para médicos"
    )
  })

  it("sigue cayendo al nombre normalizado si no hay seoTitle", () => {
    expect(seoTitleFor({ name: 'TOXINA BOTULÍNICA "BOTOX"', seoTitle: "" })).toBe(
      "Toxina Botulínica BOTOX"
    )
  })

  it("no devuelve cadena vacía si el seoTitle era SOLO la ciudad", () => {
    // Si alguien escribe «en Cochabamba» a secas, quitarlo dejaría el título
    // sin nombre de tratamiento: debe caer al nombre del panel.
    expect(seoTitleFor({ name: "Peeling Químico", seoTitle: "en Cochabamba" })).toBe(
      "Peeling Químico"
    )
  })
})

describe("pageTitle: la marca solo si cabe en los ~60 visibles", () => {
  it("añade la marca cuando el total cabe", () => {
    // 15 + 28 = 43.
    expect(pageTitle("Botox en Cochabamba").absolute).toBe(
      "Botox en Cochabamba | Dra. Yasmin Medrano Avila"
    )
  })

  it("la omite cuando no cabe, en vez de dejar que se corte", () => {
    const largo = "Skinbooster — Hidratación Profunda Inyectable en Cochabamba"
    const out = pageTitle(largo).absolute
    expect(out).toBe(largo)
    expect(out).not.toContain("Dra. Yasmin")
  })

  it("nunca devuelve más de 60 caracteres con marca", () => {
    for (const t of [
      "Botox en Cochabamba",
      "Tratamiento de Ojeras en Cochabamba",
      "Perfilado de Mandíbula y Mentón en Cochabamba",
    ]) {
      const out = pageTitle(t).absolute
      if (out.includes("Dra. Yasmin")) expect(out.length).toBeLessThanOrEqual(60)
    }
  })
})

describe("absoluteUrl: schema.org descarta las rutas relativas en silencio", () => {
  it("convierte la ruta del panel en absoluta", () => {
    expect(absoluteUrl("/api/uploads/foto.webp", BASE)).toBe(
      "https://yasminmedrano.com/api/uploads/foto.webp"
    )
  })

  it("deja intacta una URL ya absoluta", () => {
    expect(absoluteUrl("https://cdn.test/a.webp", BASE)).toBe("https://cdn.test/a.webp")
  })

  it("no duplica la barra", () => {
    expect(absoluteUrl("/a.webp", "https://yasminmedrano.com/")).toBe(
      "https://yasminmedrano.com/a.webp"
    )
  })

  it("descarta lo que no es una dirección pública", () => {
    expect(absoluteUrl("data:image/png;base64,AAA", BASE)).toBe("")
    expect(absoluteUrl("", BASE)).toBe("")
    expect(absoluteUrl(null, BASE)).toBe("")
    expect(absoluteUrl(undefined, BASE)).toBe("")
  })

  it("absoluteUrls quita vacíos y repetidos", () => {
    expect(absoluteUrls(["/a.webp", "", null, "/a.webp", "/b.webp"], BASE)).toEqual([
      "https://yasminmedrano.com/a.webp",
      "https://yasminmedrano.com/b.webp",
    ])
  })
})

describe("treatmentFaqs: visible, honesto y derivado del panel", () => {
  const ojeras = {
    name: "Tratamiento de Ojeras",
    description:
      "Indicado para ojeras y surco lagrimal. Mejora el contorno de ojos con ácido hialurónico.",
    seoTitle: "",
    price: 0,
  }

  it("no construye «el tratamiento de Tratamiento de Ojeras»", () => {
    // Era literalmente lo que servía el JSON-LD de esa ficha.
    const faqs = treatmentFaqs(ojeras, { seoName: "Tratamiento de Ojeras" })
    const texto = faqs.map((f) => `${f.question} ${f.answer}`).join(" ")
    expect(texto).not.toMatch(/tratamiento de Tratamiento/i)
  })

  it("prefija «el tratamiento de» cuando el nombre NO empieza por tratamiento", () => {
    const faqs = treatmentFaqs(
      { ...ojeras, name: "Botox", description: "Indicado para arrugas en la frente." },
      { seoName: "Botox" }
    )
    const texto = faqs.map((f) => f.answer).join(" ")
    expect(texto).toMatch(/el tratamiento de Botox/)
  })

  it("nunca promete seguridad absoluta y sí menciona contraindicaciones", () => {
    const faqs = treatmentFaqs(ojeras, { seoName: "Tratamiento de Ojeras" })
    const texto = faqs.map((f) => `${f.question} ${f.answer}`).join(" ").toLowerCase()
    // La ficha de ácido hialurónico decía «reversible y completamente seguro».
    expect(texto).not.toContain("completamente seguro")
    expect(texto).not.toContain("totalmente seguro")
    expect(texto).not.toContain("sin riesgo")
    expect(texto).not.toContain("100% seguro")
    // Y sí debe decir lo que es verdad.
    expect(texto).toContain("contraindicaciones")
  })

  it("responde el precio con la cifra del panel cuando existe", () => {
    const faqs = treatmentFaqs({ ...ojeras, price: 1500 }, {
      seoName: "Tratamiento de Ojeras",
      price: 1500,
    })
    expect(faqs[0].question).toMatch(/cuánto cuesta/i)
    expect(faqs[0].answer).toContain("Bs. 1.500")
  })

  it("sin precio no se lo inventa, y da el canal de contacto", () => {
    const faqs = treatmentFaqs(ojeras, {
      seoName: "Tratamiento de Ojeras",
      phone: "+59178751894",
    })
    expect(faqs[0].answer).not.toMatch(/Bs\. ?0/)
    expect(faqs[0].answer).toContain("+591 7875 1894")
  })

  it("deriva las ZONAS del texto del panel, sin tabla escrita a mano", () => {
    // «ojeras» y «contorno de ojos» están en el vocabulario como ZONAS
    // (lib/seo/vocabulary.ts), así que esta ficha gana la pregunta de zonas.
    const faqs = treatmentFaqs(ojeras, { seoName: "Tratamiento de Ojeras" })
    const preguntas = faqs.map((f) => f.question).join(" ")
    expect(preguntas).toMatch(/en qué zonas/i)
    expect(faqs.map((f) => f.answer).join(" ")).toMatch(/ojeras/i)
  })

  it("deriva los MOTIVOS cuando la descripción nombra un problema", () => {
    // «arrugas» y «flacidez» sí son motivos de consulta, no zonas.
    const faqs = treatmentFaqs(
      {
        name: "Botox",
        description: "Indicado para arrugas y líneas de expresión en la frente.",
        seoTitle: "",
        price: 0,
      },
      { seoName: "Botox" }
    )
    const preguntas = faqs.map((f) => f.question).join(" ")
    expect(preguntas).toMatch(/para qué sirve/i)
    expect(faqs.map((f) => f.answer).join(" ")).toMatch(/arrugas/i)
  })

  it("omite zonas y motivos si la descripción no los menciona", () => {
    const vacio = { name: "Consulta", description: "", seoTitle: "", price: 0 }
    const faqs = treatmentFaqs(vacio, { seoName: "Consulta" })
    const preguntas = faqs.map((f) => f.question).join(" ")
    // Sin datos no se inventa una zona: solo quedan precio, seguridad y dónde.
    expect(preguntas).not.toMatch(/en qué zonas/i)
    expect(faqs).toHaveLength(3)
  })

  it("siempre responde dónde, con el área metropolitana", () => {
    const faqs = treatmentFaqs(ojeras, { seoName: "Tratamiento de Ojeras" })
    const donde = faqs.find((f) => /dónde/i.test(f.question))
    expect(donde).toBeDefined()
    expect(donde!.answer).toContain("Quillacollo")
  })
})

describe("faqPageLd: el schema sale del MISMO array que se pinta", () => {
  it("convierte cada par en Question/Answer", () => {
    const faqs = [{ question: "¿A?", answer: "B" }]
    const ld = faqPageLd(faqs)
    expect(ld["@type"]).toBe("FAQPage")
    expect(ld.mainEntity).toHaveLength(1)
    expect(ld.mainEntity[0]).toMatchObject({
      "@type": "Question",
      name: "¿A?",
      acceptedAnswer: { "@type": "Answer", text: "B" },
    })
  })

  it("toda pregunta del schema existe en el array visible", () => {
    // Esta es LA invariante del archivo: marcado invisible fue el fallo
    // original. Si alguien vuelve a generar el schema por separado, esto rompe.
    const faqs = treatmentFaqs(
      { name: "Botox", description: "Indicado para arrugas.", seoTitle: "", price: 0 },
      { seoName: "Botox" }
    )
    const ld = faqPageLd(faqs)
    const visibles = new Set(faqs.map((f) => f.question))
    for (const entry of ld.mainEntity) {
      expect(visibles.has(entry.name)).toBe(true)
    }
    expect(ld.mainEntity).toHaveLength(faqs.length)
  })
})

describe("readsAsTreatment", () => {
  it("reconoce los nombres que ya se nombran como tratamiento", () => {
    expect(readsAsTreatment("Tratamiento de Ojeras")).toBe(true)
    expect(readsAsTreatment("terapia con ozono")).toBe(true)
    expect(readsAsTreatment("Botox")).toBe(false)
    expect(readsAsTreatment("Ácido Hialurónico")).toBe(false)
  })
})

describe("mensajeSegunRuta: el botón flotante nombra el tratamiento", () => {
  it("en una ficha, nombra el tratamiento", () => {
    expect(mensajeSegunRuta("/tratamientos/rinomodelacion-con-hialuronico")).toContain(
      "Rinomodelacion con hialuronico"
    )
  })

  it("colapsa los separadores largos de los slugs con ---", () => {
    const out = mensajeSegunRuta("/tratamientos/nctf-135-ha---oro-rosa")
    expect(out).toContain("Nctf 135 ha oro rosa")
    expect(out).not.toMatch(/\s{2,}/)
  })

  it("fuera de una ficha usa el mensaje genérico", () => {
    for (const ruta of ["/", "/tratamientos", "/blog/algo", "/contacto", null]) {
      expect(mensajeSegunRuta(ruta)).toBe(
        "Hola, me gustaría más información sobre sus tratamientos."
      )
    }
  })

  it("no se rompe con una ruta de ficha vacía o rara", () => {
    expect(mensajeSegunRuta("/tratamientos/-")).toBe(
      "Hola, me gustaría más información sobre sus tratamientos."
    )
    expect(mensajeSegunRuta("/tratamientos/x/y")).toBe(
      "Hola, me gustaría más información sobre sus tratamientos."
    )
  })
})
