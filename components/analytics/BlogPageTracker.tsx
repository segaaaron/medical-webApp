"use client"
import { useEffect } from "react"
import { trackBlogView, trackScrollDepth } from "@/lib/analytics"

interface Props {
  slug: string
  title: string
}

export function BlogPageTracker({ slug, title }: Props) {
  useEffect(() => {
    trackBlogView({ slug, title })

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
  }, [slug, title])

  return null
}
