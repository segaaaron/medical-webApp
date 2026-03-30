import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasminmedrano.com";

export const viewport = {
  themeColor: "#b5496a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Medicina Estética | Dra. Yasmin Medrano Avila",
    template: "%s | Dra. Yasmin Medrano Avila",
  },
  description:
    "Dra. Yasmin Medrano Avila — 10+ años en medicina estética. Botox, rellenos, bioestimulación y más. Resultados naturales, seguros y duraderos. ¡Consulta gratis!",
  keywords: [
    // Transaccionales locales — alta intención de compra
    "médico estético consulta gratis",
    "botox precio consulta",
    "rellenos labios ácido hialurónico",
    "armonización facial médico especialista",
    "bioestimuladores faciales polinucleótidos",
    "depilación láser definitiva mujer",
    "tratamiento manchas faciales médico",
    "rejuvenecimiento facial sin cirugía",
    "mesoterapia corporal reducción medidas",
    "medicina estética resultados naturales",
    // Informacionales / marca
    "Dra. Yasmin Medrano Avila",
    "medicina estética avanzada",
    "toxina botulínica",
    "bioestimulación",
    "peeling químico",
    "radiofrecuencia facial",
    "eliminación de manchas",
    "tratamiento celulitis",
    "tratamiento estrías",
    "consultorio medicina estética",
  ],
  authors: [{ name: "Dra. Yasmin Medrano Avila" }],
  creator: "Dra. Yasmin Medrano Avila",
  publisher: "Dra. Yasmin Medrano Avila",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: BASE_URL,
    siteName: "Dra. Yasmin Medrano Avila — Medicina Estética",
    title: "Medicina Estética | Dra. Yasmin Medrano Avila",
    description:
      "10+ años de experiencia en botox, rellenos, armonización facial y bioestimulación. Resultados naturales y seguros. ¡Agenda tu consulta gratis hoy!",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dra. Yasmin Medrano Avila — Medicina Estética Avanzada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Medicina Estética | Dra. Yasmin Medrano Avila",
    description:
      "Botox, rellenos, armonización facial y bioestimulación con una especialista de confianza. +5000 pacientes satisfechos. Consulta gratis este mes.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "health",
};

// JSON-LD structured data — Physician / MedicalBusiness
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalBusiness",
      "@id": `${BASE_URL}/#business`,
      name: "Consultorio Dra. Yasmin Medrano Avila",
      alternateName: "Medicina Estética Avanzada — Dra. Yasmin",
      url: BASE_URL,
      description:
        "Consultorio especializado en medicina estética. Ofrecemos tratamientos faciales y corporales seguros con tecnología de vanguardia.",
      priceRange: "$$",
      currenciesAccepted: "MXN, USD",
      paymentAccepted: "Efectivo, Tarjeta de crédito, Tarjeta de débito",
      medicalSpecialty: "https://schema.org/PlasticSurgery",
      availableService: [
        { "@type": "MedicalProcedure", name: "Toxina Botulínica (Botox)" },
        { "@type": "MedicalProcedure", name: "Rellenos con Ácido Hialurónico" },
        { "@type": "MedicalProcedure", name: "Rejuvenecimiento Facial" },
        { "@type": "MedicalProcedure", name: "Depilación Láser" },
        { "@type": "MedicalProcedure", name: "Mesoterapia Facial" },
        { "@type": "MedicalProcedure", name: "Radiofrecuencia Facial" },
        { "@type": "MedicalProcedure", name: "Tratamiento de Manchas" },
        { "@type": "MedicalProcedure", name: "Peeling Químico" },
        { "@type": "MedicalProcedure", name: "Reducción de Medidas" },
        { "@type": "MedicalProcedure", name: "Tratamiento de Celulitis" },
        { "@type": "MedicalProcedure", name: "Bioestimulación con Polinucleótidos" },
        { "@type": "MedicalProcedure", name: "Tratamiento de Estrías" },
      ],
      telephone: "+59178751894",
      sameAs: [
        "https://www.facebook.com/DraMedranoMedesteticAntiaging",
        "https://www.instagram.com/dra_yasmin.medrano",
      ],
    },
    {
      "@type": "Physician",
      "@id": `${BASE_URL}/#doctor`,
      name: "Dra. Yasmin Medrano Avila",
      jobTitle: "Médica Especialista en Medicina Estética",
      description:
        "Médica especialista en medicina estética con más de 10 años de experiencia y más de 5,000 pacientes atendidos. Experta en toxina botulínica, ácido hialurónico, armonización facial, bioestimulación y técnicas de vanguardia.",
      url: BASE_URL,
      telephone: "+59178751894",
      worksFor: { "@id": `${BASE_URL}/#business` },
      medicalSpecialty: "https://schema.org/PlasticSurgery",
      sameAs: [
        "https://www.facebook.com/DraMedranoMedesteticAntiaging",
        "https://www.instagram.com/dra_yasmin.medrano",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Dra. Yasmin Medrano Avila — Medicina Estética Avanzada",
      inLanguage: "es",
      publisher: { "@id": `${BASE_URL}/#business` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
