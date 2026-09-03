"use client"
import Link from "next/link"
import { MessageCircle, Facebook, Instagram, Music2 } from "lucide-react"
import { trackWhatsAppClick } from "@/lib/analytics"

const LINK_STYLE = { color: "rgba(255,255,255,0.65)" }
const setWhite = (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "#ffffff" }
const setMuted = (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)" }

export interface FooterData {
  doctorName: string
  specialty: string
  description: string
  whatsappUrl: string
  facebookUrl: string
  instagramUrl: string
  /** Perfil de TikTok. Vacío si aún no se ha cargado en el panel. */
  tiktokUrl?: string
  facialTreatments: { label: string; href: string }[]
  bodyTreatments: { label: string; href: string }[]
  officeLinks: { label: string; href: string }[]
  legalLinks: { label: string; href: string }[]
  copyrightText: string
  designedByText: string
}

interface FooterLinkGroupProps {
  title: string
  links: { label: string; href: string }[]
}

function LinkGroup({ title, links }: FooterLinkGroupProps) {
  if (!links.length) return null
  return (
    <div>
      <h4
        className="text-sm uppercase mb-5"
        style={{
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.24em",
          color: "var(--vintage-gold)",
          fontWeight: 600,
        }}
      >
        {title}
      </h4>
      <ul className="flex flex-col gap-3">
        {links.map((link) => {
          // Internal app routes use next/link (SPA nav + prefetch); external
          // URLs and hash anchors fall back to a plain anchor.
          const isInternal = link.href.startsWith("/") && !link.href.startsWith("//")
          return (
            <li key={link.label}>
              {isInternal ? (
                <Link
                  href={link.href}
                  className="text-sm transition-colors"
                  style={LINK_STYLE}
                  onMouseEnter={setWhite}
                  onMouseLeave={setMuted}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  className="text-sm transition-colors"
                  style={LINK_STYLE}
                  onMouseEnter={setWhite}
                  onMouseLeave={setMuted}
                >
                  {link.label}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Footer({ data }: { data: FooterData }) {
  const doctorName = data?.doctorName ?? ""
  const nameParts = doctorName.split(" ").slice(0, 2).join(" ")
  const nameRest = doctorName.split(" ").slice(2).join(" ")

  return (
    <footer id="contacto" style={{ backgroundColor: "oklch(9% 0.01 52)", paddingTop: "10px" }}>
      <div className="container-xl py-24 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-xl mb-1" style={{ color: "var(--vintage-gold)" }}>{nameParts}</h3>
            {nameRest && <h3 className="font-bold text-xl mb-2" style={{ color: "var(--vintage-gold)" }}>{nameRest}</h3>}
            <p className="text-sm italic mb-4" style={{ color: "var(--prem-dark-muted)" }}>
              {data.specialty}
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
              {data.description}
            </p>

            {/* Social icons */}
            <div className="flex gap-3 pb-4 flex-wrap">
              {data.whatsappUrl && (
                <a
                  href={data.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "var(--prem-dark-border)" }}
                  onClick={() => trackWhatsAppClick("footer")}
                >
                  <MessageCircle size={18} color="var(--prem-dark-muted)" />
                </a>
              )}
              {data.facebookUrl && (
                <a
                  href={data.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "var(--prem-dark-border)" }}
                >
                  <Facebook size={18} color="var(--prem-dark-muted)" />
                </a>
              )}
              {data.instagramUrl && (
                <a
                  href={data.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "var(--prem-dark-border)" }}
                >
                  <Instagram size={18} color="var(--prem-dark-muted)" />
                </a>
              )}
              {data.tiktokUrl && (
                <a
                  href={data.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "var(--prem-dark-border)" }}
                >
                  <Music2 size={18} color="var(--prem-dark-muted)" />
                </a>
              )}
            </div>
          </div>

          {/* Link groups */}
          {/* Los enlaces salen del panel y se reparten en dos columnas por
              espacio, no por tipo: rotularlas «Faciales» y «Corporales» hacía
              que «Mesoterapia Facial» apareciera bajo «Corporales». El
              consultorio no ofrece tratamientos corporales. */}
          <LinkGroup title="Tratamientos" links={data.facialTreatments} />
          <LinkGroup title="" links={data.bodyTreatments} />
          <LinkGroup title="Consultorio" links={data.officeLinks} />
          <LinkGroup title="Legal" links={data.legalLinks} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t px-6 py-8" style={{ borderColor: "oklch(16% 0.01 52)" }}>
        <div className="container-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>
            {data.copyrightText}
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>
            Desarrollado por{" "}
            <a
              href="https://www.ms-tech-stack.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: "var(--vintage-gold)", textDecoration: "none", fontWeight: 600, letterSpacing: "0.1em" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--vintage-gold-light)" }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--vintage-gold)" }}
            >
              MS-Tech-Stack
            </a>
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>
            {data.designedByText}
          </p>
        </div>
      </div>
    </footer>
  )
}
