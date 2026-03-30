"use client"
import { useState } from "react"
import { X } from "lucide-react"
import type { PromoBannerData } from "@/types"

interface PromoBannerProps {
  data: PromoBannerData
}

const isExternal = (href: string) => href.startsWith("http") || href.startsWith("https")

export function PromoBanner({ data }: PromoBannerProps) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  const external = isExternal(data.ctaHref)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl text-center py-10 px-8 shadow-2xl"
        style={{ backgroundColor: "#fde8ef", color: "#3a0f20" }}
      >
        <div className="text-4xl mb-3">💉</div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#b5496a" }}>
          Promoción Especial · MedSkin
        </p>
        <p className="text-lg md:text-xl font-bold leading-snug mb-1" style={{ color: "#3a0f20" }}>
          Biorevitalización con <span style={{ color: "#b5496a" }}>NCTF 135 HA</span>
        </p>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "#5c1f35" }}>
          Renueva e hidrata tu piel profundamente con el tratamiento estrella de la medicina estética. ¡Plazas limitadas!
        </p>
        <p className="text-xs mb-6" style={{ color: "#7a6570" }}>
          Dra. Yasmin Medrano Avila · Ciudad Cochabamba
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={data.ctaHref}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#25D366", color: "white" }}
          >
            <span>💬</span> Reservar por WhatsApp
          </a>
          <button
            onClick={() => setVisible(false)}
            className="px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide border-2 transition-opacity hover:opacity-60"
            style={{ borderColor: "#b5496a", color: "#b5496a" }}
          >
            Quizás después
          </button>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 hover:opacity-60 transition-opacity"
          aria-label="Cerrar"
          style={{ color: "#b5496a" }}
        >
          <X size={24} />
        </button>
      </div>
    </div>
  )
}
