import { readContent, DEFAULTS } from "@/lib/store/content-store"
import { BASE_URL } from "@/lib/seo/site-url"
import { safeJsonLd } from "@/lib/seo-utils"
import { backendFetch, extractList } from "@/lib/backend-client"
import { seoTitleFor, type TreatmentRef } from "@/lib/seo/treatment-names"
import { normalizeSocialUrl } from "@/lib/seo/meta"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getFooterData } from "@/lib/data/footer"
import { MapPin, Clock } from "lucide-react"
import type { Metadata } from "next"
import type { ContactData } from "@/types/content"
import { PageHero } from "@/components/ui/PageHero"
import { ContactForm } from "@/components/sections/ContactForm"
import { ContactCards } from "@/components/sections/ContactCards"


export const metadata: Metadata = {
  // La marca la pone el template del layout: llevarla aquí la repetía dos veces.
  title: "Agenda tu Consulta en Cochabamba",
  description:
    "Agenda tu consulta con la Dra. Yasmin Medrano en Cochabamba: horarios, ubicación y atención por WhatsApp e Instagram.",
  keywords: [
    "agendar cita medicina estética Cochabamba",
    "consulta medicina estética Bolivia",
    "whatsapp Dra Yasmin Medrano Cochabamba",
    "consultorio estético Cochabamba Bolivia",
    "contacto médico estético Bolivia",
    "cita botox Cochabamba",
    "reservar consulta estética Bolivia",
    "médico estética cerca de mí Cochabamba",
    "horarios consultorio estética Bolivia",
  ],
  alternates: {
    canonical: `${BASE_URL}/contacto`,
  },
  openGraph: {
    title: "Agenda tu Consulta en Cochabamba | Dra. Yasmin Medrano Avila",
    description:
      "Consulta de valoración con la Dra. Yasmin Medrano en Cochabamba. Escríbenos por WhatsApp o Instagram.",
    url: `${BASE_URL}/contacto`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Agenda tu consulta de medicina estética en Cochabamba — Dra. Yasmin Medrano Avila" }],
    type: "website",
    locale: "es_BO",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    title: "Agenda tu Consulta en Cochabamba | Dra. Yasmin Medrano Avila",
    description:
      "Agenda tu consulta de valoración en Cochabamba. Especialista en botox, rellenos y rejuvenecimiento facial.",
  },
}

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Contacto", item: `${BASE_URL}/contacto` },
  ],
}

/**
 * La página de contacto NO declara otro negocio: referencia el que ya sirve el
 * layout en todas las páginas (@id #business).
 *
 * Antes creaba un `MedicalBusiness` anónimo, sin `@id`, con su propio horario y
 * un `sameAs` distinto —sin TikTok—. Para Google eso no es la misma ficha
 * repetida: son dos negocios que se contradicen sobre el mismo teléfono y la
 * misma dirección, justo lo que el factor NAP del ranking local castiga.
 */
const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: `${BASE_URL}/contacto`,
  mainEntity: { "@id": `${BASE_URL}/#business` },
}

/** Coordenada del panel, o la de reserva si viene vacía o no es un número. */
function coordenada(raw: unknown, porDefecto: string): string {
  // `Number("")` y `Number("   ")` valen 0, que es finito: sin descartar la
  // cadena vacía, un campo en blanco en el panel daba la coordenada 0,0 —el
  // Golfo de Guinea— en vez del consultorio.
  const texto = typeof raw === "string" ? raw.trim() : raw
  if (texto === "" || texto == null) return porDefecto
  const n = Number(texto)
  return Number.isFinite(n) ? String(n) : porDefecto
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapContact(raw: any): ContactData {
  const lat = coordenada(raw.latitude, DEFAULTS.contact.latitude)
  const lng = coordenada(raw.longitude, DEFAULTS.contact.longitude)

  return {
    whatsappNumber: raw.whatsappNumber ?? DEFAULTS.contact.whatsappNumber,
    whatsappUrl: raw.whatsappUrl ?? DEFAULTS.contact.whatsappUrl,
    phone: raw.phone ?? DEFAULTS.contact.phone,
    instagram: raw.instagramUsername ?? DEFAULTS.contact.instagram,
    instagramUrl: raw.instagramUrl ?? DEFAULTS.contact.instagramUrl,
    facebook: raw.facebookName ?? DEFAULTS.contact.facebook,
    facebookUrl: raw.facebookUrl ?? DEFAULTS.contact.facebookUrl,
    tiktok: raw.tiktokUsername ?? DEFAULTS.contact.tiktok,
    // Se limpia al leer, no al guardar: la doctora pega el enlace tal como se
    // lo da la app —con `?_r=1&_t=…`— y no tiene por qué recortarlo a mano.
    tiktokUrl: normalizeSocialUrl(raw.tiktokUrl ?? DEFAULTS.contact.tiktokUrl),
    scheduleWeekdays: raw.mondayFridayHours ?? DEFAULTS.contact.scheduleWeekdays,
    scheduleSaturday: raw.saturdayHours ?? DEFAULTS.contact.scheduleSaturday,
    scheduleSunday: raw.sundayStatus ?? DEFAULTS.contact.scheduleSunday,
    location: raw.locationDescription ?? DEFAULTS.contact.location,
    // Se exige un número válido, no solo «distinto de null». Con el mapa
    // cableado daba igual, pero ahora el iframe se arma con estas coordenadas:
    // un campo vacío en el panel producía `?q=,` y el mapa salía en blanco.
    latitude: lat,
    longitude: lng,
    // Derivado de las coordenadas, NO leído del panel. El campo `mapsUrl` del
    // panel se quedó apuntando al punto viejo cuando la doctora corrigió las
    // coordenadas, así que viajaba al navegador un enlace que llevaba 90 metros
    // más allá. Dos fuentes para el mismo dato acaban contradiciéndose: manda
    // la coordenada, que es la que pinta el mapa. Mismo criterio que
    // `lib/data/location.ts`.
    mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
  }
}

export default async function ContactoPage() {
  const [c, footerData, { data: backendContact }, treatmentsResult] = await Promise.all([
    readContent(),
    getFooterData(),
    backendFetch<unknown>("/contact"),
      backendFetch<TreatmentRef[]>("/treatments?active=true", { revalidate: 300 }),
  ])

  // El desplegable de tratamientos sale del panel: antes ofrecía armonización
  // facial y depilación láser, que el consultorio no presta, y un paciente
  // podía pedir cita para algo inexistente.
  const treatmentOptions =
    treatmentsResult.error === null
      ? extractList<TreatmentRef>(treatmentsResult.data)
          .filter((t) => t.slug)
          .map((t) => seoTitleFor(t.slug, t.name))
      : []

  const ct: ContactData = backendContact ? mapContact(backendContact) : c.contact

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(contactJsonLd) }}
      />
      <Navbar links={c.navLinks} />
      <main>
        <PageHero
          eyebrow="Estamos para ti"
          title="Contacto"
          subtitle="Agenda tu consulta de valoración y da el primer paso hacia tu transformación."
        />

        {/* Contact section */}
        <section className="py-20 px-6" style={{ backgroundColor: "var(--primary-darkest)" }}>
          <div className="container-xl max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">

              {/* Contact cards */}
              <ContactCards ct={ct} />

              {/* Hours & CTA */}
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-white mb-2">Horario de Atención</h2>

                <div className="p-6 rounded-2xl" style={{ backgroundColor: "var(--primary-darker)" }}>
                  <div className="flex items-center gap-3 mb-5">
                    <Clock size={20} style={{ color: "var(--vintage-gold)" }} />
                    <p className="text-sm uppercase tracking-widest font-semibold" style={{ color: "var(--meteorite)" }}>Horarios</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { day: "Lunes – Viernes", hours: ct.scheduleWeekdays },
                      { day: "Sábado", hours: ct.scheduleSaturday },
                      { day: "Domingo", hours: ct.scheduleSunday },
                    ].map(({ day, hours }) => (
                      <div key={day} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0" style={{ borderColor: "var(--primary-darkest)" }}>
                        <span className="text-sm" style={{ color: "#fce4ec" }}>{day}</span>
                        <span className="text-sm font-semibold" style={{ color: "var(--vintage-gold)" }}>{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl" style={{ backgroundColor: "var(--primary-darker)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin size={20} style={{ color: "var(--vintage-gold)" }} />
                    <p className="text-sm uppercase tracking-widest font-semibold" style={{ color: "var(--meteorite)" }}>Ubicación</p>
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "#fce4ec" }}>
                    {ct.location}
                  </p>
                  {/* Coordenadas del panel, no escritas a mano. El mapa
                      apuntaba a un punto fijo aunque la doctora corrigiera la
                      ubicación en Dashboard → Contacto — el mismo desfase que
                      ya se arregló en los datos estructurados. */}
                  <div className="rounded-xl overflow-hidden">
                    <iframe
                      src={`https://www.google.com/maps?q=${ct.latitude},${ct.longitude}&z=16&output=embed`}
                      width="100%"
                      height="220"
                      style={{ border: 0, aspectRatio: "16/9", width: "100%", height: "auto" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Ubicación del consultorio"
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${ct.latitude},${ct.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-xs font-semibold hover:opacity-80 transition-opacity py-2 -my-2"
                    style={{ color: "var(--vintage-gold)" }}
                  >
                    <MapPin size={14} />
                    Abrir en Google Maps
                  </a>
                </div>

              </div>

              {/* Zona de atención.
                  El schema ya declara `areaServed` con todo el eje
                  metropolitano, pero la página no lo decía en ninguna parte, y
                  Google pide que lo que afirman los datos estructurados sea
                  visible. Además responde una duda real de quien escribe desde
                  Quillacollo o Sacaba: «¿atienden a gente de fuera?». */}
              <div className="p-6 rounded-2xl md:col-span-2 xl:col-span-3" style={{ backgroundColor: "var(--primary-darker)" }}>
                <h2 className="text-sm uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--meteorite)" }}>
                  Zona de atención
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#fce4ec" }}>
                  El consultorio está en Cochabamba y atiende también a pacientes del
                  área metropolitana —Quillacollo, Sacaba, Tiquipaya, Colcapirhua y
                  Vinto— y de otras ciudades de Bolivia. La atención es con cita previa;
                  si vienes de fuera, conviene coordinarla con antelación por WhatsApp.
                </p>
              </div>

              {/* Contact form */}
              <div className="flex flex-col gap-4 md:col-span-2 xl:col-span-1">
                <h2 className="text-2xl font-bold text-white mb-2">Envíanos un Mensaje</h2>
                <ContactForm treatments={treatmentOptions} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer data={footerData} />
    </>
  )
}
