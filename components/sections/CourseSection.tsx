"use client"
import { motion } from "framer-motion"
import { CheckCircle, Play, FileText, Download } from "lucide-react"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { LinkButton } from "@/components/ui/Button"
import type { CourseIncluded, CourseModule, CoursePricing, CourseItemIcon } from "@/types"

// Icon map — resolved client-side, not serialized across the boundary
const ICON_MAP: Record<CourseItemIcon, React.ElementType> = {
  Play,
  FileText,
  Download,
  CheckCircle,
}

interface CourseSectionProps {
  included: CourseIncluded[]
  modules: CourseModule[]
  pricing: CoursePricing
}

export function CourseSection({ included, modules, pricing }: CourseSectionProps) {
  const { currency, earlyBird, regular, savings } = pricing

  return (
    <section id="course" className="py-20 px-6" style={{ backgroundColor: "#1F1346" }}>
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow="Featured Course"
            title="Monochrome Conversion Masterclass"
            subtitle="The most complete system for mastering black &amp; white photography — covering Zone System, the proprietary <span style='color:#fcd34d;font-weight:700;'>TRIOME™ method</span>, and real-world applications across every genre."
            light
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Included + Modules */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-2xl font-bold mb-8 text-white">What&apos;s Inside</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {included.map((item) => {
                const Icon = ICON_MAP[item.iconName]
                return (
                  <div key={item.text} className="flex items-center gap-3">
                    <Icon size={20} style={{ color: "#00b090" }} className="shrink-0" />
                    <span className="text-sm" style={{ color: "#d5dfff" }}>
                      {item.text}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: "#2f1c6a" }}>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: "#8c85ff" }}>
                Course Modules
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {modules.map((mod) => (
                  <li key={mod.title} className="flex items-start gap-2 text-sm" style={{ color: "#d5dfff" }}>
                    <span style={{ color: "#ffcd35" }}>›</span>
                    {mod.title}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Pricing card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full"
              style={{ backgroundColor: "#2f1c6a" }}
            >
              <div
                className="text-center py-3 text-sm font-bold uppercase tracking-wider"
                style={{ backgroundColor: "#ffcd35", color: "#1d1e20" }}
              >
                🔥 Early-Bird — First 100 Seats Only
              </div>
              <div className="p-8 text-center">
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl"
                  style={{ backgroundColor: "#1F1346" }}
                >
                  📷
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Mono Course</h4>
                <p className="text-sm mb-6" style={{ color: "#8c85ff" }}>
                  Full Monochrome Conversion Masterclass
                </p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">
                    {currency}{earlyBird}
                  </span>
                  <span className="ml-2 text-sm line-through" style={{ color: "#727586" }}>
                    {currency}{regular}
                  </span>
                </div>
                <p className="text-xs mb-8" style={{ color: "#8c85ff" }}>
                  You save {currency}{savings} — limited time offer
                </p>
                <LinkButton href="#" variant="primary" className="w-full justify-center py-4">
                  SECURE YOUR SPOT NOW
                </LinkButton>
                <p className="text-xs mt-4" style={{ color: "#727586" }}>
                  Lifetime access · All future updates included
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <LinkButton href="#" variant="warning" className="px-12">
            BECOME A MONOCHROME MASTER TODAY
          </LinkButton>
        </motion.div>
      </div>
    </section>
  )
}
