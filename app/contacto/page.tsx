import { readContent, DEFAULTS } from "@/lib/store/content-store"
import { backendFetch } from "@/lib/backend-client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { socialLinks } from "@/lib/data/navigation"
import { MessageCircle, Phone, Instagram, Facebook, MapPin, Clock } from "lucide-react"
import type { Metadata } from "next"
import type { ContactData } from "@/types/content"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

export const metadata: Metadata = {
  title: "Contacto - Agenda tu Consulta Gratuita de Medicina Estetica",
  description:
    "Agenda tu consulta de valoracion gratuita con la Dra. Yasmin Medrano Avila. WhatsApp, telefono, Instagram y Facebook. Horarios de atencion y ubicacion del consultorio.",
  keywords: [
    "contacto medicina estetica",
    "agendar cita botox",
    "consulta gratuita medicina estetica",
    "whatsapp Dra Yasmin Medrano",
    "consultorio estetico Bolivia",
  ],
  alternates: {
    canonical: `${BASE_URL}/contacto`,
  },
  openGraph: {
    title: "Contacto | Dra. Yasmin Medrano Avila",
    description:
      "Agenda tu consulta de valoracion gratuita. WhatsApp, telefono y redes sociales disponibles.",
    url: `${BASE_URL}/contacto`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Contacto - Consultorio Dra. Yasmin Medrano Avila" }],
    type: "website",
    locale: "es_BO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | Dra. Yasmin Medrano Avila",
    description:
      "Agenda tu consulta gratuita de medicina estetica. Atencion personalizada.",
    images: ["/og-image.jpg"],
  },
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
  const [c, { data: backendContact }] = await Promise.all([
    readContent(),
    backendFetch<unknown>("/contact"),
  ])
  const ct: ContactData = backendContact ? mapContact(backendContact) : c.contact

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <Navbar links={c.navLinks} />
      <main>
        {/* Page hero */}
        <div className="py-16 px-6 text-center" style={{ backgroundColor: "#1a0510" }}>
          <p className="text-sm uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: "#e8a0b4" }}>
            Estamos para ti
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contacto</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#fce4ec" }}>
            Agenda tu consulta de valoración gratuita y da el primer paso hacia tu transformación.
          </p>
        </div>

        {/* Contact section */}
        <section className="py-20 px-6" style={{ backgroundColor: "#3a0f20" }}>
          <div className="container-xl max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

              {/* Contact cards */}
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-white mb-2">Comunícate con nosotros</h2>

                {/* WhatsApp */}
                <a
                  href={ct.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 p-6 rounded-2xl hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#5c1f35" }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#3a0f20" }}>
                    <MessageCircle size={22} style={{ color: "#4a9e82" }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#e8a0b4" }}>WhatsApp</p>
                    <p className="text-white font-semibold">{ct.whatsappNumber}</p>
                    <p className="text-xs mt-1" style={{ color: "#7a6570" }}>Respuesta rápida · Consulta gratuita</p>
                  </div>
                </a>

                {/* Phone */}
                <div
                  className="flex items-center gap-5 p-6 rounded-2xl"
                  style={{ backgroundColor: "#5c1f35" }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#3a0f20" }}>
                    <Phone size={22} style={{ color: "#c9a96e" }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#e8a0b4" }}>Teléfono</p>
                    <p className="text-white font-semibold">{ct.phone}</p>
                  </div>
                </div>

                {/* Instagram */}
                <div
                  className="flex items-center gap-5 p-6 rounded-2xl"
                  style={{ backgroundColor: "#5c1f35" }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#3a0f20" }}>
                    <Instagram size={22} style={{ color: "#e8a0b4" }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#e8a0b4" }}>Instagram</p>
                    <a
                      href={ct.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-semibold hover:text-yellow-200 transition-colors"
                    >
                      {ct.instagram}
                    </a>
                  </div>
                </div>

                {/* Facebook */}
                <div
                  className="flex items-center gap-5 p-6 rounded-2xl"
                  style={{ backgroundColor: "#5c1f35" }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#3a0f20" }}>
                    <Facebook size={22} style={{ color: "#e8a0b4" }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#e8a0b4" }}>Facebook</p>
                    <a
                      href={ct.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-semibold hover:text-yellow-200 transition-colors"
                    >
                      {ct.facebook}
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours & CTA */}
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-white mb-2">Horario de Atención</h2>

                <div className="p-6 rounded-2xl" style={{ backgroundColor: "#5c1f35" }}>
                  <div className="flex items-center gap-3 mb-5">
                    <Clock size={20} style={{ color: "#c9a96e" }} />
                    <p className="text-sm uppercase tracking-widest font-semibold" style={{ color: "#e8a0b4" }}>Horarios</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { day: "Lunes – Viernes", hours: ct.scheduleWeekdays },
                      { day: "Sábado", hours: ct.scheduleSaturday },
                      { day: "Domingo", hours: ct.scheduleSunday },
                    ].map(({ day, hours }) => (
                      <div key={day} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0" style={{ borderColor: "#3a0f20" }}>
                        <span className="text-sm" style={{ color: "#fce4ec" }}>{day}</span>
                        <span className="text-sm font-semibold" style={{ color: "#c9a96e" }}>{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl" style={{ backgroundColor: "#5c1f35" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin size={20} style={{ color: "#c9a96e" }} />
                    <p className="text-sm uppercase tracking-widest font-semibold" style={{ color: "#e8a0b4" }}>Ubicación</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#fce4ec" }}>
                    {ct.location}
                  </p>
                </div>

                {/* CTA */}
                <a
                  href={ct.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-full text-base font-bold uppercase tracking-wide hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#b5496a", color: "white" }}
                >
                  <MessageCircle size={18} />
                  AGENDAR MI CONSULTA GRATIS
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer groups={c.footerGroups} socials={socialLinks} />
    </>
  )
}
