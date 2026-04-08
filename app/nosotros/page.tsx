import { readContent } from "@/lib/store/content-store"
import { backendFetch } from "@/lib/backend-client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AboutSection } from "@/components/sections/AboutSection"
import { ValuePropositionSection } from "@/components/sections/ValuePropositionSection"
import { socialLinks } from "@/lib/data/navigation"
import type { Metadata } from "next"
import type { AboutStat, ValueFeature } from "@/types"

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAboutApiToContent(raw: any): { bio: string[]; stats: AboutStat[]; valueFeatures: ValueFeature[] } | null {
  if (!raw || raw.error) return null

  const bio = raw.descriptionDoc
    ? [raw.descriptionDoc]
    : null

  const stats: AboutStat[] = []
  if (raw.stat1Value && raw.stat1Label) stats.push({ value: raw.stat1Value, label: raw.stat1Label })
  if (raw.stat2Value && raw.stat2Label) stats.push({ value: raw.stat2Value, label: raw.stat2Label })
  if (raw.stat3Value && raw.stat3Label) stats.push({ value: raw.stat3Value, label: raw.stat3Label })

  const iconNames = ["Eye", "Award", "Zap", "TrendingUp"] as const
  const valueFeatures: ValueFeature[] = []
  for (let n = 1; n <= 4; n++) {
    const title = raw[`feature${n}Title`]
    const description = raw[`feature${n}Description`]
    if (title && description) {
      valueFeatures.push({ iconName: iconNames[n - 1], title, description })
    }
  }

  if (!bio && stats.length === 0 && valueFeatures.length === 0) return null

  return {
    bio: bio ?? [],
    stats: stats.length > 0 ? stats : [],
    valueFeatures: valueFeatures.length > 0 ? valueFeatures : [],
  }
}

function mapAboutApiToData(raw: any): { bio: BioDoc; stats: BioSection} | null {
  const bio: BioDoc = {
    doctorTitle: raw.sectionLabel,
    doctorName: raw.doctorName,
    doctorDescription: raw.descriptionDoc,
    doctorImage: raw.imageUrl,
    badgeDoctor: raw.experienceBadgeValue,
    experienceInfoLabel: raw.stat1Label,
    experienceInfoValue: raw.stat1Value,
    pacientsLabel: raw.stat2Label,
    pacientValue: raw.stat2Value,
    treatmentLabel: raw.stat3Label,
    treatmentValue: raw.stat3Value
  }
  const stats: BioSection = {
    chooseUs: raw.whyChooseUsLabel,
    title: raw.whyChooseUsTitle,
    description: raw.whyChooseUsDescription,
    card1Title: raw.feature1Title,
    card1Description: raw.feature1Description,
    card2Title: raw.feature2Title,
    card2Description: raw.feature2Description,
    card3Title: raw.feature3Title,
    card3Description: raw.feature3Description,
    card4Title: raw.feature4Title,
    card4Description: raw.feature4Description
  }
  return {
    bio: bio,
    stats: stats,
  }
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
  const c = await readContent()

  const { data: aboutData } = await backendFetch("/about")
  const apiContent = mapAboutApiToContent(aboutData)
  const dataService = mapAboutApiToData(aboutData)

  const bio = apiContent?.bio?.length ? apiContent.bio : c.about.bio
  const stats = apiContent?.stats?.length ? apiContent.stats : c.about.stats
  const features = apiContent?.valueFeatures?.length ? apiContent.valueFeatures : c.valueFeatures
  console.log('DATA ABOUTUS ===>', dataService)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <Navbar links={c.navLinks} />
      <main>
        {/* Page hero */}
        <div className="py-16 px-6 text-center" style={{ backgroundColor: "#1a0510" }}>
          <p className="text-sm uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: "#e8a0b4" }}>
            Nuestra Historia
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Sobre Nosotros</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#fce4ec" }}>
            Dedicados a realzar tu belleza natural con los más altos estándares médicos y un trato completamente personalizado.
          </p>
        </div>

        <AboutSection bio={dataService?.bio ?? null} />
        <ValuePropositionSection features={dataService?.stats ?? null} />
      </main>
      <Footer groups={c.footerGroups} socials={socialLinks} />
    </>
  )
}
