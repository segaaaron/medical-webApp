import { BASE_URL } from "@/lib/seo/site-url"
import { sanitizeBody } from "@/lib/html/sanitize"
import { AREA_SERVED, phoneFromWhatsApp, formatPhone } from "@/lib/seo/local"
import { bodyLocationsFor, concernsFor, derivedKeywords, concernSentence } from "@/lib/seo/vocabulary"
import { AuthorBox } from "@/components/blog/AuthorBox"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { normalizeSocialUrl } from "@/lib/seo/meta"
import { seoTitleFor, searchAliasesFor, displayNameFor, alternateNamesFor, matchTreatmentsInText, normalizeHeadline } from "@/lib/seo/treatment-names"
import { buildMetaDescription } from "@/lib/seo/meta"
import { permanentRedirect } from "next/navigation"
import {
  getActiveTreatments,
  getTreatmentById,
  getTreatmentBySlug,
  type Treatment,
} from "@/lib/content/treatments"
import { getPosts } from "@/lib/content/blog"
import { getAbout, statsClaim } from "@/lib/content/about"
import { getWhatsApp } from "@/lib/content/contact"
import { getNavLinks } from "@/lib/content/site-main"
import { safeJsonLd } from "@/lib/seo-utils"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getFooter } from "@/lib/content/footer"
import { ArrowLeft, MessageCircle, Phone } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { TreatmentPageTracker } from "@/components/analytics/TreatmentPageTracker"
import { TrackWhatsAppLink } from "@/components/analytics/TrackWhatsAppLink"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { EcgHero } from "@/components/ui/EcgHero"
import { BeforeAfter } from "@/components/sections/BeforeAfter"
import { FaqPrompt } from "@/components/ui/FaqPrompt"

export const revalidate = 300 // 5 minutos — ISR; fuerza refresco si el admin edita el tratamiento

export async function generateStaticParams() {
  const { data } = await getActiveTreatments()
  return data.map((t) => ({ slug: t.slug }))
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Resuelve un tratamiento por su slug.
 *
 * Las URLs eran `/tratamientos/<uuid>`: sin palabra clave e ilegibles al
 * compartirse. Si llega un UUID —enlaces antiguos ya indexados— se responde
 * con un 301 al slug, que conserva el posicionamiento ganado. Se pregunta por
 * el id directamente (no en la lista de activos) para que el 301 funcione
 * también con un tratamiento hoy desactivado.
 */
async function getTreatment(slug: string): Promise<Treatment | null> {
  if (UUID_RE.test(slug)) {
    const byId = await getTreatmentById(slug)
    if (byId) permanentRedirect(`/tratamientos/${byId.slug}`)
    return null
  }
  return getTreatmentBySlug(slug)
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
  // Dashboard → SEO / Google manda; vacía = se deriva de la ficha.
  const description = treatment.seoDescription
    ? treatment.seoDescription
    : buildMetaDescription(
        `${indicaciones} ${treatment.description}`.trim(),
        " Consulta de valoración en Cochabamba con la Dra. Yasmin Medrano."
      )

  // El título NO usa el nombre crudo del panel (MAYÚSCULAS, comillas, nombre
  // clínico que nadie teclea): usa el `seoTitle` de la ficha («Botox») o, sin
  // él, el nombre normalizado. Ver lib/seo/treatment-names.ts.
  const seoName = seoTitleFor(treatment)
  const aliases = searchAliasesFor(treatment)
  const imagen = treatment.ogImageUrl ? treatment.ogImageUrl : treatment.imageUrl

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
      ...(imagen
        ? { images: [{ url: imagen, width: 1200, height: 630, alt: `${seoName} — Dra. Yasmin Medrano Avila, Cochabamba` }] }
        : {}),
      locale: "es_BO",
    },
  }
}

export default async function TratamientoDetallePage({ params }: Props) {
  const { slug } = await params
  const [treatment, footerData, navLinks, whatsapp, activos, posts, about] = await Promise.all([
    getTreatment(slug),
    getFooter(),
    getNavLinks(),
    getWhatsApp(),
    getActiveTreatments(),
    getPosts(),
    getAbout(),
  ])

  if (!treatment || !treatment.active) notFound()

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
  const seoName = seoTitleFor(treatment)
  const trayectoria = statsClaim(about.data.stats)
  // Lo que ve el paciente es el nombre del panel; `seoName` solo va a metadatos.
  const displayName = displayNameFor(treatment)

  // Otros tratamientos, para enlazar entre fichas.
  //
  // Cada página de tratamiento era un callejón sin salida: no enlazaba a
  // ninguna otra. Eso desperdicia dos cosas — el paciente que descarta un
  // procedimiento se va del sitio en vez de mirar el siguiente, y la autoridad
  // que gana una ficha no se reparte hacia las demás. Reutiliza el mismo fetch
  // cacheado de `getActiveTreatments`, así que no añade ninguna llamada al backend.
  const otherTreatments = activos.data.filter((t) => t.slug !== slug).slice(0, 3)

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
  const relatedPosts = posts.data
    .filter((p) => {
      const texto = `${p.title} ${p.excerpt} ${p.content}`.replace(/<[^>]+>/g, " ")
      return matchTreatmentsInText(texto, activos.data, 5).includes(slug)
    })
    .slice(0, 3)

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Tratamientos", item: `${BASE_URL}/tratamientos` },
      { "@type": "ListItem", position: 3, name: displayName },
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
            : `El precio de ${seoName} depende de la valoración de cada paciente: la zona a tratar y el producto necesario cambian el presupuesto. ${telefono ? `Escribe al ${formatPhone(telefono)} por WhatsApp` : "Escríbenos por WhatsApp"} y te damos el precio para tu caso.`,
        },
      },
      {
        "@type": "Question",
        name: `¿Es seguro el tratamiento de ${seoName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${seoName} lo realiza la Dra. Yasmin Medrano Avila, médica especialista en medicina estética en Cochabamba, Bolivia${trayectoria ? `, con ${trayectoria}` : ""}, siguiendo protocolos médicos certificados.`,
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
  const revisado = new Date(treatment.updatedAt || treatment.createdAt)
  const revisadoEl = Number.isNaN(revisado.getTime()) ? null : revisado

  const procedureLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    reviewedBy: { "@id": `${BASE_URL}/#doctor` },
    ...(revisadoEl ? { lastReviewed: revisadoEl.toISOString().slice(0, 10) } : {}),
    medicalAudience: { "@type": "MedicalAudience", audienceType: "Patient" },
    name: displayName,
    // El nombre real del panel es el principal, y los términos por los que la
    // gente busca de verdad entran como alternativos: es la forma que entiende
    // Google de «esta página también trata de esto».
    ...(alternateNamesFor(treatment).length ? { alternateName: alternateNamesFor(treatment) } : {}),
    description: treatment.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300),
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
            { label: displayName },
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
                  style={{ color: "var(--prem-accent-ink)", fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.22em" }}
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

              <p className="mt-5 text-center text-xs" style={{ color: "rgba(58,15,32,0.75)" }}>
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
                  {telefono && (
                    <a
                      href={`tel:${telefono}`}
                      className="inline-flex items-center gap-2 text-base font-semibold hover:opacity-80 transition-opacity py-2 -my-2"
                      style={{ color: "#fff" }}
                    >
                      <Phone size={16} aria-hidden="true" />
                      {formatPhone(telefono)}
                    </a>
                  )}
                </div>
              )}
              <TrackWhatsAppLink
                href={`${whatsapp.url}?text=${encodeURIComponent(`Hola, me interesa el tratamiento de ${treatment.name}`)}`}
                source="treatment-detail-cta"
                treatment={treatment.name}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-sm font-bold transition-all hover:brightness-110"
                // Texto vino sobre oro (5.9:1). Blanco sobre oro daba 2.8:1.
                style={{ backgroundColor: "var(--vintage-gold)", color: "var(--primary-darkest)" }}
              >
                <MessageCircle size={16} aria-hidden="true" />
                {treatment.price > 0 ? "Agendar consulta" : "Consultar por WhatsApp"}
              </TrackWhatsAppLink>
              <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.6)" }}>
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
              publishedAt={treatment.createdAt}
              updatedAt={treatment.updatedAt}
              perfiles={perfilesSociales}
              credentials={trayectoria}
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
                    {displayNameFor(t)}
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
              Artículos sobre {displayName}
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
