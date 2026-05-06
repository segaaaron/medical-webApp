"use client"
import { useEffect, useRef, useState } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { BioDoc } from "@/app/nosotros/page"

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
    if (prefersReduced) return
    // Extract numeric part from strings like "10+", "5000+", "500+"
    const numMatch = target.match(/^(\d+)(.*)$/)
    if (!numMatch) { setDisplay(target); return }
    const num = parseInt(numMatch[1], 10)
    const suffix = numMatch[2] ?? ""
    if (isNaN(num)) { setDisplay(target); return }

    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
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

interface AnimatedStatProps {
  value: string
  label: string
  prefersReduced: boolean | null
}

function AnimatedStat({ value, label, prefersReduced }: AnimatedStatProps) {
  const { ref, display } = useCountUp(value, 2000, prefersReduced ?? false)
  return (
    <div ref={ref} className="text-center">
      <p
        className="text-3xl font-bold mb-1"
        style={{ color: "#B8973B", fontFamily: "var(--font-heading)" }}
      >
        {prefersReduced ? value : display}
      </p>
      <p className="text-sm" style={{ color: "#e8a0b4" }}>{label}</p>
    </div>
  )
}

export function AboutSection({ bio }: AboutSectionProps) {
  const prefersReduced = useReducedMotion()

  return (
    <section id="about" className="py-20 px-6" style={{ backgroundColor: "#3a0f20" }}>
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-72 h-96 md:w-80 md:h-[480px] rounded-2xl overflow-hidden"
                style={{ backgroundColor: "#5c1f35" }}
              >
                <img
                  src={bio?.doctorImage || "/images/DraMedrano.jpeg"}
                  alt="Dra. Yasmin Medrano Avila - Medica especialista en medicina estetica con mas de 10 anos de experiencia"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div
                className="absolute -bottom-4 -right-4 w-72 h-96 md:w-80 md:h-[480px] rounded-2xl border-2 -z-10"
                style={{ borderColor: "#b5496a" }}
              />
              <div
                className="absolute -top-4 -left-4 rounded-xl px-4 py-3 shadow-lg"
                style={{ backgroundColor: "#c9a96e" }}
              >
                <p className="text-xs font-black uppercase tracking-wide text-white">{bio?.badgeDoctor ?? ""}+</p>
                <p className="text-xs font-medium text-white">{bio?.experienceInfoLabel ?? ""}</p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm uppercase tracking-[0.3em] font-semibold mb-4" style={{ color: "#e8a0b4" }}>
              {bio?.doctorTitle ?? ""}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
              {bio?.doctorName ?? ""}
            </h2>
            <div className="w-16 h-1 mb-8" style={{ backgroundColor: "#c9a96e" }} />

            <div className="flex flex-col gap-5 text-base leading-relaxed" style={{ color: "#fce4ec" }}>
              <p className="whitespace-pre-line leading-loose"> {bio?.doctorDescription ?? ""} </p>
            </div>

            <div
              className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t"
              style={{ borderColor: "#5c1f35" }}
            >
              {[
                { value: bio?.experienceInfoValue ?? "", label: bio?.experienceInfoLabel ?? "" },
                { value: bio?.pacientValue ?? "", label: bio?.pacientsLabel ?? "" },
                { value: bio?.treatmentValue ?? "", label: bio?.treatmentLabel ?? "" },
              ].map((stat) => (
                <AnimatedStat
                  key={`${stat.value}-${stat.label}`}
                  value={stat.value}
                  label={stat.label}
                  prefersReduced={prefersReduced}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
