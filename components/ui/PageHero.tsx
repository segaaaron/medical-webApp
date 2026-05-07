"use client"
import { motion } from "framer-motion"

interface PageHeroProps {
  eyebrow: string
  title: string
  subtitle: string
}

export function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <div className="py-16 px-6 text-center" style={{ backgroundColor: "#1a0510" }}>
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-sm uppercase tracking-[0.3em] font-semibold mb-3"
        style={{ color: "#e8a0b4" }}
      >
        {eyebrow}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold text-white mb-4"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-base max-w-xl mx-auto"
        style={{ color: "#fce4ec" }}
      >
        {subtitle}
      </motion.p>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="w-16 h-0.5 mx-auto mt-6"
        style={{ backgroundColor: "#B8973B" }}
      />
    </div>
  )
}
