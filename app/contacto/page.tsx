import { readContent, DEFAULTS } from "@/lib/store/content-store"
import { safeJsonLd } from "@/lib/seo-utils"
import { backendFetch } from "@/lib/backend-client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getFooterData } from "@/lib/data/footer"
import { MessageCircle, MapPin, Clock } from "lucide-react"
import type { Metadata } from "next"
import type { ContactData } from "@/types/content"
import { PageHero } from "@/components/ui/PageHero"
import { TrackWhatsAppLink } from "@/components/analytics/TrackWhatsAppLink"
import { ContactForm } from "@/components/sections/ContactForm"
import { ContactCards } from "@/components/sections/ContactCards"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

export const metadata: Metadata = {
  title: "Agenda tu Consulta GRATIS — Medicina Estética Cochabamba | Dra. Yasmin Medrano",
  description:
    "Agenda tu consulta GRATIS con la Dra. Yasmin Medrano en Cochabamba. Atención vía WhatsApp e Instagram. Cupos limitados — ¡reserva el tuyo hoy!",
  keywords: [
    "agendar cita medicina estética Cochabamba",
    "consulta gratuita estética Bolivia",
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
    title: "¡Agenda tu Consulta GRATIS en Cochabamba! | Dra. Yasmin Medrano Avila",
    description:
      "📲 Cupos limitados disponibles. Consulta de valoración GRATUITA con la Dra. Yasmin Medrano en Cochabamba. WhatsApp, Instagram y más. ¡No esperes más para transformarte!",
    url: `${BASE_URL}/contacto`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Agenda consulta gratis medicina estética Cochabamba — Dra. Yasmin Medrano Avila" }],
    type: "website",
    locale: "es_BO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Consulta GRATIS en Cochabamba 📲 | Dra. Yasmin Medrano Avila",
    description:
      "¡Cupos limitados! Agenda tu consulta de valoración gratuita en Cochabamba. Especialista en botox, rellenos y rejuvenecimiento facial te espera.",
    images: ["/og-image.jpg"],
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
    scheduleWeekdays: raw.mondayFridayHours ?? DEFAULTS.contact.scheduleWeekdays,
    scheduleSaturday: raw.saturdayHours ?? DEFAULTS.contact.scheduleSaturday,
    scheduleSunday: raw.sundayStatus ?? DEFAULTS.contact.scheduleSunday,
    location: raw.locationDescription ?? DEFAULTS.contact.location,
  }
}

export default async function ContactoPage() {
  const [c, footerData, { data: backendContact }] = await Promise.all([
    readContent(),
    getFooterData(),
    backendFetch<unknown>("/contact"),
  ])
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
          subtitle="Agenda tu consulta de valoración gratuita y da el primer paso hacia tu transformación."
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

                {/* CTA */}
                <TrackWhatsAppLink
                  href={ct.whatsappUrl}
                  source="contacto-page-cta"
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-full text-base font-bold uppercase tracking-wide hover:brightness-110 transition-all"
                  style={{ backgroundColor: "var(--vintage-gold)", color: "white" }}
                >
                  <MessageCircle size={18} />
                  AGENDAR MI CONSULTA GRATIS
                </TrackWhatsAppLink>
              </div>

              {/* Contact form */}
              <div className="flex flex-col gap-4 md:col-span-2 xl:col-span-1">
                <h2 className="text-2xl font-bold text-white mb-2">Envíanos un Mensaje</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer data={footerData} />
    </>
  )
}
