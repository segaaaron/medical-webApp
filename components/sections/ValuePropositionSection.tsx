"use client"
import { m, useReducedMotion } from "framer-motion"
import { Eye, Zap, Award, TrendingUp } from "lucide-react"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { TiltCard } from "@/components/ui/TiltCard"
import type { BioSection } from "@/types/about"


interface ValuePropositionSectionProps {
  features: BioSection | null
}

export function ValuePropositionSection({ features }: ValuePropositionSectionProps) {
  const prefersReduced = useReducedMotion()
  const cards = [
    { Icon: Eye, title: features?.card1Title ?? "", description: features?.card1Description ?? "" },
    { Icon: Zap, title: features?.card2Title ?? "", description: features?.card2Description ?? "" },
    { Icon: Award, title: features?.card3Title ?? "", description: features?.card3Description ?? "" },
    { Icon: TrendingUp, title: features?.card4Title ?? "", description: features?.card4Description ?? "" },
  ].filter((c) => c.title || c.description)
  return (
    <section className="py-20 px-6" style={{ backgroundColor: "#F8F0E3" }}>
      <div className="container-xl">
          <SectionHeader
            eyebrow={features?.chooseUs ?? ""}
            title={features?.title ?? ""}
            subtitle={features?.description}
          />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Tarjeta sin título ni descripción en el panel = tarjeta oculta. */}
          {cards.map(({ Icon, ...card }, i) => (
              <div key={i}>
                <TiltCard className="rounded-xl" glowColor="var(--vintage-gold)">
                  <m.div
                    initial={prefersReduced ? false : { opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
                    className="rounded-xl p-8 shadow-sm text-center"
                    style={{ backgroundColor: "#FFFDF8", border: "1px solid rgba(184,151,59,0.18)", transition: "border-color 0.25s, box-shadow 0.25s" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(184,151,59,0.45)"; el.style.boxShadow = "0 8px 28px rgba(184,151,59,0.1)" }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(184,151,59,0.18)"; el.style.boxShadow = "none" }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ backgroundColor: "#F8F0E3" }}
                    >
                      <Icon size={26} style={{ color: "var(--prem-accent)" }} />
                    </div>
                    <h3 className="font-bold text-lg mb-3" style={{ color: "var(--prem-fg)" }}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--prem-muted)" }}>
                      {card.description}
                    </p>
                  </m.div>
                </TiltCard>
              </div>
          ))}
        </div>
      </div>
    </section>
  )
}
