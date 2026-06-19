"use client"
import { useState, useEffect, useRef } from "react"
import { X, MessageCircle, Sparkles } from "lucide-react"
import type { PromoDisplayData } from "@/lib/data/promo"

interface PromoBannerProps {
  data: PromoDisplayData
}

const STORAGE_KEY = "promo_banner_seen"
const TITLE_ID = "promo-banner-title"
const isExternal = (href: string) => href.startsWith("http") || href.startsWith("https")

export function PromoBanner({ data }: PromoBannerProps) {
  const [visible, setVisible] = useState(false)
  const [shown, setShown] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data.active && !sessionStorage.getItem(STORAGE_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- gate de visibilidad (sessionStorage solo en cliente)
      setVisible(true)
    }
  }, [data.active])

  useEffect(() => {
    if (visible) {
      dialogRef.current?.focus()
      const t = setTimeout(() => setShown(true), 20)
      return () => clearTimeout(t)
    }
  }, [visible])

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }

  if (!visible) return null

  const external = isExternal(data.ctaHref)
  const hasImage = !!data.imageUrl

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26,5,16,0.74)", backdropFilter: "blur(5px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        className="relative w-full max-w-md overflow-hidden rounded-[28px] shadow-2xl outline-none focus:outline-none focus-visible:outline-none"
        style={{
          backgroundColor: "var(--primary-darkest, #3a0f20)",
          minHeight: "min(78vh, 600px)",
          transform: shown ? "scale(1)" : "scale(0.94)",
          opacity: shown ? 1 : 0,
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease",
        }}
      >
        {/* Imagen de fondo a sangre completa */}
        {hasImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={data.imageUrl}
            alt={data.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Placeholder elegante mientras no haya foto */
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ background: "linear-gradient(150deg, var(--primary-darker, #5c1f35) 0%, var(--primary-darkest, #3a0f20) 100%)" }}
          >
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full" style={{ background: "radial-gradient(circle, rgba(184,151,59,0.28), transparent 70%)" }} />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(143,52,82,0.5), transparent 70%)" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center justify-center w-24 h-24 rounded-full" style={{ border: "1px solid rgba(184,151,59,0.4)", backgroundColor: "rgba(184,151,59,0.08)" }}>
                <Sparkles size={40} style={{ color: "rgba(212,180,131,0.85)" }} aria-hidden="true" />
              </div>
            </div>
          </div>
        )}

        {/* Degradado para legibilidad del texto inferior */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(26,5,16,0.96) 0%, rgba(26,5,16,0.72) 32%, rgba(26,5,16,0.15) 62%, rgba(26,5,16,0.35) 100%)" }}
          aria-hidden="true"
        />

        {/* Chips de oferta — arriba izquierda (máx 2): oferta sólida dorada + urgencia glassy */}
        <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-1.5">
          {(data.badges.length > 0 ? data.badges : [data.label]).slice(0, 2).map((badge, i) =>
            i === 0 ? (
              <span
                key={badge}
                className="inline-flex items-center text-[11px] font-bold uppercase px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "var(--vintage-gold)", color: "#3a0f20", letterSpacing: "0.12em", boxShadow: "0 4px 14px rgba(0,0,0,0.35)" }}
              >
                {badge}
              </span>
            ) : (
              <span
                key={badge}
                className="inline-flex items-center text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: "rgba(26,5,16,0.5)",
                  color: "var(--vintage-gold-light, #D4B483)",
                  border: "1px solid rgba(212,180,131,0.5)",
                  letterSpacing: "0.12em",
                  backdropFilter: "blur(4px)",
                }}
              >
                {badge}
              </span>
            )
          )}
        </div>

        {/* Cerrar — arriba derecha */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full transition-transform hover:scale-110"
          aria-label="Cerrar"
          style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#fff", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          <X size={18} />
        </button>

        {/* Contenido sobre la imagen */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-7 flex flex-col">
          {/* Urgencia — eyebrow con punto pulsante */}
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "var(--vintage-gold-light, #D4B483)" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "var(--vintage-gold)" }} />
            </span>
            <span className="text-[10px] font-bold uppercase" style={{ color: "#F0D9A8", fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.2em", textShadow: "0 1px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.7)" }}>
              Oferta por tiempo limitado
            </span>
          </div>

          <h2
            id={TITLE_ID}
            className="text-2xl md:text-3xl font-light leading-tight text-white"
            style={{ fontFamily: "var(--font-heading, Georgia, serif)", letterSpacing: "-0.01em", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
          >
            {data.title}
            {data.highlightedText && (
              <> <span style={{ color: "var(--vintage-gold-light, #D4B483)", fontWeight: 600 }}>{data.highlightedText}</span></>
            )}
          </h2>

          <div className="mt-3 w-12 h-px" style={{ backgroundColor: "var(--vintage-gold)" }} />

          <p className="mt-3 text-sm leading-relaxed line-clamp-3" style={{ color: "rgba(255,255,255,0.88)" }}>
            {data.description}
          </p>

          <p className="mt-2.5 text-[11px]" style={{ color: "rgba(212,180,131,0.85)", fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.04em" }}>
            {data.doctorName} · {data.location}
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            <a
              href={data.ctaHref}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: "#25D366", color: "white", boxShadow: "0 8px 22px rgba(37,211,102,0.4)" }}
            >
              <MessageCircle size={17} aria-hidden="true" /> {data.ctaLabel}
            </a>
            <p className="text-center text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              Sin compromiso · Cupos limitados
            </p>
            <button
              onClick={dismiss}
              className="w-full py-2 rounded-full font-semibold text-xs uppercase tracking-wide transition-colors hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em" }}
            >
              {data.dismissLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
