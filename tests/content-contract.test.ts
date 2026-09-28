/**
 * Contrato servicio/respaldo de `lib/content/**`:
 * - el servicio responde → SOLO sus datos (vacío = vacío, sin texto del respaldo);
 * - error / inalcanzable / 204 / forma inválida → el respaldo ENTERO.
 */
import { describe, expect, it } from "vitest"
import { down, leaked, serve, type Down } from "./setup"
import { getHome } from "@/lib/content/home"
import { HOME_FALLBACK } from "@/lib/content/fallback/home"
import { getAbout } from "@/lib/content/about"
import { ABOUT_FALLBACK } from "@/lib/content/fallback/about"
import { getPromo } from "@/lib/content/promo"
import { PROMO_FALLBACK } from "@/lib/content/fallback/promo"
import { getContact, getWhatsApp } from "@/lib/content/contact"
import { CONTACT_FALLBACK, WHATSAPP_FALLBACK } from "@/lib/content/fallback/contact"
import { getActiveTreatments, getTreatmentBySlug, getTreatmentsGridPage } from "@/lib/content/treatments"
import { TREATMENTS_FALLBACK, TREATMENTS_PAGE_FALLBACK } from "@/lib/content/fallback/treatments"
import { getTreatmentsPageInfo } from "@/lib/content/treatments-page"
import { TREATMENTS_PAGE_INFO_FALLBACK } from "@/lib/content/fallback/treatments-page"
import { getPostBySlug, getPosts } from "@/lib/content/blog"
import { BLOG_FALLBACK } from "@/lib/content/fallback/blog"
import { getReviews } from "@/lib/content/reviews"
import { REVIEWS_FALLBACK } from "@/lib/content/fallback/reviews"
import { getNavLinks } from "@/lib/content/site-main"
import { NAV_LINKS_FALLBACK } from "@/lib/content/fallback/site-main"
import { getSiteSeo } from "@/lib/content/seo"
import { SEO_FALLBACK } from "@/lib/content/fallback/seo"

// Cada caso comprueba un tipo distinto; los checks son de forma, no de tipos.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Data = any

type Result = { source?: "service" | "fallback"; data: unknown }

/** Getters que devuelven `Content<T>` o el dato suelto → misma forma. */
async function run(get: () => Promise<unknown>): Promise<Result> {
  const r = await get()
  if (r && typeof r === "object" && "source" in r && "data" in r) return r as Result
  return { data: r }
}

const TREATMENT = {
  id: "t1",
  slug: "toxina-botulinica",
  name: "Toxina Botulínica",
  description: "Relaja la musculatura de expresión.",
  price: 1200,
  tag: "Popular",
  imageUrl: "https://cdn.test/botox.jpg",
  active: true,
  seoTitle: "Botox",
}
const EMPTY_TREATMENT = { id: "t1", slug: "toxina-botulinica", name: "Toxina Botulínica", description: "", tag: "", imageUrl: "" }

const POST = {
  id: "p1",
  slug: "que-es-el-botox",
  title: "Qué es el bótox",
  excerpt: "Resumen del panel",
  content: "<p>Cuerpo del panel</p>",
  imageUrl: "https://cdn.test/post.jpg",
  publishedAt: "2026-05-01",
  published: true,
}

interface Case {
  name: string
  path: string
  get: () => Promise<unknown>
  fallback: unknown
  full: unknown
  checkFull: (data: Data) => void
  empty: unknown
  checkEmpty: (data: Data) => void
  /** Modos de caída que se prueban además de 500/red/204. */
  extraDown?: Down[]
  /** Textos que coinciden por diseño (no son contenido del respaldo). */
  allow?: string[]
  /** El recurso no expone `source` pero sí puede fallar por diseño con vacío. */
  emptyIsFallback?: boolean
}

const cases: Case[] = [
  {
    name: "home",
    path: "/home",
    get: getHome,
    fallback: HOME_FALLBACK,
    full: {
      specialties: "Botox · Rellenos",
      doctorName: "Dra. Panel",
      subtitle: "Sub del panel",
      description: "Desc del panel",
      stat1Value: "12+",
      stat1Label: "Años",
      btn1Text: "VER",
      btn2Text: "CITA",
      faqSectionLabel: "FAQ",
      faqTitle: "Dudas",
      faqs: [{ question: "¿P?", answer: "R." }],
    },
    checkFull: (d) => {
      expect(d.header.doctorName).toBe("Dra. Panel")
      expect(d.stats).toEqual([{ value: "12+", label: "Años" }])
      expect(d.faqs).toEqual([{ question: "¿P?", answer: "R." }])
      expect(d.ctaLabels).toEqual({ treatments: "VER", booking: "CITA" })
    },
    empty: {
      specialties: "", doctorName: "", subtitle: "", description: "",
      stat1Value: "", stat1Label: "", btn1Text: "", btn2Text: "",
      faqSectionLabel: "", faqTitle: "", faqs: [],
    },
    checkEmpty: (d) => {
      expect(d.header).toEqual({ specialties: "", doctorName: "", subtitleSpecialities: "", description: "" })
      expect(d.stats).toEqual([])
      expect(d.faqs).toEqual([])
    },
  },
  {
    name: "about",
    path: "/about",
    get: getAbout,
    fallback: ABOUT_FALLBACK,
    extraDown: ["404"],
    full: {
      sectionLabel: "Sobre mí",
      doctorName: "Dra. Panel",
      descriptionDoc: "Bio del panel",
      imageUrl: "https://cdn.test/dra.jpg",
      whyChooseUsTitle: "Por qué",
      feature1Title: "F1",
      stat1Value: "12+",
      stat1Label: "Años de Experiencia",
      gallery: ["https://cdn.test/g1.jpg", { url: "https://cdn.test/g2.jpg" }],
    },
    checkFull: (d) => {
      expect(d.bio.doctorName).toBe("Dra. Panel")
      expect(d.bio.doctorImage).toBe("https://cdn.test/dra.jpg")
      expect(d.features.card1Title).toBe("F1")
      expect(d.gallery).toEqual(["https://cdn.test/g1.jpg", "https://cdn.test/g2.jpg"])
      expect(d.stats).toEqual([{ value: "12+", label: "Años de Experiencia" }])
    },
    empty: { sectionLabel: "", doctorName: "", descriptionDoc: "", imageUrl: "", whyChooseUsTitle: "", gallery: [] },
    checkEmpty: (d) => {
      expect(d.bio.doctorName).toBe("")
      expect(d.bio.doctorImage).toBe("")
      expect(d.features.title).toBe("")
      expect(d.features.card1Title).toBe("")
      expect(d.gallery).toEqual([])
      expect(d.stats).toEqual([])
    },
  },
  {
    name: "promo",
    path: "/promo-banner",
    get: getPromo,
    fallback: PROMO_FALLBACK,
    full: { active: true, tag: "Oferta", badges: "a, b", title: "Promo", whatsappUrl: "https://wa.me/1", whatsappText: "Pedir" },
    checkFull: (d) => {
      expect(d.active).toBe(true)
      expect(d.title).toBe("Promo")
      expect(d.badges).toEqual(["a", "b"])
      expect(d.ctaHref).toBe("https://wa.me/1")
    },
    empty: { active: true, tag: "", badges: "", title: "", whatsappUrl: "" },
    checkEmpty: (d) => {
      expect(d.title).toBe("")
      expect(d.badges).toEqual([])
      expect(d.ctaHref).toBe("")
    },
  },
  {
    name: "contact",
    path: "/contact",
    get: getContact,
    fallback: CONTACT_FALLBACK,
    full: {
      whatsappUrl: "https://wa.me/59170000000",
      phone: "+591 70000000",
      instagramUrl: "https://instagram.com/panel",
      tiktokUrl: "https://www.tiktok.com/@panel?_r=1&_t=x",
      mondayFridayHours: "8:00 - 18:00",
      latitude: "-17.39",
      longitude: "-66.15",
    },
    checkFull: (d) => {
      expect(d.phone).toBe("+591 70000000")
      expect(d.scheduleWeekdays).toBe("8:00 - 18:00")
      expect(d.tiktokUrl).not.toContain("_r=1")
      expect(d.mapsUrl).toBe("https://www.google.com/maps?q=-17.39,-66.15")
    },
    empty: { whatsappUrl: "", phone: "", instagramUrl: "", mondayFridayHours: "", saturdayHours: "", sundayStatus: "", latitude: "", longitude: "" },
    checkEmpty: (d) => {
      expect(d.phone).toBe("")
      expect(d.scheduleWeekdays).toBe("")
      expect(d.scheduleSunday).toBe("")
      expect(d.mapsUrl).toBe("")
    },
  },
  {
    name: "whatsapp",
    path: "/contact",
    get: getWhatsApp,
    fallback: WHATSAPP_FALLBACK,
    full: { whatsappUrl: "https://wa.me/59170000000" },
    checkFull: (d) => expect(d).toEqual({ url: "https://wa.me/59170000000" }),
    // Regla estricta del recurso: sin enlace de WhatsApp válido → respaldo entero.
    empty: { whatsappUrl: "" },
    checkEmpty: (d) => expect(d).toEqual(WHATSAPP_FALLBACK),
    emptyIsFallback: true,
  },
  {
    name: "treatments list",
    path: "/treatments",
    get: getActiveTreatments,
    fallback: TREATMENTS_FALLBACK,
    full: { data: [TREATMENT], total: 1 },
    checkFull: (d) => {
      expect(d).toHaveLength(1)
      expect(d[0]).toMatchObject({ id: "t1", slug: "toxina-botulinica", name: "Toxina Botulínica", seoTitle: "Botox", price: 1200 })
    },
    empty: [EMPTY_TREATMENT],
    checkEmpty: (d) => {
      expect(d[0]).toMatchObject({ description: "", tag: "", imageUrl: "", seoTitle: "" })
    },
  },
  {
    name: "treatments grid page",
    path: "/treatments",
    get: () => getTreatmentsGridPage(1),
    fallback: TREATMENTS_PAGE_FALLBACK,
    full: { data: [TREATMENT], total: 1, totalPages: 1, page: 1, limit: 9 },
    checkFull: (d) => {
      expect(d.items[0].slug).toBe("toxina-botulinica")
      expect(d.meta).toEqual({ total: 1, totalPages: 1, page: 1, limit: 9 })
    },
    empty: { data: [], total: 0, totalPages: 0, page: 1, limit: 9 },
    checkEmpty: (d) => expect(d.items).toEqual([]),
  },
  {
    name: "treatmentsPage info",
    path: "/site-content/treatmentsPage",
    get: getTreatmentsPageInfo,
    fallback: TREATMENTS_PAGE_INFO_FALLBACK,
    full: {
      value: {
        label: "Servicios",
        title: "Título panel",
        description: "Texto con brillo",
        descriptionHighlight: "brillo",
        consultationItems: JSON.stringify(["Uno", "Dos"]),
        buttonText: "RESERVAR",
      },
    },
    checkFull: (d) => {
      expect(d.title).toBe("Título panel")
      expect(d.subtitle).toContain("<span")
      expect(d.subtitle).toContain("brillo")
      expect(d.consultationItems).toEqual(["Uno", "Dos"])
    },
    empty: { value: { label: "", title: "", description: "", consultationItems: "[]", doctorImage: "", buttonText: "", disclaimer: "" } },
    checkEmpty: (d) => {
      expect(d.title).toBe("")
      expect(d.subtitle).toBe("")
      expect(d.consultationItems).toEqual([])
      expect(d.doctorImage).toBe("")
    },
  },
  {
    name: "blog list",
    path: "/blog",
    get: getPosts,
    fallback: BLOG_FALLBACK,
    full: { data: [POST, { ...POST, id: "p2", slug: "borrador", published: false }] },
    checkFull: (d) => {
      expect(d.map((p: { slug: string }) => p.slug)).toEqual(["que-es-el-botox"])
      expect(d[0]).toMatchObject({ title: "Qué es el bótox", excerpt: "Resumen del panel", readTime: "1 min" })
    },
    empty: [{ ...POST, excerpt: "", content: "", imageUrl: "" }],
    checkEmpty: (d) => {
      expect(d[0]).toMatchObject({ excerpt: "", content: "", imageUrl: "", readTime: "" })
    },
  },
  {
    name: "reviews",
    path: "/reviews/public",
    get: getReviews,
    fallback: REVIEWS_FALLBACK,
    full: {
      reviews: [{ id: "r1", body: "Excelente", rating: 5, patient_name: "Ana" }],
      aggregate: { avg_rating: 4.8, total_count: 20 },
      page: 1,
      totalPages: 2,
    },
    checkFull: (d) => {
      expect(d.reviews[0]).toMatchObject({ id: "r1", body: "Excelente", rating: 5 })
      expect(d.aggregate).toEqual({ avg_rating: 4.8, total_count: 20 })
      expect(d.meta).toEqual({ page: 1, totalPages: 2 })
    },
    empty: { reviews: [], aggregate: { avg_rating: null, total_count: 0 } },
    checkEmpty: (d) => expect(d).toEqual({ reviews: [], aggregate: null, meta: null }),
  },
  {
    name: "nav",
    path: "/site-content/main",
    get: getNavLinks,
    fallback: NAV_LINKS_FALLBACK,
    full: { value: { navLinks: [{ label: "Inicio", href: "/" }, { label: "Precios", href: "/precios" }] } },
    checkFull: (d) => expect(d).toEqual([{ label: "Inicio", href: "/" }, { label: "Precios", href: "/precios" }]),
    empty: { value: { navLinks: [] } },
    checkEmpty: (d) => expect(d).toEqual([]),
  },
  {
    name: "seo",
    path: "/site-content/seo",
    get: getSiteSeo,
    fallback: SEO_FALLBACK,
    extraDown: ["404"],
    full: { value: { nosotros: { title: "Nosotros panel", description: "Desc panel" }, home: { title: "Home panel", description: "" } } },
    checkFull: (d) => {
      expect(d.nosotros).toEqual({ title: "Nosotros panel", description: "Desc panel" })
      expect(d.home.title).toBe("Home panel")
      // Página que el panel no trae = no se declara (no se completa con el respaldo).
      expect(d.blog).toEqual({ title: "", description: "" })
    },
    empty: { value: { home: { title: "", description: "" }, nosotros: { title: "", description: "" } } },
    checkEmpty: (d) => {
      for (const page of Object.values(d)) expect(page).toEqual({ title: "", description: "" })
    },
  },
]

describe.each(cases)("contrato $name", (c) => {
  it("given servicio completo, then devuelve solo lo que el servicio manda", async () => {
    serve(c.path, c.full)
    const r = await run(c.get)
    if (r.source) expect(r.source).toBe("service")
    c.checkFull(r.data)
  })

  it("given servicio con campos vacíos, then quedan vacíos y no se filtra el respaldo", async () => {
    serve(c.path, c.empty)
    const r = await run(c.get)
    c.checkEmpty(r.data)
    if (c.emptyIsFallback) return
    if (r.source) expect(r.source).toBe("service")
    expect(leaked(r.data, c.fallback, c.allow)).toEqual([])
  })

  const modes: Down[] = ["500", "network", "204", ...(c.extraDown ?? [])]
  it.each(modes)("given servicio caído (%s), then respaldo entero", async (mode) => {
    down(c.path, mode)
    const r = await run(c.get)
    if (r.source) expect(r.source).toBe("fallback")
    expect(r.data).toEqual(c.fallback)
  })

  it.each([["texto", "no soy un objeto"], ["número", 42]])(
    "given forma inválida (%s), then respaldo entero",
    async (_label, body) => {
      serve(c.path, body)
      const r = await run(c.get)
      if (r.source) expect(r.source).toBe("fallback")
      expect(r.data).toEqual(c.fallback)
    }
  )
})

describe("tratamiento por slug", () => {
  it("given slug activo, then lee la ficha del servicio por id", async () => {
    serve("/treatments", [TREATMENT])
    serve("/treatments/t1", { ...TREATMENT, description: "Ficha completa" })
    const t = await getTreatmentBySlug("toxina-botulinica")
    expect(t).toMatchObject({ id: "t1", description: "Ficha completa", seoTitle: "Botox" })
  })

  it("given slug que no está activo, then null", async () => {
    serve("/treatments", [TREATMENT])
    expect(await getTreatmentBySlug("no-existe")).toBeNull()
  })

  it("given servicio caído, then null (el respaldo no inventa fichas)", async () => {
    down("/treatments", "500")
    expect(await getTreatmentBySlug("toxina-botulinica")).toBeNull()
  })
})

describe("artículo por slug", () => {
  it("given servicio responde, then solo artículos del servicio", async () => {
    serve("/blog", [POST])
    expect((await getPostBySlug("que-es-el-botox"))?.excerpt).toBe("Resumen del panel")
    // Un slug que solo existe en el respaldo no aparece con servicio.
    serve("/blog", [POST])
    if (BLOG_FALLBACK[0]) expect(await getPostBySlug(BLOG_FALLBACK[0].slug)).toBeNull()
  })

  it("given servicio responde sin artículos, then null (sin respaldo)", async () => {
    serve("/blog", [])
    if (BLOG_FALLBACK[0]) expect(await getPostBySlug(BLOG_FALLBACK[0].slug)).toBeNull()
  })

  it("given servicio caído, then resuelve contra el respaldo", async () => {
    down("/blog", "network")
    const first = BLOG_FALLBACK[0]
    expect(await getPostBySlug(first ? first.slug : "x")).toEqual(first ?? null)
  })
})
