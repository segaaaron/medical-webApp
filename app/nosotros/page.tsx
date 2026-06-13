import { getAboutData } from "@/lib/data/about"
import { getFooterData } from "@/lib/data/footer"
import { readContent } from "@/lib/store/content-store"
import { backendFetch, extractList } from "@/lib/backend-client"
import { safeJsonLd } from "@/lib/seo-utils"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AboutSection } from "@/components/sections/AboutSection"
import { PageHero } from "@/components/ui/PageHero"
import { ValuePropositionSection } from "@/components/sections/ValuePropositionSection"
import { TestimonialsSection, type PublicReview } from "@/components/sections/TestimonialsSection"
import type { Metadata } from "next"

export type { BioDoc, BioSection } from "@/types/about"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

export const metadata: Metadata = {
  title: "Dra. Yasmin Medrano Avila — Especialista Medicina Estética Cochabamba",
  description:
    "Dra. Yasmin Medrano Avila — médica especialista en Cochabamba. +5.000 pacientes, 10+ años de experiencia. Botox, rellenos, armonización facial. ¡Consulta GRATIS!",
  keywords: [
    "Dra. Yasmin Medrano Avila Cochabamba",
    "médica estética Bolivia especialista",
    "doctora botox Cochabamba certificada",
    "médico estético experiencia Bolivia",
    "especialista rellenos ácido hialurónico Cochabamba",
    "armonización facial médico Bolivia",
    "bioestimulación facial Cochabamba",
    "médico estética confiable Bolivia",
    "doctora rejuvenecimiento facial Cochabamba",
    "mejor médica estética Bolivia",
  ],
  alternates: {
    canonical: `${BASE_URL}/nosotros`,
  },
  openGraph: {
    title: "Dra. Yasmin Medrano Avila — 10 Años Transformando Vidas en Bolivia",
    description:
      "⭐ +5.000 pacientes felices en Cochabamba. Médica especialista certificada en botox natural, rellenos y rejuvenecimiento facial. Resultados que hablan por sí solos.",
    url: `${BASE_URL}/nosotros`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Dra. Yasmin Medrano Avila — Especialista Medicina Estética Cochabamba Bolivia" }],
    type: "profile",
    locale: "es_BO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dra. Yasmin Medrano Avila | +5.000 Pacientes en Bolivia ⭐",
    description:
      "10+ años de experiencia en Cochabamba. Botox natural, rellenos y rejuvenecimiento facial con resultados reales. ¡Agenda tu consulta GRATIS hoy!",
    images: ["/og-image.jpg"],
  },
}

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Nosotros", item: `${BASE_URL}/nosotros` },
  ],
}

function buildAboutJsonLd(reviews: PublicReview[]) {
  const hasReviews = reviews.length > 0
  const avgRating = hasReviews
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Physician",
      name: "Dra. Yasmin Medrano Avila",
      jobTitle: "Médica Especialista en Medicina Estética — Cochabamba, Bolivia",
      description:
        "Médica especialista en medicina estética con más de 10 años de experiencia en Cochabamba, Bolivia. Experta en toxina botulínica, ácido hialurónico, armonización facial, bioestimulación con polinucleótidos y técnicas de rejuvenecimiento facial avanzadas.",
      url: `${BASE_URL}/nosotros`,
      image: `${BASE_URL}/images/DraMedrano.jpeg`,
      telephone: "+59178751894",
      medicalSpecialty: "Medicina Estética",
      knowsAbout: [
        "Toxina Botulínica",
        "Ácido Hialurónico",
        "Armonización Facial",
        "Bioestimulación con Polinucleótidos",
        "Depilación Láser",
        "Mesoterapia Facial",
        "Radiofrecuencia Facial",
        "Peeling Químico",
        "Rejuvenecimiento Facial",
      ],
      hasOccupation: {
        "@type": "Occupation",
        name: "Médica Especialista en Medicina Estética",
        occupationLocation: {
          "@type": "City",
          name: "Cochabamba",
          containedInPlace: { "@type": "Country", name: "Bolivia" },
        },
      },
      ...(hasReviews && avgRating ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating,
          reviewCount: String(reviews.length),
          bestRating: "5",
          worstRating: "1",
        },
      } : {}),
      sameAs: [
        "https://www.facebook.com/DraMedranoMedesteticAntiaging",
        "https://www.instagram.com/dra_yasmin.medrano",
      ],
    },
  }
}

export default async function NosotrosPage() {
  const [c, footerData, aboutData, reviewsResult] = await Promise.all([
    readContent(),
    getFooterData(),
    getAboutData(),
    backendFetch<PublicReview[]>("/reviews?status=approved&limit=6", { revalidate: 300 }),
  ])

  const approvedReviews = reviewsResult.error === null
    ? extractList<PublicReview>(reviewsResult.data)
    : []
  const reviewAggregate = approvedReviews.length > 0
    ? {
        avg_rating: approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length,
        total_count: approvedReviews.length,
      }
    : undefined

  const aboutJsonLd = buildAboutJsonLd(approvedReviews)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutJsonLd) }}
      />
      <Navbar links={c.navLinks} />
      <main>
        <PageHero
          eyebrow="Nuestra Historia"
          title="Sobre Nosotros"
          subtitle="Dedicados a realzar tu belleza natural con los más altos estándares médicos y un trato completamente personalizado."
        />
        <AboutSection bio={aboutData.bio} />
        <ValuePropositionSection features={aboutData.features} />
        <TestimonialsSection
          reviews={approvedReviews.length > 0 ? approvedReviews : undefined}
          aggregate={reviewAggregate}
        />
      </main>
      <Footer data={footerData} />
    </>
  )
}
