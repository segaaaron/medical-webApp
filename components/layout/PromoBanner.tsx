"use client"
import { useState } from "react"
import { X } from "lucide-react"
import type { PromoBannerData } from "@/types"

interface PromoBannerProps {
  data: PromoBannerData
}

export function PromoBanner({ data }: PromoBannerProps) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl text-center py-10 px-8 shadow-2xl"
        style={{ backgroundColor: "#ffcd35", color: "#1d1e20" }}
      >
        <p className="text-xl md:text-2xl font-bold uppercase tracking-wide leading-snug">
          {data.text}{" "}
          <a href={data.ctaHref} className="underline hover:no-underline">
            {data.ctaLabel}
          </a>
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <a
            href={data.ctaHref}
            className="px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#1d1e20", color: "#ffcd35" }}
          >
            Ver promoción
          </a>
          <button
            onClick={() => setVisible(false)}
            className="px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide border-2 transition-opacity hover:opacity-60"
            style={{ borderColor: "#1d1e20", color: "#1d1e20" }}
          >
            Cancelar
          </button>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 hover:opacity-60 transition-opacity"
          aria-label="Close banner"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  )
}
