"use client"

import { useEffect, useState } from "react"
import { motion, useSpring, useReducedMotion } from "framer-motion"

const VINTAGE_GOLD = "#B8973B"
const ROSE = "#e8a0b4"

function SyringeSVG({ color, scale }: { color: string; scale: number }) {
  return (
    <svg
      width={52}
      height={52}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `scale(${scale})`, transformOrigin: "4px 4px", display: "block" }}
    >
      {/*
        Syringe drawn in local space (horizontal, tip pointing right at x=0),
        then rotate(45) + translate(4,4) so:
          • tip lands at SVG pixel (4,4)  ← aligns with cursor hot-point
          • body extends to bottom-right
      */}
      <g transform="translate(4,4) rotate(45)">
        {/* ── Needle tip (cone) ──────────────────────────── */}
        <polygon points="0,0 8,-1.2 8,1.2" fill={color} />

        {/* ── Needle shaft ───────────────────────────────── */}
        <rect x="8" y="-1" width="5" height="2" fill={color} rx="0.5" />

        {/* ── Needle hub ─────────────────────────────────── */}
        <rect x="13" y="-3" width="3" height="6" rx="1" fill={color} />

        {/* ── Barrel (outline) ───────────────────────────── */}
        <rect x="16" y="-5.5" width="22" height="11" rx="2.5" fill="none" stroke={color} strokeWidth="1.5" />

        {/* ── Liquid fill ────────────────────────────────── */}
        <rect x="17.5" y="-4" width="13" height="8" rx="1.5" fill={color} opacity="0.22" />

        {/* ── Graduation marks ───────────────────────────── */}
        <line x1="23" y1="-4.5" x2="23" y2="4.5" stroke={color} strokeWidth="0.8" opacity="0.55" />
        <line x1="28" y1="-4.5" x2="28" y2="4.5" stroke={color} strokeWidth="0.8" opacity="0.55" />
        <line x1="33" y1="-4.5" x2="33" y2="4.5" stroke={color} strokeWidth="0.8" opacity="0.55" />

        {/* ── Plunger rod ────────────────────────────────── */}
        <rect x="38" y="-1" width="4" height="2" fill={color} />

        {/* ── Plunger disc ───────────────────────────────── */}
        <rect x="42" y="-5.5" width="3.5" height="11" rx="1.5" fill={color} />

        {/* ── Plunger finger flanges (thumb grips) ───────── */}
        <rect x="41" y="-8" width="5.5" height="2.5" rx="1" fill={color} opacity="0.8" />
        <rect x="41" y="5.5" width="5.5" height="2.5" rx="1" fill={color} opacity="0.8" />
      </g>
    </svg>
  )
}

export function CustomCursor() {
  const prefersReduced = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [hovering, setHovering] = useState(false)

  // Syringe snaps sharply to cursor (tip precision)
  const syringeX = useSpring(0, { stiffness: 800, damping: 50 })
  const syringeY = useSpring(0, { stiffness: 800, damping: 50 })
  // Ring lags behind for depth effect
  const ringX = useSpring(0, { stiffness: 150, damping: 20 })
  const ringY = useSpring(0, { stiffness: 150, damping: 20 })

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    if (prefersReduced) return

    const onMove = (e: MouseEvent) => {
      syringeX.set(e.clientX)
      syringeY.set(e.clientY)
      ringX.set(e.clientX)
      ringY.set(e.clientY)
      setVisible(true)
    }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)
    const onDown  = () => setClicked(true)
    const onUp    = () => setClicked(false)

    const onHoverIn = (e: MouseEvent) => {
      if ((e.target as Element).closest("a, button, [role='button'], input, textarea, select"))
        setHovering(true)
    }
    const onHoverOut = (e: MouseEvent) => {
      if ((e.target as Element).closest("a, button, [role='button'], input, textarea, select"))
        setHovering(false)
    }

    document.addEventListener("mousemove",  onMove)
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseenter", onEnter)
    document.addEventListener("mousedown",  onDown)
    document.addEventListener("mouseup",    onUp)
    document.addEventListener("mouseover",  onHoverIn)
    document.addEventListener("mouseout",   onHoverOut)

    document.documentElement.style.cursor = "none"

    return () => {
      document.removeEventListener("mousemove",  onMove)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseenter", onEnter)
      document.removeEventListener("mousedown",  onDown)
      document.removeEventListener("mouseup",    onUp)
      document.removeEventListener("mouseover",  onHoverIn)
      document.removeEventListener("mouseout",   onHoverOut)
      document.documentElement.style.cursor = ""
    }
  }, [syringeX, syringeY, ringX, ringY, prefersReduced])

  if (prefersReduced) return null

  const color = hovering ? ROSE : VINTAGE_GOLD
  // Needle tip is at pixel (4,4) inside the 52×52 SVG
  // Offset so the tip aligns exactly with the real cursor position
  const TIP_OFFSET = -4

  return (
    <>
      {/* ── Syringe ───────────────────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: syringeX,
          y: syringeY,
          translateX: `${TIP_OFFSET}px`,
          translateY: `${TIP_OFFSET}px`,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s",
          filter: hovering
            ? `drop-shadow(0 0 6px ${ROSE}80)`
            : `drop-shadow(0 0 4px ${VINTAGE_GOLD}60)`,
        }}
      >
        <SyringeSVG color={color} scale={clicked ? 0.88 : 1} />
      </motion.div>

      {/* ── Lagging ring ──────────────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width:  hovering ? 52 : clicked ? 32 : 40,
          height: hovering ? 52 : clicked ? 32 : 40,
          border: `1.5px solid ${color}`,
          opacity: visible ? (hovering ? 0.7 : 0.35) : 0,
          transition: "width 0.25s, height 0.25s, border-color 0.2s, opacity 0.2s",
        }}
      />
    </>
  )
}
