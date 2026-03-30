import { MessageCircle } from "lucide-react"
import type { FooterGroup, SocialLink } from "@/types"

interface FooterProps {
  groups: FooterGroup[]
  socials: SocialLink[]
}

const WHATSAPP_NUMBER = "+591 78751894"
const WHATSAPP_URL = "https://wa.me/59178751894"

export function Footer({ groups, socials }: FooterProps) {
  return (
    <footer id="contacto" style={{ backgroundColor: "#1a0510", paddingTop: "10px"}}>
      <div className="container-xl py-24 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-xl mb-1">Dra. Yasmin</h3>
            <h3 className="text-white font-bold text-xl mb-2">Medrano Avila</h3>
            <p className="text-sm italic mb-4" style={{ color: "#e8a0b4" }}>
              Medicina Estética Avanzada
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#7a6570" }}>
              Especialista en medicina estética dedicada a realzar tu belleza natural con tratamientos seguros y efectivos.
            </p>

            {/* Social links + WhatsApp */}
            <div className="flex gap-3 pb-4 flex-wrap">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title={WHATSAPP_NUMBER}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "#5c1f35" }}
              >
                <MessageCircle size={18} color="#e8a0b4" />
              </a>
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#5c1f35" }}
                >
                  <social.icon size={18} color="#e8a0b4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {groups.map((group) => (
            <div key={group.title}>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "#7a6570" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t px-6 py-8" style={{ borderColor: "#3a0f20" }}>
        <div className="container-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "#7a6570" }}>
            © {new Date().getFullYear()} Dra. Yasmin Medrano Avila — Medicina Estética Avanzada. Todos los derechos reservados.
          </p>
          <p className="text-xs" style={{ color: "#7a6570" }}>
            Diseñado con ❤️ para tu bienestar y belleza.
          </p>
        </div>
      </div>
    </footer>
  )
}
