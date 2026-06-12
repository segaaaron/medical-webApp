"use client"

import { useRef } from "react"
import { m, useInView, useReducedMotion } from "framer-motion"

interface AnimatedTitleProps {
  text: string
  as?: "h1" | "h2" | "h3" | "h4"
  className?: string
  delay?: number
  light?: boolean
}

export function AnimatedTitle({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  light = false,
}: AnimatedTitleProps) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  if (!text.trim()) return null

  const words = text.split(" ")
  const color = light ? "#ffffff" : "var(--primary-darkest)"

  if (shouldReduceMotion) {
    return (
      <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className} style={{ fontFamily: "var(--font-heading)", color }}>
        {text}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={className}
      style={{ fontFamily: "var(--font-heading)", color }}
    >
      {words.map((word, index) => (
        <span
          key={word + index}
          style={{ overflow: "hidden", display: "inline-block", marginRight: "0.25em" }}
        >
          <m.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : { y: "110%" }}
            transition={{
              duration: 0.65,
              delay: delay + index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </m.span>
        </span>
      ))}
    </Tag>
  )
}
