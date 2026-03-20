"use client"
import { motion } from "framer-motion"
import { StatCard } from "@/components/ui/StatCard"
import type { AboutStat } from "@/types"

interface AboutSectionProps {
  bio: string[]
  stats: AboutStat[]
}

export function AboutSection({ bio, stats }: AboutSectionProps) {
  return (
    <section id="about" className="py-20 px-6" style={{ backgroundColor: "#1F1346" }}>
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div
                className="w-72 h-96 md:w-80 md:h-[480px] rounded-2xl flex items-center justify-center text-8xl"
                style={{ backgroundColor: "#2f1c6a" }}
              >
                👨‍🎨
              </div>
              <div
                className="absolute -bottom-4 -right-4 w-72 h-96 md:w-80 md:h-[480px] rounded-2xl border-2 -z-10"
                style={{ borderColor: "#673de6" }}
              />
              <div
                className="absolute -top-4 -left-4 rounded-xl px-4 py-3 shadow-lg"
                style={{ backgroundColor: "#ffcd35" }}
              >
                <p className="text-xs font-black uppercase tracking-wide text-gray-900">30+</p>
                <p className="text-xs font-medium text-gray-800">Years Experience</p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm uppercase tracking-[0.3em] font-semibold mb-4" style={{ color: "#8c85ff" }}>
              About James Nader
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
              30+ Years of Fashion, Advertising &amp; Commercial Photography
            </h2>
            <div className="w-16 h-1 mb-8" style={{ backgroundColor: "#ffcd35" }} />

            <div className="flex flex-col gap-5 text-base leading-relaxed" style={{ color: "#d5dfff" }}>
              {bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div
              className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t"
              style={{ borderColor: "#2f1c6a" }}
            >
              {stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} light />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
