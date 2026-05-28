"use client"

import { MessageCircle, Phone, Instagram, Facebook } from "lucide-react"
import { m } from "framer-motion"
import type { ContactData } from "@/types/content"

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: "#5c1f35",
  border: "1px solid rgba(184,151,59,0.08)",
  transition: "border-color 0.25s, box-shadow 0.25s",
}

function hoverIn(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget as HTMLElement
  el.style.borderColor = "rgba(184,151,59,0.3)"
  el.style.boxShadow = "0 6px 24px rgba(184,151,59,0.1)"
}
function hoverOut(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget as HTMLElement
  el.style.borderColor = "rgba(184,151,59,0.08)"
  el.style.boxShadow = "none"
}

interface ContactCardsProps {
  ct: Pick<ContactData, "whatsappUrl" | "whatsappNumber" | "phone" | "instagram" | "instagramUrl" | "facebook" | "facebookUrl">
}

export function ContactCards({ ct }: ContactCardsProps) {
  const cards = [
    {
      href: ct.whatsappUrl,
      icon: <MessageCircle size={22} style={{ color: "#B8973B" }} />,
      label: "WhatsApp",
      value: ct.whatsappNumber,
      sub: "Respuesta rápida · Consulta gratuita",
    },
    {
      href: `tel:${ct.phone}`,
      icon: <Phone size={22} style={{ color: "#B8973B" }} />,
      label: "Teléfono",
      value: ct.phone,
      sub: undefined,
    },
    {
      href: ct.instagramUrl,
      icon: <Instagram size={22} style={{ color: "#e8a0b4" }} />,
      label: "Instagram",
      value: ct.instagram,
      sub: undefined,
    },
    {
      href: ct.facebookUrl,
      icon: <Facebook size={22} style={{ color: "#e8a0b4" }} />,
      label: "Facebook",
      value: ct.facebook,
      sub: undefined,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-white mb-2">Comunícate con nosotros</h2>
      {cards.map((card, i) => {
        const inner = (
          <>
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#3a0f20" }}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#e8a0b4" }}>{card.label}</p>
              <p className="text-white font-semibold">{card.value}</p>
              {card.sub && <p className="text-xs mt-1" style={{ color: "#7a6570" }}>{card.sub}</p>}
            </div>
          </>
        )

        if (card.href) {
          return (
            <m.a
              key={i}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-5 p-6 rounded-2xl"
              style={CARD_STYLE}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
              whileTap={{ scale: 0.98 }}
            >
              {inner}
            </m.a>
          )
        }

        return (
          <div
            key={i}
            className="flex items-center gap-5 p-6 rounded-2xl"
            style={{ ...CARD_STYLE }}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            {inner}
          </div>
        )
      })}
    </div>
  )
}
