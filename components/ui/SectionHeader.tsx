"use client"

import DOMPurify from "isomorphic-dompurify"
import { clsx } from "clsx"
import { m, useReducedMotion } from "framer-motion"
import type { SectionHeaderProps } from "@/types"
import { AnimatedTitle } from "./AnimatedTitle"

export function SectionHeader({ eyebrow, title, subtitle, light = false }: SectionHeaderProps) {
  const shouldReduceMotion = useReducedMotion()

  const revealTransition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

  const EyebrowLine = shouldReduceMotion ? (
    <div
      className="w-10 h-px mx-auto mb-3 origin-center"
      style={{ backgroundColor: "var(--prem-accent)" }}
    />
  ) : (
    <m.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={revealTransition}
      className="w-10 h-px mx-auto mb-3 origin-center"
      style={{ backgroundColor: "var(--prem-accent)" }}
    />
  )

  const GoldDivider = shouldReduceMotion ? (
    <svg width="160" height="16" viewBox="0 0 160 16" className="mx-auto my-8" aria-hidden="true">
      <line x1="0" y1="8" x2="64" y2="8" stroke="var(--vintage-gold)" strokeWidth="1" opacity="0.6" />
      <polygon points="80,2 86,8 80,14 74,8" fill="var(--vintage-gold)" opacity="0.9" />
      <line x1="96" y1="8" x2="160" y2="8" stroke="var(--vintage-gold)" strokeWidth="1" opacity="0.6" />
    </svg>
  ) : (
    <m.svg
      width="160" height="16" viewBox="0 0 160 16"
      className="mx-auto my-8"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <m.line
        x1="80" y1="8" x2="80" y2="8"
        stroke="var(--vintage-gold)" strokeWidth="1" opacity="0.6"
        animate={{ x1: 0, x2: 64 }}
        initial={{ x1: 80, x2: 80 }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      />
      <m.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "80px 8px", transformBox: "fill-box" } as React.CSSProperties}
      >
        <polygon points="80,2 86,8 80,14 74,8" fill="var(--vintage-gold)" />
      </m.g>
      <m.line
        x1="80" y1="8" x2="80" y2="8"
        stroke="var(--vintage-gold)" strokeWidth="1" opacity="0.6"
        animate={{ x1: 96, x2: 160 }}
        initial={{ x1: 80, x2: 80 }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </m.svg>
  )

  return (
    <div className="text-center mb-16">
      {EyebrowLine}
      <p
        className={clsx(
          "mb-4",
          light ? "" : ""
        )}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10.5px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: light ? "var(--prem-dark-muted)" : "var(--prem-accent)",
        }}
      >
        {eyebrow}
      </p>
      <AnimatedTitle
        text={title}
        as="h2"
        light={light}
        className="text-3xl md:text-5xl font-bold leading-tight"
      />
      {GoldDivider}
      {subtitle && (
        <p
          className={clsx(
            "text-lg max-w-2xl mx-auto leading-relaxed",
            light ? "text-[#fce4ec]" : "text-[#4a3540]"
          )}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(subtitle) }}
        />
      )}
    </div>
  )
}
