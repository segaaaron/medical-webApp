"use client"
import { useEffect } from "react"
import { trackTreatmentView, trackScrollDepth } from "@/lib/analytics"

interface Props {
  id: string
  name: string
}

/**
 * RSC-safe tracker: mounts in the client, fires treatment_view once
 * and tracks scroll depth milestones (25/50/75/100%).
 */
export function TreatmentPageTracker({ id, name }: Props) {
  useEffect(() => {
    trackTreatmentView({ id, name })

    const milestones = new Set<number>()
    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      const pct = Math.round((scrolled / total) * 100)
      for (const m of [25, 50, 75, 100]) {
        if (pct >= m && !milestones.has(m)) {
          milestones.add(m)
          trackScrollDepth(m)
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [id, name])

  return null
}
