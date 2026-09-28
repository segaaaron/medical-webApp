import type { Metadata } from "next";
import { BASE_URL } from "@/lib/seo/site-url"
import { Playfair_Display, Cormorant_Garamond, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { CustomCursorLoader } from "@/components/ui/CustomCursorLoader";
import { SkipNav } from "@/components/ui/SkipNav";
import { safeJsonLd } from "@/lib/seo-utils";
import { LazyMotion, domAnimation } from "framer-motion";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { WhatsAppFAB } from "@/components/ui/WhatsAppFAB";
import { WhatsAppProvider } from "@/components/providers/WhatsAppProvider";
import { doctorKnowsAbout, displayNameFor, alternateNamesFor, type TreatmentRef } from "@/lib/seo/treatment-names"
import { getWhatsApp, getContact, locationOf, businessContactOf, type ConsultorioLocation } from "@/lib/content/contact"
import { getFooter } from "@/lib/content/footer"
import { getActiveTreatments } from "@/lib/content/treatments"
import { getAbout, statsClaim } from "@/lib/content/about"
import { normalizeSocialUrl } from "@/lib/seo/meta"
import { ADDRESS, AREA_SERVED, LANGUAGES, geoFields } from "@/lib/seo/local"

/* Roboto se cargaba aquí con tres pesos —300, 400 y 700— y su variable
   `--font-roboto` no la usaba NINGUNA regla de `globals.css`: el texto del
   sitio sale de `--font-sans` (Source Serif) y los títulos de `--font-heading`
   (Playfair). Eran tres archivos de fuente descargados en cada visita, con su
   preload en el `<head>`, compitiendo por ancho de banda con el póster del
   hero, que es el elemento LCP. */

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  // Sin preload: Playfair solo aparece en los h2 bajo el pliegue; precargarla
  // competía con el texto del hero (LCP). El fallback ajustado evita el salto.
  preload: false,
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
  // Sin preload: solo etiquetas pequeñas (navbar, eyebrows); con swap no
  // retrasan el LCP y su hueco no cambia el tamaño de la línea.
  preload: false,
});


export const viewport = {
  themeColor: "#1a0510",
  width: "device-width",
  initialScale: 1,
};

/**
 * Metadatos por defecto del sitio. Función y no constante: la frase de
 * trayectoria sale de las estadísticas del panel (Dashboard → Acerca de) y,
 * sin ellas, se omite — nunca una cifra escrita en el código.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { data: about } = await getAbout()
  const claim = statsClaim(about.stats)
  const trayectoria = claim ? ` ${claim.charAt(0).toLocaleUpperCase("es")}${claim.slice(1)}.` : ""
  return {
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
      "Medicina estética en Cochabamba con la Dra. Yasmin Medrano Avila. Consulta de valoración personalizada.",
    // Sin `keywords`: Google ignora esta etiqueta desde 2009, y la lista fija
    // anunciaba servicios concretos desde una
    // constante. Los términos de cada tratamiento van en su propia ficha.
    authors: [{ name: "Dra. Yasmin Medrano Avila" }],
    creator: "Dra. Yasmin Medrano Avila",
    publisher: "Dra. Yasmin Medrano Avila",
    verification: {
      google: "mP89lsorVeyGLDWP6kHRjQUcD-TGByGX1O9b5324zf8",
      other: {
        "facebook-domain-verification": "t2p54dlzm9nvsr88bfsq4mum6ylk48",
        // Bing Webmaster Tools: el código vive en el panel de despliegue.
        ...(process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : {}),
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
      description: `Medicina estética en Cochabamba con la Dra. Yasmin Medrano Avila.${trayectoria} Agenda tu consulta de valoración.`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Medicina Estética en Cochabamba | Dra. Yasmin Medrano Avila",
      description: `Medicina estética en Cochabamba con la Dra. Yasmin Medrano Avila.${trayectoria}`,
    },
    // SIN `alternates.canonical` aquí.
    //
    // Puesto en el layout raíz, TODA página que no declare el suyo hereda este —o
    // sea, se declara copia de la portada—. Hoy afecta a las que van `noindex`
    // (el formulario de reseña, el 404), donde el daño es pequeño; el problema es
    // que cualquier página nueva que olvide su canonical nace diciendo que es la
    // portada, y eso no falla en ninguna build. La portada declara el suyo en
    // `generateMetadata` (app/page.tsx), como el resto.
    //
    // `metadataBase` se queda: sirve para resolver rutas relativas, no para
    // inventar canonicals.
    category: "health",
  }
}

// JSON-LD structured data — Physician / MedicalBusiness
/**
 * `@graph` del sitio. Recibe los tratamientos activos para que la ficha de la
 * doctora declare lo que realmente hace: si mañana se añade uno en el panel,
 * su `knowsAbout` lo recoge sin que nadie edite este archivo.
 */
function buildSiteJsonLd(
  treatments: TreatmentRef[],
  perfiles: string[],
  ubicacion: ConsultorioLocation | null,
  // Teléfono y horario de Dashboard → Contacto (o de su respaldo entero).
  { telephone, openingHours }: ReturnType<typeof businessContactOf>,
  // WhatsApp de Dashboard → Contacto (getWhatsApp), no escrito a mano.
  whatsappUrl: string,
  // Estadísticas de Dashboard → Acerca de, como frase («12+ años de
  // experiencia y …»). "" sin estadísticas: la afirmación se omite.
  claim: string
) {
  return {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Subtipo de `MedicalBusiness` y de `LocalBusiness` a la vez: hereda las
      // funciones locales (Maps, 3-pack) y añade las médicas.
      "@type": "MedicalClinic",
      "@id": `${BASE_URL}/#business`,
      name: "Consultorio Dra. Yasmin Medrano Avila",
      alternateName: "Medicina Estética Avanzada — Dra. Yasmin",
      url: BASE_URL,
      image: `${BASE_URL}/opengraph-image`,
      description: `Consultorio de medicina estética en Cochabamba, Bolivia.${claim ? ` ${claim.charAt(0).toLocaleUpperCase("es")}${claim.slice(1)}.` : ""} Tratamientos faciales con la Dra. Yasmin Medrano Avila.`,
      priceRange: "$$",
      currenciesAccepted: "BOB, USD",
      // Hasta dónde llega el servicio. Quien busca «cerca de mí» escribe desde
      // todo el eje metropolitano, no solo desde Cercado.
      areaServed: AREA_SERVED,
      availableLanguage: LANGUAGES,
      paymentAccepted: "Efectivo, Tarjeta de crédito, Tarjeta de débito, QR",
      medicalSpecialty: "Medicina Estética",
      // Mapa y coordenadas salen del panel (Dashboard → Contacto). Estaban
      // escritos a mano y apuntaban 90 metros más allá, sobre otra calle, aun
      // después de que la doctora corrigiera el punto en el panel.
      // `streetAddress` es lo que Google pide para `LocalBusiness`. Sin calle
      // la dirección está incompleta y el factor «distancia» del ranking local
      // no tiene con qué trabajar. Fuente única: `lib/seo/local.ts`.
      address: ADDRESS,
      // Sin coordenadas en el panel se omite el `geo` entero: declarar un punto
      // que ya no es cierto es peor que no declarar ninguno.
      ...geoFields(ubicacion),
      ...(openingHours.length ? { openingHoursSpecification: openingHours } : {}),
      contactPoint: [
        ...(telephone ? [{
          "@type": "ContactPoint",
          telephone,
          contactType: "customer service",
          areaServed: "BO",
          availableLanguage: "Spanish",
        }] : []),
        {
          "@type": "ContactPoint",
          url: whatsappUrl,
          contactType: "customer service",
          areaServed: "BO",
          availableLanguage: "Spanish",
        },
      ],
      // Sin aggregateRating aquí a propósito: este bloque va en TODAS las
      // páginas y llevaba "4.9 sobre 523 reseñas" escrito a mano, un dato que
      // no existe en ninguna parte. Reseñas inventadas en datos estructurados
      // violan las directrices de Google (penalización manual) y, en salud,
      // son publicidad engañosa. Tampoco el rating real de las reseñas
      // aprobadas: reseñas de la propia entidad sobre sí misma («self-serving»)
      // son inelegibles para las estrellas. Ver app/page.tsx.
      // Servicios que el consultorio presta, derivados del panel. La lista
      // anterior estaba escrita a mano y anunciaba depilación láser, reducción
      // de medidas, celulitis y estrías, que no se ofrecen. Un dato falso en el
      // schema del negocio es publicidad engañosa, no solo un fallo de SEO.
      availableService: treatments.map((t) => ({
        "@type": "MedicalProcedure",
        // Nombre real del panel; el término de búsqueda va como alternativo.
        name: displayNameFor(t),
        ...(alternateNamesFor(t).length ? { alternateName: alternateNamesFor(t) } : {}),
        url: `${BASE_URL}/tratamientos/${t.slug}`,
      })),
      ...(telephone ? { telephone } : {}),
      sameAs: perfiles,
    },
    {
      "@type": "Physician",
      "@id": `${BASE_URL}/#doctor`,
      name: "Dra. Yasmin Medrano Avila",
      jobTitle: "Médica Especialista en Medicina Estética",
      description: `Médica especialista en medicina estética en Cochabamba, Bolivia${claim ? `, con ${claim}` : ""}.`,
      // «Casa de la entidad»: la URL que Google trata como fuente de verdad
      // sobre quién es la doctora. Apuntaba a la portada, que habla del
      // consultorio; la página que habla de ELLA es `/nosotros`, y es la que
      // debe ganar cuando Google resuelva a qué se refieren las menciones
      // repartidas entre la web, Instagram, Facebook y TikTok.
      url: `${BASE_URL}/nosotros`,
      mainEntityOfPage: `${BASE_URL}/nosotros`,
      image: `${BASE_URL}/images/DraMedrano.jpeg`,
      ...(telephone ? { telephone } : {}),
      worksFor: { "@id": `${BASE_URL}/#business` },
      medicalSpecialty: "Medicina Estética",
      // En salud Google pesa QUIÉN firma, no solo qué dice la página. Esto
      // conecta a la doctora con cada término por el que queremos aparecer.
      knowsAbout: doctorKnowsAbout(treatments),
      // La matrícula profesional NO se publica aquí a propósito.
      //
      // El JSON-LD viaja en el HTML: cualquiera lo lee con «ver código
      // fuente». No es un canal privado hacia Google. Un número de matrícula
      // expuesto facilita que alguien se haga pasar por la doctora, y ese
      // riesgo pesa más que la señal de confianza que aportaría.
      //
      // El sitio dónde sí conviene declararla es la ficha de Google Business
      // Profile, que la usa para verificar al profesional sin publicarla.
      //
      // Credencial sin número: describe la titulación, que es información
      // pública de por sí y no sirve para suplantar a nadie.
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
  const [whatsapp, treatments, footerData, contact, about] = await Promise.all([
    getWhatsApp(),
    getActiveTreatments(),
    getFooter(),
    getContact(),
    getAbout(),
  ]);
  const activeTreatments = treatments.data;
  const ubicacion = locationOf(contact.data);
  const contacto = businessContactOf(contact.data);
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

  const jsonLd = buildSiteJsonLd(
    activeTreatments,
    perfilesSociales,
    ubicacion,
    contacto,
    whatsapp.url,
    statsClaim(about.data.stats)
  );

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
        {/* Sin `hreflang`: el sitio es monolingüe y no tiene versiones
            alternativas. Los tres que había vivían aquí, en el layout raíz, así
            que TODAS las páginas declaraban que su alternativa en es-BO era la
            portada — contradiciendo el `canonical` de cada una. Una señal
            contradictoria es peor que ninguna. */}
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/logo_dra_yasmin_cursiva.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
          suppressHydrationWarning
        />
      </head>
      <body className={`${playfair.variable} ${cormorant.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
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
