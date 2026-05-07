"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function StickyBackButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel")
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <Link
      href="/blog"
      className="fixed top-20 left-4 z-40 inline-flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium backdrop-blur-sm bg-white/80 shadow-md border border-gray-100 transition-all duration-300"
      style={{
        color: "#B8973B",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateX(0)" : "translateX(-1rem)",
      }}
      aria-label="Volver al blog"
    >
      <ArrowLeft size={16} />
      Blog
    </Link>
  )
}
