import { backendFetch, resolveImageUrl } from "@/lib/backend-client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getFooterData } from "@/lib/data/footer"
import { DEFAULTS, readContent } from "@/lib/store/content-store"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { WHATSAPP_TREATMENT_URL } from "@/lib/constants"

export const dynamic = "force-dynamic"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

interface BackendTreatment {
  id: string
  name: string
  description: string | null
  price: number
  tag: string | null
  imageUrl: string | null
  image_url: string | null
  active: boolean
}

async function getTreatment(id: string): Promise<BackendTreatment | null> {
  const { data, error } = await backendFetch<BackendTreatment>(`/treatments/${id}`)
  if (error || !data) return null
  return {
    ...data,
    imageUrl: resolveImageUrl((data.imageUrl ?? data.image_url) as string | null),
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
    alternates: { canonical: `${BASE_URL}/tratamientos/${id}` },
    openGraph: {
      title: treatment.name,
      description,
      url: `${BASE_URL}/tratamientos/${id}`,
      type: "website",
      images: treatment.imageUrl ? [{ url: treatment.imageUrl, width: 1200, height: 630, alt: treatment.name }] : [],
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

  return (
    <>
      <Navbar links={navLinks} />
      <main style={{ backgroundColor: "#fff", minHeight: "100vh" }}>

        {/* Back link */}
        <div className="max-w-3xl mx-auto px-6 pt-6">
          <Link
            href="/tratamientos"
            className="inline-flex items-center gap-2 text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ color: "#b5496a" }}
          >
            <ArrowLeft size={14} /> Volver a tratamientos
          </Link>
        </div>

        <article className="py-8 px-6">
          <div className="max-w-3xl mx-auto">

            {/* Tag */}
            {treatment.tag && (
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide"
                style={{ backgroundColor: "#fce4ec", color: "#b5496a" }}
              >
                {treatment.tag}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4" style={{ color: "#3a0f20" }}>
              {treatment.name}
            </h1>

            <div className="pb-6 mb-6 border-b" style={{ borderColor: "#f0e0e6" }} />

            {/* Cover image */}
            {treatment.imageUrl && (
              <div className="w-full rounded-2xl overflow-hidden mb-8" style={{ backgroundColor: "#f5edf0" }}>
                <img
                  src={treatment.imageUrl}
                  alt={treatment.name}
                  className="w-full h-auto block"
                  loading="eager"
                />
              </div>
            )}

            {/* Description */}
            {treatment.description && (
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: treatment.description }}
              />
            )}

            {/* CTA bottom */}
            <div
              className="mt-10 p-6 rounded-2xl text-center"
              style={{ backgroundColor: "#fdf0f4", border: "1px solid #f0dde4" }}
            >
              <p className="text-sm font-medium mb-2" style={{ color: "#3a0f20" }}>
                ¿Te interesa este tratamiento? Agenda una consulta gratuita con la Dra. Yasmin Medrano Avila.
              </p>
              {treatment.price > 0 && (
                <p className="text-2xl font-bold mb-4" style={{ color: "#b5496a" }}>
                  Bs. {treatment.price.toLocaleString("es-BO")}
                </p>
              )}
              <a
                href={WHATSAPP_TREATMENT_URL(treatment.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #b5496a, #8f3452)" }}
              >
                {treatment.price > 0 ? "Agendar consulta gratuita" : "Consultar precio por WhatsApp"}
              </a>
            </div>
          </div>
        </article>
      </main>
      <Footer data={footerData} />
    </>
  )
}
