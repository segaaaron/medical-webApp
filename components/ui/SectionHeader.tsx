"use client"

import DOMPurify from "isomorphic-dompurify"
import { clsx } from "clsx"
import { motion, useReducedMotion } from "framer-motion"
import type { SectionHeaderProps } from "@/types"
import { AnimatedTitle } from "./AnimatedTitle"

export function SectionHeader({ eyebrow, title, subtitle, light = false }: SectionHeaderProps) {
  const shouldReduceMotion = useReducedMotion()

  const revealTransition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

  const EyebrowLine = shouldReduceMotion ? (
    <div
      className="w-10 h-px mx-auto mb-3 origin-center"
      style={{ backgroundColor: "#B8973B" }}
    />
  ) : (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={revealTransition}
      className="w-10 h-px mx-auto mb-3 origin-center"
      style={{ backgroundColor: "#B8973B" }}
    />
  )

  const GoldDivider = shouldReduceMotion ? (
    <div className="w-20 h-1 mx-auto my-8" style={{ backgroundColor: "#B8973B" }} />
  ) : (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={revealTransition}
      className="w-20 h-1 mx-auto my-8 origin-center"
      style={{ backgroundColor: "#B8973B" }}
    />
  )

  return (
    <div className="text-center mb-16">
      {EyebrowLine}
      <p
        className={clsx(
          "text-sm uppercase tracking-[0.3em] font-semibold mb-4",
          light ? "text-[#e8a0b4]" : "text-[#8f3452]"
        )}
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
