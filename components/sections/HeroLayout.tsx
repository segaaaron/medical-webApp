"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { LinkButton } from "@/components/ui/Button"
import { StatCard } from "@/components/ui/StatCard"
import type { HeroStat, HeroCTA } from "@/types"

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]
const VINTAGE_GOLD = "#B8973B"

export interface HeroLayoutProps {
  tagline: string         // top eyebrow text
  doctorName: string      // animated word-by-word
  specialty: string       // subtitle below name
  description: string     // body text paragraph
  ctas: HeroCTA[]
  stats: HeroStat[]
}

export function HeroLayout({ tagline, doctorName, specialty, description, ctas, stats }: HeroLayoutProps) {
  const prefersReduced = useReducedMotion()
  const nameChars = doctorName.split("")
  const charCount = nameChars.length
  const center = (charCount - 1) / 2
  // Last char animates at: delay 0.15 + (charCount-1)*0.028 + duration 0.55
  const titleDuration = prefersReduced ? 0 : 0.15 + (charCount - 1) * 0.028 + 0.55
  const specialtyWords = specialty.split(" ")
  // Subtitle ends at: titleDuration + (words-1)*0.07 + duration 0.6
  const subtitleDuration = prefersReduced ? 0 : titleDuration + (specialtyWords.length - 1) * 0.07 + 0.6

  const { scrollY } = useScroll()
  const videoY = useTransform(scrollY, [0, 600], ["0%", "30%"])

  return (
    <section className="gradient-hero relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Video background with parallax */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ y: prefersReduced ? 0 : videoY }}
      >
        <video
          className="w-full h-full object-cover"
          style={{ height: "130%" }}
          autoPlay muted loop playsInline preload="metadata"
          aria-hidden="true"
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Overlay 1 — dark fade */}
      <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to top, rgba(26,5,16,0.95) 0%, rgba(58,15,32,0.75) 40%, rgba(58,15,32,0.35) 100%)" }} />
      {/* Overlay 2 — vignette */}
      <div className="absolute inset-0 z-[2]" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(26,5,16,0.6) 100%)" }} />

      {/* Decorative orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl opacity-20 z-[3]" style={{ background: "#5c1f35" }} />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full blur-3xl opacity-20 z-[3]" style={{ background: "#3a0f20" }} />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto py-20">
        {/* Eyebrow tagline */}
        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          className="text-sm md:text-base uppercase tracking-[0.3em] mb-4 font-medium"
          style={{ color: "#e8a0b4" }}
        >
          {tagline}
        </motion.p>

        {/* Doctor name — letter assembly from sides */}
        <h1
          className="font-bold text-4xl md:text-6xl lg:text-7xl mb-4 leading-tight"
          aria-label={doctorName}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline" }}
        >
          {nameChars.map((char, i) => {
            if (char === " ") {
              return <span key={i} aria-hidden="true" style={{ display: "inline-block", width: "0.3em" }} />
            }
            const dist = i - center
            // letters far from center travel further; max ~600px
            const xStart = dist < 0
              ? Math.max(-600, dist * 48)
              : Math.min(600, dist * 48)
            return (
              <motion.span
                key={i}
                aria-hidden="true"
                style={{ display: "inline-block" }}
                initial={prefersReduced ? false : { x: xStart, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 0.55,
                  delay: 0.15 + i * 0.028,
                  ease: EASE_OUT_EXPO,
                }}
              >
                {char}
              </motion.span>
            )
          })}
        </h1>

        {/* Specialty subtitle — word-by-word slide up, after title */}
        <p
          className="italic font-light text-3xl md:text-4xl lg:text-5xl mb-6"
          style={{ color: "#fce4ec", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.25em" }}
          aria-label={specialty}
        >
          {specialty.split(" ").map((word, i) => (
            <span key={i} style={{ overflow: "hidden", display: "inline-block" }}>
              <motion.span
                aria-hidden="true"
                style={{ display: "inline-block" }}
                initial={prefersReduced ? false : { y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: titleDuration + i * 0.07, ease: EASE_OUT_EXPO }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </p>

        {/* Gold divider */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: subtitleDuration + 0.05, ease: EASE_OUT_EXPO }}
          className="w-24 h-0.5 mx-auto mb-8 origin-center"
          style={{ backgroundColor: VINTAGE_GOLD }}
        />

        {/* Description */}
        <motion.p
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: subtitleDuration + 0.2 }}
          className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto font-light leading-relaxed"
          style={{ color: "#fce4ec" }}
        >
          {description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: subtitleDuration + 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {ctas.map((cta) => (
            <LinkButton key={cta.label} href={cta.href} variant={cta.variant} className="px-10 py-4">
              {cta.label}
            </LinkButton>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: subtitleDuration + 0.75 }}
          className="mt-16 flex flex-col md:flex-row gap-8 justify-center items-center"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: subtitleDuration + 0.75 + i * 0.1, ease: EASE_OUT_EXPO }}
            >
              <StatCard value={stat.value} label={stat.label} light />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        animate={prefersReduced ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: VINTAGE_GOLD }}>Descubre más</span>
        <div className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${VINTAGE_GOLD}, transparent)` }} />
      </motion.div>
    </section>
  )
}
