import { getAbout } from "@/lib/content/about"
import { BASE_URL } from "@/lib/seo/site-url"
import { getFooter } from "@/lib/content/footer"
import { getNavLinks } from "@/lib/content/site-main"
import { getReviews } from "@/lib/content/reviews"
import { getActiveTreatments } from "@/lib/content/treatments"
import { getSiteSeo } from "@/lib/content/seo"
import { doctorKnowsAbout, type TreatmentRef } from "@/lib/seo/treatment-names"
import { pageSeoMetadata } from "@/lib/seo/meta"
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

/**
 * `ProfilePage` de la doctora.
 *
 * Solo necesita los tratamientos: el resto de su identidad —nombre, foto,
 * teléfono, descripción, perfiles— la declara el `@graph` del layout en todas
 * las páginas bajo el mismo `@id`, y repetirla aquí es lo que producía valores
 * contradictorios sobre una misma entidad.
 */
function buildAboutJsonLd(treatments: TreatmentRef[]) {

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
      // ──────────────────────────────────────────────────────────────────────
      // SOLO LO QUE EL LAYOUT NO DECLARA.
      //
      // El `@id` compartido ya estaba bien resuelto, pero este nodo seguía
      // repitiendo name, description, url, image, telephone, medicalSpecialty
      // y sameAs — y el `jobTitle` CONTRADECÍA al del layout sobre el mismo
      // `@id`:
      //
      //   layout:   "Médica Especialista en Medicina Estética"
      //   nosotros: "Médica Especialista en Medicina Estética — Cochabamba, Bolivia"
      //
      // Un `@id` con dos valores distintos para la misma propiedad en la misma
      // carga de página no refuerza la entidad: la hace ambigua. El layout es
      // la fuente; aquí solo se añade lo que esta página sabe y él no.
      // ──────────────────────────────────────────────────────────────────────
      //
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
    },
  }
}

export default async function NosotrosPage() {
  const [navLinks, footerData, about, reviews, treatments] = await Promise.all([
    getNavLinks(),
    getFooter(),
    getAbout(),
    getReviews(),
    getActiveTreatments(),
  ])
  const aboutData = about.data
  const { reviews: approvedReviews, aggregate: reviewAggregate } = reviews.data

  const aboutJsonLd = buildAboutJsonLd(treatments.data)

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
