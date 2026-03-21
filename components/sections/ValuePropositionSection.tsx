"use client"
import { motion } from "framer-motion"
import { Eye, Zap, Award, TrendingUp } from "lucide-react"
import { SectionHeader } from "@/components/ui/SectionHeader"
import type { ValueFeature, ValueFeatureIcon } from "@/types"

// Icon map — resolved client-side, not serialized across the boundary
const ICON_MAP: Record<ValueFeatureIcon, React.ElementType> = {
  Eye,
  Zap,
  Award,
  TrendingUp,
}

interface ValuePropositionSectionProps {
  features: ValueFeature[]
}

export function ValuePropositionSection({ features }: ValuePropositionSectionProps) {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: "#f2f3f6" }}>
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow="The Hidden System"
            title="Most photographers never cross the £1K barrier"
            subtitle="It has nothing to do with their gear. It&apos;s about vision, technique, and a <span style='color:#673de6;font-weight:700;'>system that works</span>. That&apos;s exactly what James Nader teaches."
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => {
            const Icon = ICON_MAP[feature.iconName]
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: "#ebe4ff" }}
                >
                  <Icon size={26} style={{ color: "#673de6" }} />
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: "#1F1346" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#727586" }}>
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
