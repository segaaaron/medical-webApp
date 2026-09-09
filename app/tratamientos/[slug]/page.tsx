import { BASE_URL } from "@/lib/seo/site-url"
import { sanitizeBody } from "@/lib/html/sanitize"
import { AREA_SERVED, phoneFromWhatsApp, formatPhone } from "@/lib/seo/local"
import { bodyLocationsFor, concernsFor, derivedKeywords, concernSentence } from "@/lib/seo/vocabulary"
import { AuthorBox } from "@/components/blog/AuthorBox"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { normalizeSocialUrl } from "@/lib/seo/meta"
import { seoTitleFor, searchAliasesFor, matchTreatmentsInText, normalizeHeadline } from "@/lib/seo/treatment-names"
import { buildMetaDescription } from "@/lib/seo/meta"
import { permanentRedirect } from "next/navigation"
import { backendFetch, resolveImageUrl, extractList } from "@/lib/backend-client"
import { safeJsonLd } from "@/lib/seo-utils"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getFooterData } from "@/lib/data/footer"
import { DEFAULTS, readContent } from "@/lib/store/content-store"
import { ArrowLeft, MessageCircle, Phone } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getWhatsAppConfig } from "@/lib/data/whatsapp"
import { TreatmentPageTracker } from "@/components/analytics/TreatmentPageTracker"
import { TrackWhatsAppLink } from "@/components/analytics/TrackWhatsAppLink"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { EcgHero } from "@/components/ui/EcgHero"
import { BeforeAfter } from "@/components/sections/BeforeAfter"
import { FaqPrompt } from "@/components/ui/FaqPrompt"

export const revalidate = 300 // 5 minutos — ISR; fuerza refresco si el admin edita el tratamiento

export async function generateStaticParams() {
  try {
    const { data } = await backendFetch<BackendTreatment[]>("/treatments?active=true", { revalidate: 300 })
    return extractList<BackendTreatment>(data)
      .filter((t) => t.slug)
      .map((t) => ({ slug: t.slug }))
  } catch {
    return []
  }
}


interface BackendTreatment {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  tag: string | null
  imageUrl: string | null
  image_url: string | null
  beforeImageUrl: string | null
  before_image_url: string | null
  afterImageUrl: string | null
  after_image_url: string | null
  active: boolean
  updatedAt?: string | null
  createdAt?: string | null
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Resuelve un tratamiento por su slug.
 *
 * Las URLs eran `/tratamientos/<uuid>`: sin una sola palabra clave, ilegibles
 * al compartirse por WhatsApp y sin valor para buscar "botox cochabamba". El
 * modelo ya tiene `slug` único, así que la dirección pública ahora lo usa.
 *
 * `/treatments?active=true` sin `page` devuelve la lista completa (contrato del
 * backend), así que el slug se resuelve sin endpoint nuevo. Si llega un UUID
 * —enlaces antiguos ya indexados— se responde con un 301 al slug, que es lo que
 * conserva el posicionamiento ganado.
 */
async function findBySlug(slug: string): Promise<BackendTreatment | null> {
  // Un UUID solo puede venir de un enlace antiguo (anuncios, mensajes ya
  // enviados, resultados de Google todavía sin reindexar). Se pregunta por él
  // directamente en vez de buscarlo en la lista de activos: así el 301 también
  // funciona para un tratamiento que hoy esté desactivado, que es justo cuando
  // un 404 dolería más.
  if (UUID_RE.test(slug)) {
    const { data } = await backendFetch<BackendTreatment>(`/treatments/${slug}`, { revalidate: 300 })
    if (data?.slug) permanentRedirect(`/tratamientos/${data.slug}`)
    return null
  }

  const { data } = await backendFetch<BackendTreatment[]>("/treatments?active=true", { revalidate: 300 })
  return extractList<BackendTreatment>(data).find((t) => t.slug === slug) ?? null
}

async function getTreatment(slug: string): Promise<BackendTreatment | null> {
  const found = await findBySlug(slug)
  if (!found) return null
  const { data, error } = await backendFetch<BackendTreatment>(`/treatments/${found.id}`, { revalidate: 300 })
  // `!data` no basta: si el backend responde 200 con un objeto vacío o de otra
  // forma, `data` es «truthy» pero sin `name`, y al construir los metadatos se
  // rompía con «Cannot read properties of undefined» — un 500 en la ficha del
  // tratamiento, que para Google es una página muerta. Se exige el mínimo
  // imprescindible antes de darla por válida.
  if (error || !data || typeof data.name !== "string" || !data.name) return null
  const before = (data.beforeImageUrl ?? data.before_image_url) as string | null
  const after = (data.afterImageUrl ?? data.after_image_url) as string | null
  return {
    ...data,
    imageUrl: resolveImageUrl((data.imageUrl ?? data.image_url) as string | null),
    beforeImageUrl: before ? resolveImageUrl(before) : null,
    afterImageUrl: after ? resolveImageUrl(after) : null,
  }
}

interface Props {
  params: Promise<{ slug: string }>
}

/** Mismos términos sin tildes: es como se teclean en un móvil con prisa. */
function sinTilde(terms: string[]): string[] {
  const out = terms
    .map((t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    .filter((t, i) => t !== terms[i])
  return [...new Set(out)]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const treatment = await getTreatment(slug)
  if (!treatment) return {}
  // La frase de indicaciones va DELANTE del texto del panel: nombra el problema
  // con las palabras que teclea la paciente («sudoración excesiva en axilas»),
  // y es lo primero que se lee en el resultado de búsqueda.
  const indicaciones = concernSentence(treatment)
  const description = buildMetaDescription(
    `${indicaciones} ${treatment.description ?? ""}`.trim(),
    " Consulta de valoración en Cochabamba con la Dra. Yasmin Medrano."
  )

  // El título NO usa el nombre crudo del panel: venía en mayúsculas sostenidas
  // («ÁCIDO HIALURÓNICO»), con comillas escapadas y, en varios casos, con el
  // nombre clínico que nadie teclea en Google. Ver lib/seo/treatment-names.ts.
  const seoName = seoTitleFor(slug, treatment.name)
  const aliases = searchAliasesFor(slug, treatment.name)

  return {
    // Sin sufijo de marca: el template del layout ya añade "| Dra. Yasmin
    // Medrano Avila" y el título salía con el nombre repetido dos veces.
    title: `${seoName} en Cochabamba`,
    description,
    // Variantes geográficas y de escritura.
    //
    // `sinTilde` cubre la forma que sale de un teclado sin acentos —«botox»,
    // «acido hialuronico»—, que en Bolivia es como se teclea la mayoría de las
    // veces aunque la RAE prefiera «bótox». Y las ciudades del área
    // metropolitana entran porque «bótox Quillacollo» es una búsqueda real de
    // alguien que está a quince minutos del consultorio.
    keywords: [
      ...aliases,
      ...sinTilde(aliases),
      // Derivadas del texto que la doctora escribió en el panel: las zonas y
      // los motivos de consulta que la ficha menciona de verdad. Es lo que
      // permite que «sudor en las axilas» encuentre la ficha de hiperhidrosis
      // sin que nadie haya escrito esa frase en una tabla.
      ...derivedKeywords(treatment),
      ...aliases.slice(0, 2).flatMap((a) =>
        ["Cochabamba", "Bolivia", "Quillacollo", "Sacaba"].map((lugar) => `${a} ${lugar}`)
      ),
      ...aliases.slice(0, 2).map((a) => `${a} precio Bolivia`),
      ...aliases.slice(0, 1).map((a) => `${a} cerca de mí`),
      "medicina estética Cochabamba",
      "Dra. Yasmin Medrano Avila",
    ],
    alternates: { canonical: `${BASE_URL}/tratamientos/${slug}` },
    openGraph: {
      title: `${seoName} en Cochabamba | Dra. Yasmin Medrano Avila`,
      description,
      url: `${BASE_URL}/tratamientos/${slug}`,
      type: "website",
      // Sin foto se OMITE la clave: `images: []` pisaba el `opengraph-image`
      // del sitio y la ficha se compartía en WhatsApp sin imagen.
      ...(treatment.imageUrl
        ? { images: [{ url: treatment.imageUrl, width: 1200, height: 630, alt: `${seoName} — Dra. Yasmin Medrano Avila, Cochabamba` }] }
        : {}),
      locale: "es_BO",
    },
  }
}

/** Lo mínimo que se necesita de un artículo para saber si trata de esta ficha. */
interface BackendPostRef {
  slug: string
  title: string
  excerpt?: string | null
  content?: string | null
  published: boolean
}

export default async function TratamientoDetallePage({ params }: Props) {
  const { slug } = await params
  const [treatment, footerData, c, whatsapp] = await Promise.all([
    getTreatment(slug),
    getFooterData(),
    readContent(),
    getWhatsAppConfig(),
  ])

  if (!treatment || !treatment.active) notFound()

  const navLinks = c?.navLinks ?? DEFAULTS.navLinks

  // Teléfono derivado del WhatsApp del panel: un solo número editable en un
  // solo sitio, sin una segunda copia que se quede vieja.
  const telefono = phoneFromWhatsApp(whatsapp.url)

  const perfilesSociales = [
    footerData.facebookUrl,
    footerData.instagramUrl,
    footerData.tiktokUrl,
  ]
    .map(normalizeSocialUrl)
    .filter(Boolean)

  // Mismo nombre optimizado que usan los metadatos, para que el schema y el
  // título digan lo mismo que la página muestra.
  const seoName = seoTitleFor(slug, treatment.name)
  const aliases = searchAliasesFor(slug, treatment.name)

  // Otros tratamientos, para enlazar entre fichas.
  //
  // Cada página de tratamiento era un callejón sin salida: no enlazaba a
  // ninguna otra. Eso desperdicia dos cosas — el paciente que descarta un
  // procedimiento se va del sitio en vez de mirar el siguiente, y la autoridad
  // que gana una ficha no se reparte hacia las demás. Reutiliza el mismo fetch
  // cacheado de `findBySlug`, así que no añade ninguna llamada al backend.
  const { data: allActive } = await backendFetch<BackendTreatment[]>(
    "/treatments?active=true",
    { revalidate: 300 }
  )
  const otherTreatments = extractList<BackendTreatment>(allActive)
    .filter((t) => t.slug && t.slug !== slug)
    .slice(0, 3)

  /**
   * Artículos del blog que hablan de ESTE tratamiento.
   *
   * El enlace ya existía en un solo sentido: un artículo que menciona botox
   * enlaza a la ficha de botox. Al revés, no — y esa mitad es la que convierte.
   * Quien está leyendo la ficha y duda («¿duele?», «¿cuánto dura?») se iba del
   * sitio a buscarlo en Google, cuando la respuesta estaba dos clics más allá.
   *
   * Se reutiliza el emparejador del blog en sentido inverso: para cada artículo
   * se calcula qué tratamientos menciona y se conservan los que nombran este.
   * Mismo vocabulario, ninguna lista nueva que mantener.
   */
  const { data: rawPosts } = await backendFetch("/blog?published=true", { revalidate: 3600 })
  const activeRefs = extractList<BackendTreatment>(allActive)
    .filter((t) => t.slug)
    .map((t) => ({ slug: t.slug, name: t.name }))
  const relatedPosts = extractList<BackendPostRef>(rawPosts)
    .filter((p) => p.published && p.slug)
    .filter((p) => {
      const texto = `${p.title} ${p.excerpt ?? ""} ${p.content ?? ""}`.replace(/<[^>]+>/g, " ")
      return matchTreatmentsInText(texto, activeRefs, 5).includes(slug)
    })
    .slice(0, 3)

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Tratamientos", item: `${BASE_URL}/tratamientos` },
      { "@type": "ListItem", position: 3, name: seoName },
    ],
  }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        // Se usa `seoName`, no `treatment.name`: el nombre del panel viene en
        // MAYÚSCULAS SOSTENIDAS y las preguntas salían gritando
        // («¿Cuánto cuesta ÁCIDO HIALURÓNICO en Cochabamba?»).
        "@type": "Question",
        name: `¿Cuánto cuesta ${seoName} en Cochabamba?`,
        acceptedAnswer: {
          "@type": "Answer",
          // Sin precio en el panel, la respuesta apunta a WhatsApp, que es el
          // canal por el que el consultorio da precios. La versión anterior
          // decía «agenda una consulta» sin explicar cómo: dejaba a la paciente
          // con la pregunta sin responder y sin siguiente paso.
          text: treatment.price > 0
            ? `El precio de ${seoName} en el consultorio de la Dra. Yasmin Medrano Avila es Bs. ${treatment.price.toLocaleString("es-BO")}. Escríbenos por WhatsApp para agendar tu valoración.`
            // Con el número dentro de la respuesta: es lo que un motor de
            // respuestas puede citar entero cuando alguien pregunta «cuánto
            // cuesta el bótox en Cochabamba», y lo que evita que la paciente
            // tenga que volver a buscar cómo contactar.
            : `El precio de ${seoName} depende de la valoración de cada paciente: la zona a tratar y el producto necesario cambian el presupuesto. Escribe al ${formatPhone(telefono)} por WhatsApp y te damos el precio para tu caso.`,
        },
      },
      {
        "@type": "Question",
        name: `¿Es seguro el tratamiento de ${seoName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${seoName} lo realiza la Dra. Yasmin Medrano Avila, médica especialista en medicina estética con más de 10 años de experiencia en Cochabamba, Bolivia, siguiendo protocolos médicos certificados.`,
        },
      },
      {
        "@type": "Question",
        name: `¿Dónde puedo realizarme ${seoName} en Cochabamba?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `En el consultorio de la Dra. Yasmin Medrano Avila, en Cochabamba, Bolivia. Escríbenos por WhatsApp para agendar tu consulta de valoración.`,
        },
      },
    ],
  }

  const procedureImages = [treatment.imageUrl, treatment.beforeImageUrl, treatment.afterImageUrl].filter(Boolean)

  // Contenido de salud: Google pondera QUIÉN lo firma y CUÁNDO se revisó.
  // `reviewedBy` apunta a la ficha Physician del sitio (@id #doctor), y
  // `lastReviewed` sale de la última edición real en el panel — no de la fecha
  // de hoy, que sería afirmar una revisión que nadie hizo.
  const revisadoEl = treatment.updatedAt ?? treatment.createdAt ?? null

  const procedureLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    reviewedBy: { "@id": `${BASE_URL}/#doctor` },
    ...(revisadoEl ? { lastReviewed: new Date(revisadoEl).toISOString().slice(0, 10) } : {}),
    medicalAudience: { "@type": "MedicalAudience", audienceType: "Patient" },
    name: seoName,
    // El nombre clínico se conserva, y los términos por los que la gente busca
    // de verdad entran como alternativos: es la forma que entiende Google de
    // «esta página también trata de esto».
    alternateName: [treatment.name, ...aliases].filter(
      (v, i, arr) => v && arr.indexOf(v) === i
    ),
    description: (treatment.description ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300),
    url: `${BASE_URL}/tratamientos/${slug}`,
    ...(procedureImages.length ? { image: procedureImages } : {}),
    // Referencias a las entidades que el layout ya sirve en todas las páginas,
    // en vez de volver a describirlas. Repetidas creaban una doctora y un
    // consultorio NUEVOS por cada ficha de tratamiento: once entidades
    // homónimas, todas con el mismo teléfono, ninguna relacionada con las
    // demás. Un `@id` cuesta una línea y las une.
    provider: { "@id": `${BASE_URL}/#doctor` },
    availableAtOrFrom: { "@id": `${BASE_URL}/#business` },
    // Dónde se presta. Quien busca desde Quillacollo o Sacaba está a quince
    // minutos del consultorio, y es tráfico que el schema no declaraba.
    areaServed: AREA_SERVED,
    // Zonas del cuerpo y motivos de consulta, deducidos del texto del panel.
    // `bodyLocation` es el campo con el que un buscador entiende que esta
    // página trata de las axilas; sin él, «axila» no llevaba a ninguna parte.
    ...(bodyLocationsFor(treatment).length
      ? { bodyLocation: bodyLocationsFor(treatment) }
      : {}),
    // Sin `relevantSpecialty`: `MedicalSpecialty` es una enumeración cerrada de
    // schema.org y «Medicina Estética» no es uno de sus valores, así que
    // declararlo como objeto con `name` es un tipo mal usado. La especialidad
    // ya la declara el negocio y la doctora en el `@graph` del layout.
    ...(concernsFor(treatment).length
      ? {
          indication: concernsFor(treatment).map((motivo) => ({
            "@type": "MedicalIndication",
            name: motivo,
          })),
        }
      : {}),
  }

  return (
    <>
      <Navbar links={navLinks} />
      <main style={{ backgroundColor: "#F8F0E3", minHeight: "100vh" }}>
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Tratamientos", href: "/tratamientos" },
            { label: seoName },
          ]}
        />
        <TreatmentPageTracker id={treatment.id} name={treatment.name} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(procedureLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }}
        />

        {/* Dark hero band */}
        <div
          className="relative overflow-hidden"
          style={{ backgroundColor: "var(--primary-darkest)", paddingTop: "30px", paddingBottom: "30px" }}
        >
          {/* Hero image as blurred bg when available */}
          {treatment.imageUrl && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("${encodeURI(treatment.imageUrl).replace(/#/g, "%23")}")`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                filter: "blur(24px) brightness(0.25) saturate(0.6)",
                transform: "scale(1.1)",
              }}
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(58,15,32,0.7) 0%, rgba(58,15,32,0.95) 100%)" }} aria-hidden="true" />

          {/* ECG animated line */}
          <EcgHero />

          <div className="relative z-10 max-w-3xl mx-auto px-6">
            {/* Back link */}
            <Link
              href="/tratamientos"
              className="flex w-fit items-center gap-2 text-xs font-medium hover:opacity-80 transition-opacity mb-6 py-2 -my-2"
              style={{ color: "rgba(184,151,59,0.8)", fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.1em" }}
            >
              <ArrowLeft size={14} aria-hidden="true" /> VOLVER A TRATAMIENTOS
            </Link>

            {/* Tag */}
            {treatment.tag && (
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide"
                style={{ backgroundColor: "rgba(184,151,59,0.15)", color: "var(--vintage-gold)", border: "1px solid rgba(184,151,59,0.3)" }}
              >
                {treatment.tag}
              </span>
            )}

            {/* Title */}
            <h1
              className="text-3xl md:text-5xl font-light leading-tight text-white"
              style={{ fontFamily: "var(--font-display, Georgia, serif)", letterSpacing: "-0.02em" }}
            >
              {treatment.name}
            </h1>

            {/* Gold divider */}
            <div className="mt-6 w-16 h-px" style={{ backgroundColor: "var(--vintage-gold)" }} />
          </div>
        </div>

        {/* Article content */}
        <article className="py-12 px-6">
          <div className="max-w-3xl mx-auto">

            {/* Cover image */}
            <div
              className="w-full rounded-2xl overflow-hidden mb-10 shadow-lg relative"
              style={{ aspectRatio: "16/9", backgroundColor: "#F8F0E3" }}
            >
              <ImageWithFallback
                src={treatment.imageUrl ?? ""}
                alt={treatment.name}
                variant="light"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                loading="eager"
              />
            </div>

            {/* Description */}
            {treatment.description && (
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: sanitizeBody(treatment.description) }}
              />
            )}

            {/* Antes y Después — DEMO con imágenes de prueba */}
            <section className="mt-14" aria-labelledby="antes-despues-heading">
              <div className="text-center mb-8">
                <p
                  className="text-xs uppercase mb-3"
                  style={{ color: "var(--vintage-gold)", fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.22em" }}
                >
                  Resultados
                </p>
                <h2
                  id="antes-despues-heading"
                  className="text-3xl md:text-4xl font-light"
                  style={{ fontFamily: "var(--font-heading, Georgia, serif)", color: "var(--primary-darkest)", letterSpacing: "-0.02em" }}
                >
                  Antes y Después
                </h2>
                <div className="mt-5 mx-auto w-16 h-px" style={{ backgroundColor: "var(--vintage-gold)" }} />
              </div>

              <BeforeAfter
                before={treatment.beforeImageUrl}
                after={treatment.afterImageUrl}
                name={treatment.name}
              />

              <p className="mt-5 text-center text-xs" style={{ color: "rgba(58,15,32,0.45)" }}>
                * Imágenes referenciales. Los resultados varían según cada paciente.
              </p>
            </section>

            {/* CTA bottom */}
            <div
              className="mt-12 p-8 rounded-2xl text-center"
              style={{ backgroundColor: "var(--primary-darkest)", border: "1px solid rgba(184,151,59,0.25)" }}
            >
              <p
                className="text-xs uppercase tracking-[0.2em] mb-3"
                style={{ color: "var(--vintage-gold)", fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
              >
                Consulta de Valoración
              </p>
              <p className="text-base font-medium mb-4 text-white">
                ¿Te interesa este tratamiento? Agenda una consulta con la Dra. Yasmin Medrano Avila.
              </p>
              {/* Con precio en el panel se muestra. Sin precio NO se calla:
                  «cuánto cuesta» es la primera pregunta de quien llega buscando
                  este tratamiento, y una ficha que no la menciona la manda a
                  buscarla a otra parte. Se dice por qué depende de la
                  valoración y se da el número, que además es un dato de
                  contacto visible — lo que Google espera de un negocio local. */}
              {treatment.price > 0 ? (
                <p className="text-3xl font-bold mb-6" style={{ color: "var(--vintage-gold)" }}>
                  Bs. {treatment.price.toLocaleString("es-BO")}
                </p>
              ) : (
                <div className="mb-6">
                  <p className="text-2xl font-bold mb-2" style={{ color: "var(--vintage-gold)" }}>
                    Precio a consultar
                  </p>
                  <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
                    El presupuesto depende de la zona a tratar y del producto que necesite
                    cada paciente. Se define en la consulta de valoración.
                  </p>
                  <a
                    href={`tel:${telefono}`}
                    className="inline-flex items-center gap-2 text-base font-semibold hover:opacity-80 transition-opacity py-2 -my-2"
                    style={{ color: "#fff" }}
                  >
                    <Phone size={16} aria-hidden="true" />
                    {formatPhone(telefono)}
                  </a>
                </div>
              )}
              <TrackWhatsAppLink
                href={`${whatsapp.url}?text=${encodeURIComponent(`Hola, me interesa el tratamiento de ${treatment.name}`)}`}
                source="treatment-detail-cta"
                treatment={treatment.name}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ backgroundColor: "var(--vintage-gold)" }}
              >
                <MessageCircle size={16} aria-hidden="true" />
                {treatment.price > 0 ? "Agendar consulta" : "Consultar por WhatsApp"}
              </TrackWhatsAppLink>
              <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                Sin compromiso · Atención personalizada garantizada
              </p>
              <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(184,151,59,0.2)" }}>
                <FaqPrompt size="sm" />
              </div>
            </div>
          </div>
          {/* Firma médica visible.
              El `MedicalProcedure` ya declara `reviewedBy` y `lastReviewed`,
              pero eso solo lo lee un buscador. En contenido de salud Google
              pide ver en la página quién responde de lo que se afirma, y el
              paciente que llega desde Instagram también. */}
          <div className="max-w-3xl mx-auto px-6 pb-4">
            <AuthorBox
              name="Dra. Yasmin Medrano Avila"
              publishedAt={treatment.createdAt ?? new Date().toISOString()}
              updatedAt={treatment.updatedAt}
              perfiles={perfilesSociales}
              eyebrow="INFORMACIÓN REVISADA POR"
              publishedLabel="Publicado el"
            />
          </div>
        </article>
      </main>
      {/* Mismo caso que en el blog: esta sección vive FUERA de `<main>`, que es
          quien pinta el crema, así que caía sobre el fondo oscuro del body y
          sus enlaces quedaban invisibles. */}
      {otherTreatments.length > 0 && (
        <section
          className="py-14 px-6"
          aria-labelledby="otros-tratamientos"
          style={{ backgroundColor: "#F8F0E3" }}
        >
          <div className="max-w-3xl mx-auto">
            <h2
              id="otros-tratamientos"
              className="text-xl font-bold mb-6"
              style={{ color: "var(--primary-darkest)" }}
            >
              Otros tratamientos de la Dra. Yasmin Medrano
            </h2>
            <ul className="flex flex-wrap gap-3">
              {otherTreatments.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tratamientos/${t.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors"
                    style={{
                      border: "1px solid var(--vintage-gold)",
                      color: "var(--primary-darkest)",
                      borderRadius: "2px",
                    }}
                  >
                    {seoTitleFor(t.slug, t.name)}
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section
          className="py-14 px-6"
          aria-labelledby="articulos-del-tratamiento"
          style={{ backgroundColor: "#F8F0E3" }}
        >
          <div className="max-w-3xl mx-auto">
            <h2
              id="articulos-del-tratamiento"
              className="text-xl font-bold mb-6"
              style={{ color: "var(--primary-darkest)" }}
            >
              Artículos sobre {seoName}
            </h2>
            <ul className="flex flex-col gap-3">
              {relatedPosts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="flex items-baseline gap-3 text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ color: "var(--primary-darkest)" }}
                  >
                    <span aria-hidden="true" style={{ color: "var(--vintage-gold)" }}>→</span>
                    {/* Tercer consumidor del título del panel, y el que se me
                        escapó al sanear los otros dos: aquí salía «SUDORACIÓN
                        EXCESIVA EN AXILAS - BOTOX UNA SOLUCIÓN» gritando. */}
                    {normalizeHeadline(p.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Footer data={footerData} />
    </>
  )
}
