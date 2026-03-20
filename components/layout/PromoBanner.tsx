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
    <div
      className="w-full text-center py-3 px-4 flex items-center justify-center gap-2 relative"
      style={{ backgroundColor: "#ffcd35", color: "#1d1e20" }}
    >
      <p className="text-sm font-bold uppercase tracking-wide">
        {data.text}{" "}
        <a href={data.ctaHref} className="underline hover:no-underline">
          {data.ctaLabel}
        </a>
      </p>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-60 transition-opacity"
        aria-label="Close banner"
      >
        <X size={18} />
      </button>
    </div>
  )
}
