import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://drayasminmedrano.com";

export const viewport = {
  themeColor: "#b5496a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Dra. Yasmin Medrano Avila | Medicina Estética Avanzada",
    template: "%s | Dra. Yasmin Medrano Avila",
  },
  description:
    "Consultorio de medicina estética de la Dra. Yasmin Medrano Avila. Especialista en botox, rellenos con ácido hialurónico, rejuvenecimiento facial, depilación láser y tratamientos corporales. Agenda tu consulta de valoración gratis.",
  keywords: [
    "medicina estética",
    "Dra. Yasmin Medrano Avila",
    "botox",
    "ácido hialurónico",
    "rejuvenecimiento facial",
    "depilación láser",
    "rellenos faciales",
    "tratamientos corporales",
    "mesoterapia",
    "radiofrecuencia",
    "eliminación de manchas",
    "consultorio medicina estética",
    "medicina estética avanzada",
    "toxina botulínica",
    "bioestimulación",
    "peeling químico",
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
    siteName: "Dra. Yasmin Medrano Avila — Medicina Estética Avanzada",
    title: "Dra. Yasmin Medrano Avila | Medicina Estética Avanzada",
    description:
      "Especialista en medicina estética: botox, rellenos, rejuvenecimiento facial, depilación láser y tratamientos corporales. Consulta de valoración gratis. ¡Agenda hoy!",
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
    title: "Dra. Yasmin Medrano Avila | Medicina Estética Avanzada",
    description:
      "Tratamientos estéticos seguros y efectivos: botox, rellenos, rejuvenecimiento, depilación láser y más. Consulta de valoración gratis este mes.",
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
      sameAs: [],
    },
    {
      "@type": "Physician",
      "@id": `${BASE_URL}/#doctor`,
      name: "Dra. Yasmin Medrano Avila",
      jobTitle: "Médica Especialista en Medicina Estética",
      description:
        "Médica especialista en medicina estética con más de 10 años de experiencia en tratamientos faciales y corporales. Experta en toxina botulínica, ácido hialurónico, rejuvenecimiento y técnicas de vanguardia.",
      url: BASE_URL,
      worksFor: { "@id": `${BASE_URL}/#business` },
      medicalSpecialty: "https://schema.org/PlasticSurgery",
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
