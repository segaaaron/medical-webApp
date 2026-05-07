import type { Metadata } from "next";
import { Roboto, Playfair_Display, Cormorant_Garamond, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { CustomCursor } from "@/components/ui/CustomCursor";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasminmedrano.com";

export const viewport = {
  themeColor: "#1a0510",
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
  verification: {
    google: "mP89lsorVeyGLDWP6kHRjQUcD-TGByGX1O9b5324zf8",
  },
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
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${BASE_URL}/#navigation`,
      name: "Navegación Principal",
      hasPart: [
        { "@type": "WebPage", name: "Inicio", url: BASE_URL },
        { "@type": "WebPage", name: "Tratamientos", url: `${BASE_URL}/tratamientos` },
        { "@type": "WebPage", name: "Nosotros", url: `${BASE_URL}/nosotros` },
        { "@type": "WebPage", name: "Blog", url: `${BASE_URL}/blog` },
        { "@type": "WebPage", name: "Contacto", url: `${BASE_URL}/contacto` },
      ],
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
        {/* Preload hero video — starts fetching before component hydrates */}
        <link rel="preload" as="video" href="/videos/hero.mp4" type="video/mp4" />

        {/* Preconnect to external origins for performance */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/logo_dra_yasmin_cursiva.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          suppressHydrationWarning
        />
      </head>
      <body className={`${roboto.variable} ${playfair.variable} ${cormorant.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
        <SmoothScrollProvider>
          <CustomCursor />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
