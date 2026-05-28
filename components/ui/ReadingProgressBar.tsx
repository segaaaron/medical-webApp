"use client"

import { useEffect } from "react"
import { m, useMotionValue, useSpring, useReducedMotion } from "framer-motion"

export function ReadingProgressBar() {
  const prefersReduced = useReducedMotion()
  const raw = useMotionValue(0)
  const scaleX = useSpring(raw, { stiffness: 200, damping: 30, mass: 0.5 })

  useEffect(() => {
    if (prefersReduced) return

    function update() {
      const el = document.documentElement
      const scrollTop = el.scrollTop || document.body.scrollTop
      const height = el.scrollHeight - el.clientHeight
      raw.set(height > 0 ? scrollTop / height : 0)
    }

    window.addEventListener("scroll", update, { passive: true })
    update()
    return () => window.removeEventListener("scroll", update)
  }, [prefersReduced, raw])

  if (prefersReduced) return null

  return (
    <div
      className="fixed left-0 right-0 z-[9997] pointer-events-none"
      style={{ top: "env(safe-area-inset-top, 0px)", height: "3px", backgroundColor: "rgba(184,151,59,0.12)" }}
      aria-hidden="true"
    >
      <m.div
        style={{
          height: "100%",
          backgroundColor: "#B8973B",
          transformOrigin: "left",
          scaleX,
          boxShadow: "0 0 8px rgba(184,151,59,0.6)",
        }}
      />
    </div>
  )
}
