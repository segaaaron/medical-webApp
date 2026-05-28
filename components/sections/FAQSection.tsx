"use client"
import DOMPurify from "isomorphic-dompurify"
import { useState } from "react"
import { m, AnimatePresence, useReducedMotion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { SectionHeader } from "@/components/ui/SectionHeader"
import type { FAQ } from "@/types"

const GOLD = "#B8973B"
const TERRACOTTA = "oklch(58% 0.16 35)"

interface FAQSectionProps {
  faqs: FAQ[]
}

interface FAQItemProps {
  faq: FAQ
  index: number
  isOpen: boolean
  onToggle: () => void
  prefersReduced: boolean | null
}

function FAQItem({ faq, index, isOpen, onToggle, prefersReduced }: FAQItemProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <m.div
      initial={prefersReduced ? false : { opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      style={{
        borderRadius: "10px",
        overflow: "hidden",
        border: isOpen
          ? `1px solid rgba(184,151,59,0.55)`
          : hovered
          ? `1px solid rgba(184,151,59,0.35)`
          : `1px solid rgba(184,151,59,0.15)`,
        background: isOpen ? "#FEFAF2" : hovered ? "#FDFAF6" : "#FEFCF9",
        boxShadow: isOpen
          ? "0 4px 24px rgba(184,151,59,0.12)"
          : hovered
          ? "0 2px 12px rgba(184,151,59,0.08)"
          : "0 1px 4px rgba(58,15,32,0.04)",
        transition: "border 0.2s, background 0.2s, box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left gold accent bar */}
      <div style={{ display: "flex" }}>
        <div
          style={{
            width: "3px",
            flexShrink: 0,
            background: isOpen
              ? `linear-gradient(to bottom, ${GOLD}, rgba(184,151,59,0.3))`
              : "transparent",
            transition: "background 0.25s",
            borderRadius: "10px 0 0 10px",
          }}
        />

        <div style={{ flex: 1 }}>
          <button
            className="w-full flex items-center justify-between gap-4 text-left"
            style={{ padding: "20px 24px", cursor: "pointer", background: "none", border: "none" }}
            onClick={onToggle}
            aria-expanded={isOpen}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "15px",
                fontWeight: 600,
                lineHeight: 1.45,
                color: isOpen ? "#2a0d14" : "#3a0f20",
                transition: "color 0.2s",
              }}
            >
              {faq.question}
            </span>
            <m.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ flexShrink: 0 }}
            >
              <ChevronDown
                size={20}
                style={{ color: isOpen ? GOLD : TERRACOTTA, transition: "color 0.2s" }}
              />
            </m.span>
          </button>

          <AnimatePresence initial={false}>
            {isOpen && (
              <m.div
                key="answer"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    padding: "0 24px 22px",
                    borderTop: `1px solid rgba(184,151,59,0.18)`,
                    marginTop: "0",
                    paddingTop: "16px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-body, system-ui)",
                      fontSize: "14px",
                      lineHeight: 1.75,
                      color: "oklch(35% 0.018 55)",
                    }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer) }}
                  />
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </m.div>
  )
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const prefersReduced = useReducedMotion()

  return (
    <section
      id="faq"
      style={{
        padding: "clamp(64px, 10vw, 100px) 24px",
        background: "#F8F0E3",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <SectionHeader eyebrow="¿Tienes Preguntas?" title="Preguntas Frecuentes" />

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((faq, i) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              prefersReduced={prefersReduced}
            />
          ))}
        </div>

        {/* Bottom gold divider */}
        <div
          style={{
            marginTop: "56px",
            height: "1px",
            background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`,
            opacity: 0.4,
          }}
        />
      </div>
    </section>
  )
}
