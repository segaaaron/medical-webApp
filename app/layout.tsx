import type { Metadata } from "next";
import { Roboto, Playfair_Display, Cormorant_Garamond, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { CustomCursorLoader } from "@/components/ui/CustomCursorLoader";
import { SkipNav } from "@/components/ui/SkipNav";
import { safeJsonLd } from "@/lib/seo-utils";
import { LazyMotion, domAnimation } from "framer-motion";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400"],
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
    "Especialista en medicina estética en Cochabamba. +5.000 pacientes felices, 10+ años de experiencia. Botox, rellenos, armonización facial. ¡Consulta de valoración GRATIS!",
  keywords: [
    // Geo-transaccionales Bolivia/Cochabamba — alta intención de compra
    "médico estético Cochabamba Bolivia",
    "mejor medicina estética Cochabamba",
    "botox Cochabamba precio consulta",
    "rellenos labios ácido hialurónico Bolivia",
    "armonización facial Cochabamba",
    "bioestimuladores polinucleótidos Bolivia",
    "depilación láser Cochabamba mujer",
    "tratamiento manchas faciales médico Bolivia",
    "rejuvenecimiento facial sin cirugía Cochabamba",
    "mesoterapia corporal Bolivia",
    "consulta gratis medicina estética cerca de mí",
    "estética médica Bolivia",
    // Marca + autoridad
    "Dra. Yasmin Medrano Avila",
    "medicina estética avanzada Bolivia",
    "toxina botulínica Cochabamba",
    "bioestimulación facial Bolivia",
    "peeling químico Cochabamba",
    "radiofrecuencia facial Bolivia",
    "eliminación manchas piel Bolivia",
    "consultorio medicina estética Cochabamba",
    "médico estética confiable Bolivia",
    "tratamiento antiedad Cochabamba",
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
    locale: "es_BO",
    url: BASE_URL,
    siteName: "Dra. Yasmin Medrano Avila — Medicina Estética Cochabamba",
    title: "Medicina Estética Cochabamba | Dra. Yasmin Medrano Avila — Consulta Gratis",
    description:
      "⭐ Más de 5.000 pacientes satisfechos en Cochabamba. Botox, rellenos, armonización facial y bioestimulación. Resultados naturales, seguros y duraderos. ¡Agenda tu consulta GRATIS ahora!",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dra. Yasmin Medrano Avila — Mejor Medicina Estética Cochabamba Bolivia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Medicina Estética en Cochabamba | Dra. Yasmin Medrano Avila",
    description:
      "✨ +5.000 pacientes felices en Bolivia. Botox natural, rellenos, armonización facial. 10+ años de experiencia. ¡Consulta GRATIS este mes — reserva ahora!",
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
      image: `${BASE_URL}/og-image.jpg`,
      description:
        "Consultorio líder en medicina estética en Cochabamba, Bolivia. Más de 10 años de experiencia, +5.000 pacientes atendidos. Tratamientos faciales y corporales seguros con tecnología de vanguardia.",
      priceRange: "$$",
      currenciesAccepted: "BOB, USD",
      paymentAccepted: "Efectivo, Tarjeta de crédito, Tarjeta de débito, QR",
      medicalSpecialty: "Medicina Estética",
      hasMap: "https://www.google.com/maps?q=-17.386471,-66.152366",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Cochabamba",
        addressLocality: "Cochabamba",
        addressRegion: "Cochabamba",
        addressCountry: "BO",
        postalCode: "0000",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -17.386471,
        longitude: -66.152366,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "19:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Saturday",
          opens: "09:00",
          closes: "14:00",
        },
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+59178751894",
          contactType: "customer service",
          areaServed: "BO",
          availableLanguage: "Spanish",
          contactOption: "TollFree",
        },
        {
          "@type": "ContactPoint",
          url: "https://wa.me/59178751894",
          contactType: "customer service",
          areaServed: "BO",
          availableLanguage: "Spanish",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "523",
        bestRating: "5",
        worstRating: "1",
      },
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
      image: `${BASE_URL}/images/DraMedrano.jpeg`,
      telephone: "+59178751894",
      worksFor: { "@id": `${BASE_URL}/#business` },
      medicalSpecialty: "Medicina Estética",
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
    <html lang="es-BO">
      <head>
        {/* Preconnect to external origins for performance */}
        <link rel="preconnect" href="https://service.drayasminmedrano-services.cloud" />
        <link rel="dns-prefetch" href="https://service.drayasminmedrano-services.cloud" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* hreflang — Spanish Bolivia */}
        <link rel="alternate" hrefLang="es-BO" href={BASE_URL} />
        <link rel="alternate" hrefLang="es" href={BASE_URL} />
        <link rel="alternate" hrefLang="x-default" href={BASE_URL} />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/logo_dra_yasmin_cursiva.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
          suppressHydrationWarning
        />
      </head>
      <body className={`${roboto.variable} ${playfair.variable} ${cormorant.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
        <SkipNav />
        <LazyMotion features={domAnimation}>
          <SmoothScrollProvider>
            <CustomCursorLoader />
            <div id="main-content">{children}</div>
          </SmoothScrollProvider>
        </LazyMotion>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
