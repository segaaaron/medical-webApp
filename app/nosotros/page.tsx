import { getAbout, statsClaim } from "@/lib/content/about"
import { BASE_URL } from "@/lib/seo/site-url"
import { getFooter } from "@/lib/content/footer"
import { getNavLinks } from "@/lib/content/site-main"
import { getReviews, type PublicReview, type ReviewAggregate } from "@/lib/content/reviews"
import { getActiveTreatments } from "@/lib/content/treatments"
import { getContact, businessContactOf } from "@/lib/content/contact"
import { getSiteSeo } from "@/lib/content/seo"
import { doctorKnowsAbout, type TreatmentRef } from "@/lib/seo/treatment-names"
import { normalizeSocialUrl, pageSeoMetadata } from "@/lib/seo/meta"
import { safeJsonLd } from "@/lib/seo-utils"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AboutSection } from "@/components/sections/AboutSection"
import { GallerySection } from "@/components/sections/GallerySection"
import { PageHero } from "@/components/ui/PageHero"
import { ValuePropositionSection } from "@/components/sections/ValuePropositionSection"
import { TestimonialsSection } from "@/components/sections/TestimonialsSection"
import type { Metadata } from "next"

export type { BioDoc, BioSection } from "@/types/about"


export async function generateMetadata(): Promise<Metadata> {
  const { nosotros } = await getSiteSeo()
  return pageSeoMetadata(nosotros, {
    canonical: `${BASE_URL}/nosotros`,
    ogImageAlt: "Dra. Yasmin Medrano Avila — Medicina estética en Cochabamba, Bolivia",
    ogType: "profile",
  })
}

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Nosotros", item: `${BASE_URL}/nosotros` },
  ],
}

function buildAboutJsonLd(
  reviews: PublicReview[],
  aggregate: ReviewAggregate | null,
  treatments: TreatmentRef[],
  perfiles: string[],
  // Teléfono de Dashboard → Contacto (o de su respaldo entero).
  telephone: string,
  // Estadísticas de Dashboard → Acerca de como frase; "" = se omite.
  claim: string
) {

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Physician",
      // MISMO `@id` que la ficha del layout. Sin él esta página declaraba una
      // SEGUNDA doctora, homónima y sin relación con la del resto del sitio:
      // para Google eran dos entidades distintas y las señales de autoridad
      // —reseñas incluidas— se repartían entre ambas en vez de sumar.
      "@id": `${BASE_URL}/#doctor`,
      name: "Dra. Yasmin Medrano Avila",
      jobTitle: "Médica Especialista en Medicina Estética — Cochabamba, Bolivia",
      description: `Médica especialista en medicina estética en Cochabamba, Bolivia${claim ? `, con ${claim}` : ""}.`,
      url: `${BASE_URL}/nosotros`,
      image: `${BASE_URL}/images/DraMedrano.jpeg`,
      ...(telephone ? { telephone } : {}),
      medicalSpecialty: "Medicina Estética",
      // Derivado del panel: la lista fija incluía armonización facial y
      // depilación láser, que el consultorio no ofrece.
      knowsAbout: doctorKnowsAbout(treatments),
      hasOccupation: {
        "@type": "Occupation",
        name: "Médica Especialista en Medicina Estética",
        occupationLocation: {
          "@type": "City",
          name: "Cochabamba",
          containedInPlace: { "@type": "Country", name: "Bolivia" },
        },
      },
      ...(reviews.length > 0 && aggregate ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: aggregate.avg_rating.toFixed(1),
          reviewCount: String(aggregate.total_count),
          bestRating: "5",
          worstRating: "1",
        },
      } : {}),
      // Perfiles del panel, no escritos a mano: la lista fija se quedó sin
      // TikTok y contradecía la del layout sobre la misma entidad.
      sameAs: perfiles,
    },
  }
}

export default async function NosotrosPage() {
  const [navLinks, footerData, about, reviews, treatments, contact] = await Promise.all([
    getNavLinks(),
    getFooter(),
    getAbout(),
    getReviews(),
    getActiveTreatments(),
    getContact(),
  ])
  const aboutData = about.data
  const { reviews: approvedReviews, aggregate: reviewAggregate } = reviews.data

  const perfilesSociales = [
    footerData.facebookUrl,
    footerData.instagramUrl,
    footerData.tiktokUrl,
  ]
    .map(normalizeSocialUrl)
    .filter(Boolean)

  const aboutJsonLd = buildAboutJsonLd(
    approvedReviews,
    reviewAggregate,
    treatments.data,
    perfilesSociales,
    businessContactOf(contact.data).telephone,
    statsClaim(aboutData.stats)
  )

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
      <Navbar links={navLinks} />
      <main>
        <PageHero
          eyebrow="Nuestra Historia"
          title="Sobre Nosotros"
          subtitle="Dedicados a realzar tu belleza natural con los más altos estándares médicos y un trato completamente personalizado."
        />
        <AboutSection bio={aboutData.bio} />
        <GallerySection images={aboutData.gallery} />
        <ValuePropositionSection features={aboutData.features} />
        <TestimonialsSection
          reviews={approvedReviews.length > 0 ? approvedReviews : undefined}
          aggregate={reviewAggregate ?? undefined}
        />
      </main>
      <Footer data={footerData} />
    </>
  )
}
