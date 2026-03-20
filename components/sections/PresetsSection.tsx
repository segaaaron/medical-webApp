"use client"
import { motion } from "framer-motion"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { Badge } from "@/components/ui/Badge"
import { LinkButton } from "@/components/ui/Button"
import type { PresetCategory } from "@/types"

interface PresetsSectionProps {
  presets: PresetCategory[]
}

export function PresetsSection({ presets }: PresetsSectionProps) {
  return (
    <section id="presets" className="py-20 px-6" style={{ backgroundColor: "#2f1c6a" }}>
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow="Lightroom Presets Collection"
            title="Film Emulation Presets"
            subtitle={`Hand-crafted from a professional workflow, inspired by <span style="color:#fcd34d;font-weight:600;">Kodak, Fujifilm, and Agfa</span> film stocks — giving your images that authentic analogue look.`}
            light
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {presets.map((preset, i) => (
            <motion.div
              key={preset.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer"
              style={{ backgroundColor: "#1F1346" }}
            >
              <div
                className="w-full h-40 rounded-lg mb-5 flex items-center justify-center text-5xl"
                style={{ backgroundColor: "#2f1c6a" }}
              >
                🎞️
              </div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-lg">{preset.name}</h3>
                <Badge label={preset.tag} color={preset.tagColor} />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#8c85ff" }}>
                {preset.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <LinkButton href="#" variant="primary" className="px-12">
            BUY MY PRESETS
          </LinkButton>
        </motion.div>
      </div>
    </section>
  )
}
