"use client"
import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import type { PromoDisplayData } from "@/lib/data/promo"

interface PromoBannerProps {
  data: PromoDisplayData
}

const STORAGE_KEY = "promo_banner_seen"
const TITLE_ID = "promo-banner-title"
const isExternal = (href: string) => href.startsWith("http") || href.startsWith("https")

export function PromoBanner({ data }: PromoBannerProps) {
  const [visible, setVisible] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data.active && !sessionStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [data.active])

  // Move focus into the dialog when it opens
  useEffect(() => {
    if (visible) {
      dialogRef.current?.focus()
    }
  }, [visible])

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }

  if (!visible) return null

  const external = isExternal(data.ctaHref)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        className="relative w-full max-w-lg mx-4 rounded-2xl text-center py-10 px-8 shadow-2xl outline-none"
        style={{ backgroundColor: "#FDF8F2", color: "var(--primary-darkest)", border: "1px solid rgba(184,151,59,0.2)" }}
      >
        <div className="text-4xl mb-3" aria-hidden="true">💉</div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--vintage-gold)" }}>
          {data.label}
        </p>
        <p id={TITLE_ID} className="text-lg md:text-xl font-bold leading-snug mb-1" style={{ color: "var(--primary-darkest)" }}>
          {data.title}{data.highlightedText && (
            <> <span style={{ color: "var(--vintage-gold)" }}>{data.highlightedText}</span></>
          )}
        </p>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--primary-darker)" }}>
          {data.description}
        </p>
        <p className="text-xs mb-6" style={{ color: "var(--gray-mid)" }}>
          {data.doctorName} · {data.location}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={data.ctaHref}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#25D366", color: "white" }}
          >
            <span aria-hidden="true">💬</span> {data.ctaLabel}
          </a>
          <button
            onClick={dismiss}
            className="px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide border-2 transition-opacity hover:opacity-60"
            style={{ borderColor: "var(--vintage-gold)", color: "var(--vintage-gold)" }}
          >
            {data.dismissLabel}
          </button>
        </div>
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 hover:opacity-60 transition-opacity"
          aria-label="Cerrar"
          style={{ color: "var(--vintage-gold)" }}
        >
          <X size={24} />
        </button>
      </div>
    </div>
  )
}
