import { readContent, DEFAULTS } from "@/lib/store/content-store"
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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

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

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  mainEntity: {
    "@type": "MedicalBusiness",
    name: "Consultorio Dra. Yasmin Medrano Avila",
    telephone: "+59178751894",
    url: `${BASE_URL}/contacto`,
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
    sameAs: [
      "https://www.facebook.com/DraMedranoMedesteticAntiaging",
      "https://www.instagram.com/dra_yasmin.medrano",
    ],
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapContact(raw: any): ContactData {
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
    latitude: raw.latitude != null ? String(raw.latitude) : DEFAULTS.contact.latitude,
    longitude: raw.longitude != null ? String(raw.longitude) : DEFAULTS.contact.longitude,
    mapsUrl: raw.mapsUrl ?? DEFAULTS.contact.mapsUrl,
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
                  <div className="rounded-xl overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps?q=-17.386471,-66.152366&z=16&output=embed"
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
                    href="https://www.google.com/maps?q=-17.386471,-66.152366"
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
