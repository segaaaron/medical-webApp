"use client"

import { useState, useEffect } from "react"
import { m } from "framer-motion"
import Image from "next/image"

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  loading?: "eager" | "lazy"
  decoding?: "async" | "sync" | "auto"
  /** "light" = cream card on light bg  |  "dark" = gold-on-dark for poster cards */
  variant?: "light" | "dark"
  objectPosition?: string
  /** Use next/image with fill (parent must be position:relative with explicit height) */
  fill?: boolean
  /** srcset sizes hint — only used when fill=true */
  sizes?: string
}

function LightFallback() {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        backgroundColor: "#F8F0E3",
        border: "1px solid rgba(184,151,59,0.18)",
      }}
      aria-hidden="true"
    >
      {/* Animated medical cross + sparkles ornament */}
      <m.svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Outer decorative ring */}
        <circle cx="28" cy="28" r="26" stroke="rgba(184,151,59,0.2)" strokeWidth="1" />
        <circle cx="28" cy="28" r="22" stroke="rgba(184,151,59,0.12)" strokeWidth="0.5" strokeDasharray="3 4" />

        {/* Medical cross */}
        <rect x="22" y="14" width="12" height="28" rx="3" fill="rgba(184,151,59,0.18)" />
        <rect x="14" y="22" width="28" height="12" rx="3" fill="rgba(184,151,59,0.18)" />
        <rect x="22" y="14" width="12" height="28" rx="3" stroke="#B8973B" strokeWidth="1" fill="none" />
        <rect x="14" y="22" width="28" height="12" rx="3" stroke="#B8973B" strokeWidth="1" fill="none" />

        {/* Corner sparkles */}
        <m.g
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <line x1="8" y1="8" x2="8" y2="13" stroke="#B8973B" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="5.5" y1="10.5" x2="10.5" y2="10.5" stroke="#B8973B" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="48" y1="43" x2="48" y2="48" stroke="#B8973B" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="45.5" y1="45.5" x2="50.5" y2="45.5" stroke="#B8973B" strokeWidth="1.2" strokeLinecap="round" />
        </m.g>
      </m.svg>

      <span
        style={{
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          fontSize: "11px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(184,151,59,0.7)",
        }}
      >
        Imagen no disponible
      </span>
    </m.div>
  )
}

function DarkFallback() {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(155deg, oklch(26% 0.05 50) 0%, oklch(14% 0.03 44) 100%)",
      }}
      aria-hidden="true"
    >
      <m.svg
        width="52"
        height="52"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <circle cx="26" cy="26" r="24" stroke="#B8973B" strokeWidth="0.8" />
        <rect x="20" y="12" width="12" height="28" rx="3" fill="#B8973B" />
        <rect x="12" y="20" width="28" height="12" rx="3" fill="#B8973B" />
        <rect x="20" y="12" width="12" height="28" rx="3" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0" />
      </m.svg>
    </m.div>
  )
}

export function ImageWithFallback({
  src,
  alt,
  className,
  style,
  loading = "lazy",
  decoding = "async",
  variant = "light",
  objectPosition,
  fill: useFill = false,
  sizes,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(!src)

  useEffect(() => {
    setFailed(!src)
  }, [src])

  if (failed) {
    return variant === "dark" ? <DarkFallback /> : <LightFallback />
  }

  if (useFill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        className={className}
        style={{ objectFit: "cover", objectPosition, ...style }}
        priority={loading === "eager"}
        onError={() => setFailed(true)}
      />
    )
  }

  // Non-fill: wrap in relative container so next/image fill can optimize it
  return (
    <div className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        style={{ objectFit: "cover", objectPosition }}
        priority={loading === "eager"}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
