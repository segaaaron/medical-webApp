"use client"
import { motion, useReducedMotion } from "framer-motion"
import { Eye, Zap, Award, TrendingUp } from "lucide-react"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { TiltCard } from "@/components/ui/TiltCard"
import { BioSection } from "@/app/nosotros/page"


interface ValuePropositionSectionProps {
  features: BioSection | null
}

export function ValuePropositionSection({ features }: ValuePropositionSectionProps) {
  const prefersReduced = useReducedMotion()
  return (
    <section className="py-20 px-6" style={{ backgroundColor: "#faf5f7" }}>
      <div className="container-xl">
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow={features?.chooseUs ?? ""}
            title={features?.title ?? ""}
            subtitle={features?.description ?? ""}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <TiltCard className="rounded-xl" glowColor="#B8973B">
                  <motion.div
                    key="card-eye-1"
                    initial={prefersReduced ? false : { opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1 * 0.1 }}
                    className="bg-white rounded-xl p-8 shadow-sm text-center"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ backgroundColor: "#fde8ef" }}
                    >
                      <Eye size={26} style={{ color: "#b5496a" }} />
                    </div>
                    <h3 className="font-bold text-lg mb-3" style={{ color: "#3a0f20" }}>
                      {features?.card1Title ?? ""}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#7a6570" }}>
                      {features?.card1Description ?? ""}
                    </p>
                  </motion.div>
                </TiltCard>
              </div>

              <div>
                <TiltCard className="rounded-xl" glowColor="#B8973B">
                  <motion.div
                    key="card-Zap-2"
                    initial={prefersReduced ? false : { opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 2 * 0.1 }}
                    className="bg-white rounded-xl p-8 shadow-sm text-center"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ backgroundColor: "#fde8ef" }}
                    >
                      <Zap size={26} style={{ color: "#b5496a" }} />
                    </div>
                    <h3 className="font-bold text-lg mb-3" style={{ color: "#3a0f20" }}>
                      {features?.card2Title ?? ""}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#7a6570" }}>
                      {features?.card2Description ?? ""}
                    </p>
                  </motion.div>
                </TiltCard>
              </div>

              <div>
                <TiltCard className="rounded-xl" glowColor="#B8973B">
                  <motion.div
                    key="card-Award-3"
                    initial={prefersReduced ? false : { opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 3 * 0.1 }}
                    className="bg-white rounded-xl p-8 shadow-sm text-center"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ backgroundColor: "#fde8ef" }}
                    >
                      <Award size={26} style={{ color: "#b5496a" }} />
                    </div>
                    <h3 className="font-bold text-lg mb-3" style={{ color: "#3a0f20" }}>
                      {features?.card3Title ?? ""}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#7a6570" }}>
                      {features?.card3Description ?? ""}
                    </p>
                  </motion.div>
                </TiltCard>
              </div>

              <div>
                <TiltCard className="rounded-xl" glowColor="#B8973B">
                  <motion.div
                    key="card-TrendingUp-4"
                    initial={prefersReduced ? false : { opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 4 * 0.1 }}
                    className="bg-white rounded-xl p-8 shadow-sm text-center"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ backgroundColor: "#fde8ef" }}
                    >
                      <TrendingUp size={26} style={{ color: "#b5496a" }} />
                    </div>
                    <h3 className="font-bold text-lg mb-3" style={{ color: "#3a0f20" }}>
                      {features?.card4Title ?? ""}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#7a6570" }}>
                      {features?.card4Description ?? ""}
                    </p>
                  </motion.div>
                </TiltCard>
              </div>
        </div>
      </div>
    </section>
  )
}
