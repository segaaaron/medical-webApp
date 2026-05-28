"use client"
import { useEffect, useRef, useState } from "react"
import { m, useInView, useReducedMotion } from "framer-motion"
import type { BioDoc } from "@/types/about"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"

interface AboutSectionProps {
  bio: BioDoc | null
}

function useCountUp(target: string, duration = 2000, prefersReduced = false) {
  const [display, setDisplay] = useState("0")
  const ref = useRef<HTMLDivElement>(null)
  const rafId = useRef<number>(0)
  const inView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!inView) return
    if (prefersReduced) { setDisplay(target); return }
    const numMatch = target.match(/^(\d+)(.*)$/)
    if (!numMatch) { setDisplay(target); return }
    const num = parseInt(numMatch[1], 10)
    const suffix = numMatch[2] ?? ""
    if (isNaN(num)) { setDisplay(target); return }

    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(num * eased)
      setDisplay(`${current}${suffix}`)
      if (progress < 1) rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [inView, target, duration, prefersReduced])

  return { ref, display }
}

interface CredProps {
  value: string
  label: string
  prefersReduced: boolean | null
}

function Cred({ value, label, prefersReduced }: CredProps) {
  const { ref, display } = useCountUp(value, 2000, prefersReduced ?? false)
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-60px" })

  return (
    <div
      ref={ref}
      style={{ borderTop: "1px solid oklch(80% 0.015 60)", paddingTop: "16px" }}
    >
      <p
        style={{
          fontFamily: "'Playfair Display', 'Iowan Old Style', Georgia, serif",
          fontSize: "clamp(26px, 3vw, 34px)",
          fontWeight: 500,
          color: "oklch(58% 0.16 35)",
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        {prefersReduced ? value : display}
      </p>
      {/* Animated underline that grows after counter finishes */}
      {!prefersReduced && (
        <m.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.4, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: "1.5px",
            backgroundColor: "#B8973B",
            transformOrigin: "left",
            marginBottom: "6px",
            width: "32px",
            opacity: 0.7,
          }}
        />
      )}
      <p style={{ fontSize: "13px", color: "oklch(48% 0.015 60)", lineHeight: 1.45 }}>
        {label}
      </p>
    </div>
  )
}

export function AboutSection({ bio }: AboutSectionProps) {
  const prefersReduced = useReducedMotion()

  const stats = [
    { value: bio?.experienceInfoValue ?? "", label: bio?.experienceInfoLabel ?? "" },
    { value: bio?.pacientValue ?? "", label: bio?.pacientsLabel ?? "" },
    { value: bio?.treatmentValue ?? "", label: bio?.treatmentLabel ?? "" },
  ]

  return (
    <section
      id="about"
      style={{
        padding: "clamp(64px, 10vw, 120px) 0",
        background: "#F8F0E3",
      }}
    >
      <div className="container-xl" style={{ paddingLeft: "clamp(20px, 5vw, 64px)", paddingRight: "clamp(20px, 5vw, 64px)", maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(48px, 7vw, 100px)",
            alignItems: "center",
          }}
          className="about-grid"
        >
          {/* Left — text */}
          <m.div
            initial={prefersReduced ? false : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow */}
            <p
              style={{
                fontFamily: "ui-monospace, 'IBM Plex Mono', Menlo, monospace",
                fontSize: "12px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "oklch(58% 0.16 35)",
                marginBottom: "16px",
              }}
            >
              {bio?.doctorTitle ?? "Sobre la Especialista"}
            </p>

            {/* Heading */}
            <h2
              style={{
                fontFamily: "'Playfair Display', 'Iowan Old Style', Georgia, serif",
                fontSize: "clamp(34px, 4.5vw, 58px)",
                fontWeight: 500,
                lineHeight: 1.12,
                letterSpacing: "-0.015em",
                color: "oklch(20% 0.02 60)",
                marginBottom: "24px",
              }}
            >
              {bio?.doctorName ?? ""}
            </h2>

            {/* Accent line */}
            <div
              style={{
                width: "48px",
                height: "2px",
                background: "oklch(58% 0.16 35)",
                marginBottom: "28px",
              }}
            />

            {/* Bio */}
            <p
              style={{
                fontFamily: "'Playfair Display', 'Iowan Old Style', Georgia, serif",
                fontSize: "clamp(16px, 1.8vw, 19px)",
                lineHeight: 1.72,
                color: "oklch(20% 0.02 60)",
                whiteSpace: "pre-line",
                marginBottom: "36px",
              }}
            >
              {bio?.doctorDescription ?? ""}
            </p>

            {/* Credentials grid */}
            <div
              className="about-credentials-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "22px",
              }}
            >
              {stats.map((s) =>
                s.value ? (
                  <Cred
                    key={`${s.value}-${s.label}`}
                    value={s.value}
                    label={s.label}
                    prefersReduced={prefersReduced}
                  />
                ) : null
              )}
            </div>
          </m.div>

          {/* Right — portrait */}
          <m.div
            initial={prefersReduced ? false : { opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative" }}
          >
            {/* Frame */}
            <div
              style={{
                aspectRatio: "4/5",
                background:
                  "linear-gradient(150deg, oklch(72% 0.04 62) 0%, oklch(58% 0.06 54) 45%, oklch(42% 0.04 48) 100%)",
                borderRadius: "2px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Color overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "oklch(66% 0.06 58 / 0.18)",
                  mixBlendMode: "color",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />

              {/* Image */}
              <ImageWithFallback
                src={bio?.doctorImage || "/images/DraMedrano.jpeg"}
                alt="Dra. Yasmin Medrano Avila — Médica especialista en medicina estética"
                variant="light"
                objectPosition="top"
                loading="eager"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Corner accent — bottom right */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-1px",
                  right: "-1px",
                  width: "72px",
                  height: "72px",
                  borderBottom: "2px solid oklch(58% 0.16 35)",
                  borderRight: "2px solid oklch(58% 0.16 35)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
              {/* Corner accent — top left */}
              <div
                style={{
                  position: "absolute",
                  top: "-1px",
                  left: "-1px",
                  width: "48px",
                  height: "48px",
                  borderTop: "2px solid rgba(184,151,59,0.5)",
                  borderLeft: "2px solid rgba(184,151,59,0.5)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Caption */}
            <p
              style={{
                fontFamily: "ui-monospace, 'IBM Plex Mono', Menlo, monospace",
                fontSize: "12px",
                letterSpacing: "0.13em",
                color: "oklch(48% 0.015 60)",
                textAlign: "right",
                marginTop: "12px",
              }}
            >
              Dra. Yasmin Medrano — Médica Especialista
            </p>
          </m.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .about-grid {
            grid-template-columns: 1fr !important;
          }
          .about-grid > div:last-child {
            order: -1;
            max-width: 340px;
            margin: 0 auto;
          }
          .about-credentials-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
