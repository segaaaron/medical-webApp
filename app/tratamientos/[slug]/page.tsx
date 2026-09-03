import DOMPurify from "isomorphic-dompurify"
import { seoTitleFor, searchAliasesFor } from "@/lib/seo/treatment-names"
import { buildMetaDescription } from "@/lib/seo/meta"
import { permanentRedirect } from "next/navigation"
import { backendFetch, resolveImageUrl, extractList } from "@/lib/backend-client"
import { safeJsonLd } from "@/lib/seo-utils"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getFooterData } from "@/lib/data/footer"
import { DEFAULTS, readContent } from "@/lib/store/content-store"
import { ArrowLeft, MessageCircle } from "lucide-react"
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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

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

/**
 * Sanea el cuerpo del tratamiento y degrada sus encabezados un nivel.
 *
 * El hero de la página ya pinta el `<h1>`. El contenido que la doctora escribe
 * en el panel viene casi siempre con su propio `<h1>` («Bótox – Toxina
 * Botulínica»), así que la página servía DOS h1 compitiendo por el mismo
 * término. Se degradan a `<h2>` para que quede una jerarquía única: un h1 con
 * el nombre del tratamiento y el resto colgando por debajo.
 */
function sanitizeBody(html: string): string {
  return DOMPurify.sanitize(html)
    .replace(/<h1(\s[^>]*)?>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>")
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const treatment = await getTreatment(slug)
  if (!treatment) return {}
  const description = buildMetaDescription(
    treatment.description ?? "",
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
    keywords: [
      ...aliases,
      ...aliases.slice(0, 2).map((a) => `${a} Cochabamba`),
      ...aliases.slice(0, 2).map((a) => `${a} precio Bolivia`),
      "medicina estética Cochabamba",
      "Dra. Yasmin Medrano Avila",
    ],
    alternates: { canonical: `${BASE_URL}/tratamientos/${slug}` },
    openGraph: {
      title: `${seoName} en Cochabamba | Dra. Yasmin Medrano Avila`,
      description,
      url: `${BASE_URL}/tratamientos/${slug}`,
      type: "website",
      images: treatment.imageUrl ? [{ url: treatment.imageUrl, width: 1200, height: 630, alt: `${seoName} — Dra. Yasmin Medrano Avila, Cochabamba` }] : [],
      locale: "es_BO",
    },
  }
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
            : `El precio de ${seoName} depende de la valoración de cada paciente: la zona a tratar y el producto necesario cambian el presupuesto. Escríbenos por WhatsApp y te damos el precio para tu caso.`,
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
    provider: {
      "@type": "Physician",
      name: "Dra. Yasmin Medrano Avila",
      url: BASE_URL,
      medicalSpecialty: "Medicina Estética",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Calle Paccieri #772, entre 16 de Julio y Antezana",
        addressLocality: "Cochabamba",
        addressRegion: "Cochabamba",
        addressCountry: "BO",
      },
    },
  }

  return (
    <>
      <Navbar links={navLinks} />
      <main style={{ backgroundColor: "#F8F0E3", minHeight: "100vh" }}>
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
              {treatment.price > 0 && (
                <p className="text-3xl font-bold mb-6" style={{ color: "var(--vintage-gold)" }}>
                  Bs. {treatment.price.toLocaleString("es-BO")}
                </p>
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
        </article>
      </main>
      {otherTreatments.length > 0 && (
        <section className="py-14 px-6" aria-labelledby="otros-tratamientos">
          <div className="container-xl max-w-4xl">
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

      <Footer data={footerData} />
    </>
  )
}
