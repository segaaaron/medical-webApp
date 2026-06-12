"use client"
import { trackWhatsAppClick } from "@/lib/analytics"

interface Props {
  href: string
  source: string
  treatment?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

/**
 * Drop-in replacement for <a> that fires a WhatsApp tracking event.
 * Usable inside RSC pages.
 */
export function TrackWhatsAppLink({ href, source, treatment, className, style, children }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      onClick={() => trackWhatsAppClick(source, treatment)}
    >
      {children}
    </a>
  )
}
