"use client"
import { useRef, useState, useEffect } from "react"
import { m, useSpring, useReducedMotion } from "framer-motion"

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  glowColor?: string
  intensity?: number
}

export function TiltCard({
  children,
  className = "",
  style,
  glowColor = "var(--vintage-gold)",
  intensity = 8,
}: TiltCardProps) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isHoverDevice = useRef(false)
  const [hovered, setHovered] = useState(false)
  const [mouseX, setMouseX] = useState(50)
  const [mouseY, setMouseY] = useState(50)

  const springX = useSpring(0, { stiffness: 150, damping: 20 })
  const springY = useSpring(0, { stiffness: 150, damping: 20 })

  useEffect(() => {
    isHoverDevice.current = window.matchMedia("(hover: hover)").matches
  }, [])

  // No-op on reduced motion
  if (reducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return

    // Skip tilt on touch-primary devices
    if (!isHoverDevice.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -intensity
    const rotateY = ((x - centerX) / centerX) * intensity

    springX.set(rotateX)
    springY.set(rotateY)

    setMouseX((x / rect.width) * 100)
    setMouseY((y / rect.height) * 100)
  }

  function handleMouseEnter() {
    setHovered(true)
  }

  function handleMouseLeave() {
    springX.set(0)
    springY.set(0)
    setHovered(false)
    setMouseX(50)
    setMouseY(50)
  }

  return (
    <m.div
      ref={ref}
      className={className}
      style={{
        ...style,
        overflow: "hidden",
        rotateX: springX,
        rotateY: springY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
        boxShadow: hovered
          ? `0 0 24px 2px ${glowColor}40, 0 0 48px 8px ${glowColor}20, inset 0 0 0 1px ${glowColor}60`
          : "none",
      }}
      transition={{ duration: 0.3 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Inner shine overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: "inherit",
          background: `radial-gradient(circle at ${mouseX}% ${mouseY}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
          zIndex: 1,
        }}
      />
      {/* Children sit above the shine */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </m.div>
  )
}
