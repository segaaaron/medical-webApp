import type { Metadata } from "next";
import { Roboto, Playfair_Display, Cormorant_Garamond, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { CustomCursorLoader } from "@/components/ui/CustomCursorLoader";
import { SkipNav } from "@/components/ui/SkipNav";
import { safeJsonLd } from "@/lib/seo-utils";
import { LazyMotion, domAnimation } from "framer-motion";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { WhatsAppFAB } from "@/components/ui/WhatsAppFAB";
import { WhatsAppProvider } from "@/components/providers/WhatsAppProvider";
import { getWhatsAppConfig } from "@/lib/data/whatsapp";
import { doctorKnowsAbout, seoTitleFor, type TreatmentRef } from "@/lib/seo/treatment-names"
import { backendFetch, extractList } from "@/lib/backend-client"
import { getFooterData } from "@/lib/data/footer"
import { normalizeSocialUrl } from "@/lib/seo/meta"

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
    // Título de reserva. La home lo sustituye por los tratamientos que el panel
    // tiene activos (ver `generateMetadata` en app/page.tsx); aquí no se nombra
    // ningún procedimiento concreto, para no anunciar desde una constante algo
    // que el consultorio pueda no estar ofreciendo.
    default: "Medicina Estética en Cochabamba | Dra. Yasmin Medrano Avila",
    template: "%s | Dra. Yasmin Medrano Avila",
  },
  description:
    "Medicina estética en Cochabamba: botox, rellenos y armonización facial con 10+ años de experiencia. Consulta de valoración personalizada.",
  // Términos generales del consultorio, no de tratamientos concretos: los de
  // cada procedimiento salen de `lib/seo/treatment-names.ts`, que solo conoce
  // los que existen. Se quitaron de aquí los que anunciaban servicios que el
  // consultorio no presta (depilación láser, mesoterapia corporal, armonización
  // facial y bioestimulación no figuran entre sus tratamientos activos).
  //
  // Nota: Google ignora esta etiqueta desde 2009. Se mantiene limpia por
  // coherencia con lo que se ofrece, no porque influya en el posicionamiento.
  keywords: [
    // Geo-transaccionales Bolivia/Cochabamba — alta intención de compra
    "médico estético Cochabamba Bolivia",
    "botox Cochabamba precio consulta",
    "bioestimuladores polinucleótidos Bolivia",
    "bioestimulación facial Bolivia",
    "rellenos labios ácido hialurónico Bolivia",
    "tratamiento manchas faciales médico Bolivia",
    "consulta medicina estética cerca de mí",
    "estética médica Bolivia",
    // Marca + autoridad
    "Dra. Yasmin Medrano Avila",
    "medicina estética avanzada Bolivia",
    "toxina botulínica Cochabamba",
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
    other: {
      "facebook-domain-verification": "t2p54dlzm9nvsr88bfsq4mum6ylk48",
    },
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
    title: "Medicina Estética Cochabamba | Dra. Yasmin Medrano Avila",
    description:
      "Botox, ácido hialurónico, rellenos de labios y bioestimulación en Cochabamba. Más de 10 años de experiencia. Agenda tu consulta de valoración.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Medicina Estética en Cochabamba | Dra. Yasmin Medrano Avila",
    description:
      "Botox, ácido hialurónico y rellenos de labios en Cochabamba, con la Dra. Yasmin Medrano Avila. Más de 10 años de experiencia.",
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "health",
};

// JSON-LD structured data — Physician / MedicalBusiness
/**
 * `@graph` del sitio. Recibe los tratamientos activos para que la ficha de la
 * doctora declare lo que realmente hace: si mañana se añade uno en el panel,
 * su `knowsAbout` lo recoge sin que nadie edite este archivo.
 */
function buildSiteJsonLd(treatments: TreatmentRef[], perfiles: string[]) {
  return {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalBusiness",
      "@id": `${BASE_URL}/#business`,
      name: "Consultorio Dra. Yasmin Medrano Avila",
      alternateName: "Medicina Estética Avanzada — Dra. Yasmin",
      url: BASE_URL,
      image: `${BASE_URL}/opengraph-image`,
      description:
        "Consultorio de medicina estética en Cochabamba, Bolivia. Más de 10 años de experiencia, +5.000 pacientes atendidos. Tratamientos faciales y corporales seguros con tecnología de vanguardia.",
      priceRange: "$$",
      currenciesAccepted: "BOB, USD",
      paymentAccepted: "Efectivo, Tarjeta de crédito, Tarjeta de débito, QR",
      medicalSpecialty: "Medicina Estética",
      hasMap: "https://www.google.com/maps?q=-17.386471,-66.152366",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cochabamba",
        addressRegion: "Cochabamba",
        addressCountry: "BO",
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
        },
        {
          "@type": "ContactPoint",
          url: "https://wa.me/59178751894",
          contactType: "customer service",
          areaServed: "BO",
          availableLanguage: "Spanish",
        },
      ],
      // Sin aggregateRating aquí a propósito: este bloque va en TODAS las
      // páginas y llevaba "4.9 sobre 523 reseñas" escrito a mano, un dato que
      // no existe en ninguna parte. Reseñas inventadas en datos estructurados
      // violan las directrices de Google (penalización manual) y, en salud,
      // son publicidad engañosa. El rating real —calculado de las reseñas
      // aprobadas— lo aportan `/` y `/nosotros` sobre esta misma entidad
      // (@id #business), y solo cuando hay reseñas que respalden el número.
      // Servicios que el consultorio presta, derivados del panel. La lista
      // anterior estaba escrita a mano y anunciaba depilación láser, reducción
      // de medidas, celulitis y estrías, que no se ofrecen. Un dato falso en el
      // schema del negocio es publicidad engañosa, no solo un fallo de SEO.
      availableService: treatments.map((t) => ({
        "@type": "MedicalProcedure",
        name: seoTitleFor(t.slug, t.name),
        url: `${BASE_URL}/tratamientos/${t.slug}`,
      })),
      telephone: "+59178751894",
      sameAs: perfiles,
    },
    {
      "@type": "Physician",
      "@id": `${BASE_URL}/#doctor`,
      name: "Dra. Yasmin Medrano Avila",
      jobTitle: "Médica Especialista en Medicina Estética",
      description:
        "Médica especialista en medicina estética con más de 10 años de experiencia y más de 5,000 pacientes atendidos. Experta en toxina botulínica, ácido hialurónico, rellenos de labios, bioestimulación y técnicas de vanguardia.",
      url: BASE_URL,
      image: `${BASE_URL}/images/DraMedrano.jpeg`,
      telephone: "+59178751894",
      worksFor: { "@id": `${BASE_URL}/#business` },
      medicalSpecialty: "Medicina Estética",
      // En salud Google pesa QUIÉN firma, no solo qué dice la página. Esto
      // conecta a la doctora con cada término por el que queremos aparecer.
      knowsAbout: doctorKnowsAbout(treatments),
      // Credencial profesional. Es una de las señales más directas de que
      // detrás del contenido hay una médica y no un sitio de afiliados.
      //
      // PENDIENTE: falta el número de registro del Colegio Médico. No se
      // inventa — un identificador falso es peor que ninguno. Cuando la
      // doctora lo facilite, se añade aquí como `identifier`.
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "degree",
        educationalLevel: "Médica Cirujana con especialidad en Medicina Estética",
      },
      sameAs: perfiles,
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      // Nombre del sitio, el que Google puede mostrar sobre el título en los
      // resultados (donde Disney+ pone «disneyplus.com»). Va corto a propósito:
      // los nombres largos con guion se cortan o se descartan. El descriptivo
      // pasa a `alternateName`, que es donde Google admite la forma extendida.
      name: "Dra. Yasmin Medrano",
      alternateName: [
        "Dra. Yasmin Medrano Avila",
        "Dra. Yasmin Medrano — Medicina Estética Cochabamba",
      ],
      inLanguage: "es-BO",
      publisher: { "@id": `${BASE_URL}/#business` },
    },
    ],
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // WhatsApp configurado en el panel (Dashboard → Contacto), no cableado.
  // Los tratamientos activos alimentan el `knowsAbout` de la doctora: el panel
  // manda, y un procedimiento nuevo entra en el schema sin tocar código.
  const [whatsapp, treatmentsResult, footerData] = await Promise.all([
    getWhatsAppConfig(),
    backendFetch<TreatmentRef[]>("/treatments?active=true", { revalidate: 300 }),
    getFooterData(),
  ]);
  const activeTreatments =
    treatmentsResult.error === null
      ? extractList<TreatmentRef>(treatmentsResult.data).filter((t) => t.slug)
      : [];
  // `sameAs` conecta el sitio con sus perfiles: es como Google entiende que la
  // web, el Facebook, el Instagram y el TikTok son la MISMA entidad, y por eso
  // las señales de cada uno se suman. Antes estaban escritos a mano y faltaba
  // TikTok. Ahora salen del panel, y solo se incluyen los que existen: un
  // perfil vacío o inventado rompe la conexión en vez de reforzarla.
  const perfilesSociales = [
    footerData.facebookUrl,
    footerData.instagramUrl,
    footerData.tiktokUrl,
  ]
    .map(normalizeSocialUrl)
    .filter(Boolean);

  const jsonLd = buildSiteJsonLd(activeTreatments, perfilesSociales);

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
        <WhatsAppProvider value={whatsapp}>
          <LazyMotion features={domAnimation}>
            <SmoothScrollProvider>
              <CustomCursorLoader />
              <div id="main-content">{children}</div>
            </SmoothScrollProvider>
            {/* Dentro de LazyMotion: usa `m.*` y sin las features cargadas no
                llega a montarse — estaba fuera y nunca se renderizó. */}
            <WhatsAppFAB />
          </LazyMotion>
        </WhatsAppProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
