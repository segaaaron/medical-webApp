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
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, #1F1346 0%, #2f1c6a 40%, #3d1a8a 70%, #1F1346 100%)",
        }}
      />
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10" style={{ background: "#673de6" }} />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-10" style={{ background: "#8c85ff" }} />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto py-20">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-sm md:text-base uppercase tracking-[0.3em] mb-4 font-medium"
          style={{ color: "#8c85ff" }}
        >
          Photography · Courses · Workshops · Tutorials · Presets
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-bold text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight"
        >
          James Nader
          <br />
          <span className="italic font-light" style={{ color: "#d5dfff" }}>
            Photography Academy
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-24 h-1 mx-auto mb-8"
          style={{ backgroundColor: "#ffcd35" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto font-light leading-relaxed"
          style={{ color: "#d5dfff" }}
        >
          Most photographers never cross the{" "}
          <span className="font-bold text-yellow-300">£1K barrier</span> and it has nothing to do
          with their gear.
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
        <span className="text-xs uppercase tracking-widest text-purple-300">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-purple-300 to-transparent" />
      </motion.div>
    </section>
  )
}
