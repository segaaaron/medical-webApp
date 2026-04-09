import { MessageCircle, Facebook, Instagram } from "lucide-react"

export interface FooterData {
  doctorName: string
  specialty: string
  description: string
  whatsappUrl: string
  facebookUrl: string
  instagramUrl: string
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
      <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">{title}</h4>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm transition-colors hover:text-white"
              style={{ color: "#7a6570" }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer({ data }: { data: FooterData }) {
  const doctorName = data?.doctorName ?? ""
  const nameParts = doctorName.split(" ").slice(0, 2).join(" ")
  const nameRest = doctorName.split(" ").slice(2).join(" ")

  return (
    <footer id="contacto" style={{ backgroundColor: "#1a0510", paddingTop: "10px" }}>
      <div className="container-xl py-24 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-xl mb-1">{nameParts}</h3>
            {nameRest && <h3 className="text-white font-bold text-xl mb-2">{nameRest}</h3>}
            <p className="text-sm italic mb-4" style={{ color: "#e8a0b4" }}>
              {data.specialty}
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#7a6570" }}>
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
                  style={{ backgroundColor: "#5c1f35" }}
                >
                  <MessageCircle size={18} color="#e8a0b4" />
                </a>
              )}
              {data.facebookUrl && (
                <a
                  href={data.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#5c1f35" }}
                >
                  <Facebook size={18} color="#e8a0b4" />
                </a>
              )}
              {data.instagramUrl && (
                <a
                  href={data.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#5c1f35" }}
                >
                  <Instagram size={18} color="#e8a0b4" />
                </a>
              )}
            </div>
          </div>

          {/* Link groups */}
          <LinkGroup title="Tratamientos Faciales" links={data.facialTreatments} />
          <LinkGroup title="Tratamientos Corporales" links={data.bodyTreatments} />
          <LinkGroup title="Consultorio" links={data.officeLinks} />
          <LinkGroup title="Legal" links={data.legalLinks} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t px-6 py-8" style={{ borderColor: "#3a0f20" }}>
        <div className="container-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "#7a6570" }}>
            {data.copyrightText}
          </p>
          <p className="text-xs" style={{ color: "#7a6570" }}>
            {data.designedByText}
          </p>
        </div>
      </div>
    </footer>
  )
}
