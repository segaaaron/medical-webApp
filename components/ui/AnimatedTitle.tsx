"use client"

import { motion, useReducedMotion } from "framer-motion"

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
  if (!text.trim()) return null
  const words = text.split(" ")

  const color = light ? "#ffffff" : "#3a0f20"

  if (shouldReduceMotion) {
    return (
      <Tag
        className={className}
        style={{ fontFamily: "var(--font-heading)", color }}
      >
        {text}
      </Tag>
    )
  }

  return (
    <Tag
      className={className}
      style={{ fontFamily: "var(--font-heading)", color }}
    >
      {words.map((word, index) => (
        <span
          key={word + index}
          style={{ overflow: "hidden", display: "inline-block", marginRight: "0.25em" }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.65,
              delay: delay + index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
