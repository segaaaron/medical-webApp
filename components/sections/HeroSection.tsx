"use client"
import { motion } from "framer-motion"
import { LinkButton } from "@/components/ui/Button"
import { StatCard } from "@/components/ui/StatCard"
import type { HeroStat, HeroCTA } from "@/types"

interface HeroSectionProps {
  stats: HeroStat[]
  ctas: HeroCTA[]
}

export function HeroSection({ stats, ctas }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Dark overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(135deg, rgba(58,15,32,0.92) 0%, rgba(92,31,53,0.80) 50%, rgba(122,42,74,0.70) 100%)",
        }}
      />

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10" style={{ background: "#b5496a" }} />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-10" style={{ background: "#e8a0b4" }} />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto py-20">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-sm md:text-base uppercase tracking-[0.3em] mb-4 font-medium"
          style={{ color: "#e8a0b4" }}
        >
          Medicina Estética · Rejuvenecimiento · Tratamientos Corporales
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-bold text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight"
        >
          Dra. Yasmin Medrano Avila
          <br />
          <span className="italic font-light text-3xl md:text-4xl lg:text-5xl" style={{ color: "#fce4ec" }}>
            Medicina Estética Avanzada
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-24 h-1 mx-auto mb-8"
          style={{ backgroundColor: "#c9a96e" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto font-light leading-relaxed"
          style={{ color: "#fce4ec" }}
        >
          Realza tu belleza natural con{" "}
          <span className="font-bold" style={{ color: "#c9a96e" }}>tratamientos seguros y efectivos</span>
          {" "}diseñados especialmente para ti.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {ctas.map((cta) => (
            <LinkButton key={cta.label} href={cta.href} variant={cta.variant} className="px-10 py-4">
              {cta.label}
            </LinkButton>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 flex flex-col md:flex-row gap-8 justify-center items-center"
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} light />
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: "#e8a0b4" }}>Descubre más</span>
        <div className="w-px h-8 bg-gradient-to-b from-pink-300 to-transparent" />
      </motion.div>
    </section>
  )
}
