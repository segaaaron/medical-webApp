import DOMPurify from "isomorphic-dompurify"
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
import { WHATSAPP_TREATMENT_URL } from "@/lib/constants"
import { TreatmentPageTracker } from "@/components/analytics/TreatmentPageTracker"
import { TrackWhatsAppLink } from "@/components/analytics/TrackWhatsAppLink"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { EcgHero } from "@/components/ui/EcgHero"
import { BeforeAfter } from "@/components/sections/BeforeAfter"
import { FaqPrompt } from "@/components/ui/FaqPrompt"

export const revalidate = 300 // 5 minutos — ISR; fuerza refresco si el admin edita el tratamiento

export async function generateStaticParams() {
  try {
    const { data } = await backendFetch<BackendTreatment[]>("/treatments?active=true", { revalidate: 3600 })
    return extractList<BackendTreatment>(data).map((t) => ({ id: t.id }))
  } catch {
    return []
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

interface BackendTreatment {
  id: string
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
}

async function getTreatment(id: string): Promise<BackendTreatment | null> {
  const { data, error } = await backendFetch<BackendTreatment>(`/treatments/${id}`, { revalidate: 300 })
  if (error || !data) return null
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
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const treatment = await getTreatment(id)
  if (!treatment) return {}
  const description = treatment.description
    ? treatment.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
    : `Conoce más sobre ${treatment.name} en el consultorio de la Dra. Yasmin Medrano Avila.`

  return {
    title: `${treatment.name} | Dra. Yasmin Medrano Avila`,
    description,
    keywords: [
      treatment.name,
      `${treatment.name} Cochabamba`,
      `${treatment.name} Bolivia`,
      "medicina estética Cochabamba",
      "tratamiento estético Bolivia",
      "Dra. Yasmin Medrano Avila",
      "consulta gratis medicina estética",
    ],
    alternates: { canonical: `${BASE_URL}/tratamientos/${id}` },
    openGraph: {
      title: `${treatment.name} en Cochabamba | Dra. Yasmin Medrano Avila`,
      description,
      url: `${BASE_URL}/tratamientos/${id}`,
      type: "website",
      images: treatment.imageUrl ? [{ url: treatment.imageUrl, width: 1200, height: 630, alt: `${treatment.name} — Dra. Yasmin Medrano Avila Cochabamba` }] : [],
      locale: "es_BO",
    },
  }
}

export default async function TratamientoDetallePage({ params }: Props) {
  const { id } = await params
  const [treatment, footerData, c] = await Promise.all([
    getTreatment(id),
    getFooterData(),
    readContent(),
  ])

  if (!treatment || !treatment.active) notFound()

  const navLinks = c?.navLinks ?? DEFAULTS.navLinks

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Tratamientos", item: `${BASE_URL}/tratamientos` },
      { "@type": "ListItem", position: 3, name: treatment.name },
    ],
  }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `¿Cuánto cuesta ${treatment.name} en Cochabamba?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: treatment.price > 0
            ? `El precio de ${treatment.name} en nuestro consultorio es Bs. ${treatment.price.toLocaleString("es-BO")}. Agenda una consulta gratuita para un presupuesto personalizado.`
            : `El precio de ${treatment.name} varía según cada paciente. Agenda una consulta de valoración gratuita con la Dra. Yasmin Medrano para un presupuesto personalizado.`,
        },
      },
      {
        "@type": "Question",
        name: `¿Es seguro el tratamiento de ${treatment.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Sí. ${treatment.name} es realizado por la Dra. Yasmin Medrano Avila, médica especialista certificada con más de 10 años de experiencia en medicina estética en Cochabamba, Bolivia.`,
        },
      },
      {
        "@type": "Question",
        name: `¿Dónde puedo realizarme ${treatment.name} en Cochabamba?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Puedes realizarte ${treatment.name} en el consultorio de la Dra. Yasmin Medrano Avila, ubicado en Cochabamba, Bolivia. Contáctanos por WhatsApp para agendar tu consulta gratuita.`,
        },
      },
    ],
  }

  const procedureImages = [treatment.imageUrl, treatment.beforeImageUrl, treatment.afterImageUrl].filter(Boolean)

  const procedureLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: treatment.name,
    description: (treatment.description ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300),
    url: `${BASE_URL}/tratamientos/${id}`,
    ...(procedureImages.length ? { image: procedureImages } : {}),
    provider: {
      "@type": "Physician",
      name: "Dra. Yasmin Medrano Avila",
      url: BASE_URL,
      medicalSpecialty: "Medicina Estética",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cochabamba",
        addressCountry: "BO",
      },
    },
  }

  return (
    <>
      <Navbar links={navLinks} />
      <main style={{ backgroundColor: "#F8F0E3", minHeight: "100vh" }}>
        <TreatmentPageTracker id={id} name={treatment.name} />
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
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(treatment.description) }}
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
                ¿Te interesa este tratamiento? Agenda una consulta gratuita con la Dra. Yasmin Medrano Avila.
              </p>
              {treatment.price > 0 && (
                <p className="text-3xl font-bold mb-6" style={{ color: "var(--vintage-gold)" }}>
                  Bs. {treatment.price.toLocaleString("es-BO")}
                </p>
              )}
              <TrackWhatsAppLink
                href={WHATSAPP_TREATMENT_URL(treatment.name)}
                source="treatment-detail-cta"
                treatment={treatment.name}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ backgroundColor: "var(--vintage-gold)" }}
              >
                <MessageCircle size={16} aria-hidden="true" />
                {treatment.price > 0 ? "Agendar consulta gratuita" : "Consultar por WhatsApp"}
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
      <Footer data={footerData} />
    </>
  )
}
