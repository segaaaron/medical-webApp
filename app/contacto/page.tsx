import { readContent } from "@/lib/store/content-store"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { socialLinks } from "@/lib/data/navigation"
import { MessageCircle, Phone, Instagram, Facebook, MapPin, Clock } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contacto | Dra. Yasmin Medrano Avila",
  description:
    "Comunícate con el consultorio de la Dra. Yasmin Medrano Avila para agendar tu consulta de valoración gratuita.",
}

export default async function ContactoPage() {
  const c = await readContent()

  return (
    <>
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
                  href="https://wa.me/59178751894"
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
                    <p className="text-white font-semibold">+591 78751894</p>
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
                    <p className="text-white font-semibold">+591 78751894</p>
                  </div>
                </div>

                {/* Social */}
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
                      href="https://www.instagram.com/dra_yasmin.medrano"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-semibold hover:text-yellow-200 transition-colors"
                    >
                      @dra_yasmin.medrano
                    </a>
                  </div>
                </div>

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
                      href="https://www.facebook.com/DraMedranoMedesteticAntiaging"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-semibold hover:text-yellow-200 transition-colors"
                    >
                      DraMedranoMedesteticAntiaging
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
                      { day: "Lunes – Viernes", hours: "9:00 AM – 7:00 PM" },
                      { day: "Sábado", hours: "9:00 AM – 2:00 PM" },
                      { day: "Domingo", hours: "Cerrado" },
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
                    Bolivia — Consulta vía WhatsApp para confirmar dirección exacta del consultorio.
                  </p>
                </div>

                {/* CTA */}
                <a
                  href="https://wa.me/59178751894"
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
