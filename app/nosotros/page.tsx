import { getAboutData } from "@/lib/data/about"
import { getFooterData } from "@/lib/data/footer"
import { getHomeData } from "@/lib/data/home"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AboutSection } from "@/components/sections/AboutSection"
import { PageHero } from "@/components/ui/PageHero"
import { ValuePropositionSection } from "@/components/sections/ValuePropositionSection"
import type { Metadata } from "next"

export interface BioDoc {
  doctorTitle: string,
  doctorName: string,
  doctorDescription: string,
  doctorImage: string,
  badgeDoctor: string,
  experienceInfoLabel: string,
  experienceInfoValue: string,
  pacientsLabel: string,
  pacientValue: string,
  treatmentLabel: string,
  treatmentValue: string
}

export interface BioSection {
  chooseUs: string,
  title: string,
  description: string,
  card1Title: string,
  card1Description: string,
  card2Title: string,
  card2Description: string
  card3Title: string,
  card3Description: string
  card4Title: string,
  card4Description: string
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

export const metadata: Metadata = {
  title: "Sobre la Dra. Yasmin Medrano Avila - Especialista en Medicina Estetica",
  description:
    "Conoce a la Dra. Yasmin Medrano Avila, medica especialista en medicina estetica con mas de 10 anos de experiencia, mas de 5000 pacientes atendidos. Experta en botox, rellenos y rejuvenecimiento facial.",
  keywords: [
    "Dra. Yasmin Medrano Avila",
    "medica estetica Bolivia",
    "especialista medicina estetica",
    "doctora botox",
    "medico estetico experiencia",
  ],
  alternates: {
    canonical: `${BASE_URL}/nosotros`,
  },
  openGraph: {
    title: "Sobre la Dra. Yasmin Medrano Avila | Medicina Estetica",
    description:
      "Mas de 10 anos de experiencia y 5000 pacientes atendidos. Especialista en botox, rellenos y rejuvenecimiento facial.",
    url: `${BASE_URL}/nosotros`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Dra. Yasmin Medrano Avila - Especialista en Medicina Estetica" }],
    type: "profile",
    locale: "es_BO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dra. Yasmin Medrano Avila | Medicina Estetica",
    description:
      "10+ anos de experiencia en medicina estetica. Botox, rellenos, rejuvenecimiento facial. Consulta gratuita.",
    images: ["/og-image.jpg"],
  },
}

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Physician",
    name: "Dra. Yasmin Medrano Avila",
    jobTitle: "Medica Especialista en Medicina Estetica",
    description: "Medica especialista en medicina estetica con mas de 10 anos de experiencia y mas de 5,000 pacientes atendidos.",
    url: `${BASE_URL}/nosotros`,
    image: `${BASE_URL}/images/DraMedrano.jpeg`,
    telephone: "+59178751894",
    medicalSpecialty: "https://schema.org/PlasticSurgery",
    sameAs: [
      "https://www.facebook.com/DraMedranoMedesteticAntiaging",
      "https://www.instagram.com/dra_yasmin.medrano",
    ],
  },
}

export default async function NosotrosPage() {
  const [{ navLinks }, footerData, aboutData] = await Promise.all([
    getHomeData(),
    getFooterData(),
    getAboutData(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <Navbar links={navLinks} />
      <main>
        <PageHero
          eyebrow="Nuestra Historia"
          title="Sobre Nosotros"
          subtitle="Dedicados a realzar tu belleza natural con los más altos estándares médicos y un trato completamente personalizado."
        />

        <AboutSection bio={aboutData.bio} />
        <ValuePropositionSection features={aboutData.features} />
      </main>
      <Footer data={footerData} />
    </>
  )
}
