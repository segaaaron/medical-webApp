"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  /** Clases aplicadas al elemento <img> real (ej. filtros, transiciones). */
  imgClassName?: string
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
        <rect x="22" y="14" width="12" height="28" rx="3" stroke="var(--vintage-gold)" strokeWidth="1" fill="none" />
        <rect x="14" y="22" width="28" height="12" rx="3" stroke="var(--vintage-gold)" strokeWidth="1" fill="none" />

        {/* Corner sparkles */}
        <m.g
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <line x1="8" y1="8" x2="8" y2="13" stroke="var(--vintage-gold)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="5.5" y1="10.5" x2="10.5" y2="10.5" stroke="var(--vintage-gold)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="48" y1="43" x2="48" y2="48" stroke="var(--vintage-gold)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="45.5" y1="45.5" x2="50.5" y2="45.5" stroke="var(--vintage-gold)" strokeWidth="1.2" strokeLinecap="round" />
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
        <circle cx="26" cy="26" r="24" stroke="var(--vintage-gold)" strokeWidth="0.8" />
        <rect x="20" y="12" width="12" height="28" rx="3" fill="var(--vintage-gold)" />
        <rect x="12" y="20" width="28" height="12" rx="3" fill="var(--vintage-gold)" />
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
  imgClassName,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(!src)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Deriva el estado real del <img> montado. Cubre imágenes ya cacheadas por el
  // navegador, cuyo evento `load`/`error` se dispara ANTES de que React monte
  // `onLoad`/`onError`, por lo que esos handlers nunca llegan a ejecutarse.
  const syncFromElement = useCallback(() => {
    const img = imgRef.current
    if (!img || !img.complete) return false // aún cargando → mantener shimmer
    if (img.naturalWidth > 0) {
      setLoaded(true)
    } else if (img.currentSrc) {
      // Cargó pero sin dimensiones → error cacheado.
      setFailed(true)
    }
    return true
  }, [])

  // Callback ref estable: guarda el nodo y, si ya está completo al montar,
  // resuelve el estado sin esperar al evento (caso de imagen cacheada).
  const handleImgRef = useCallback(
    (img: HTMLImageElement | null) => {
      imgRef.current = img
      syncFromElement()
    },
    [syncFromElement],
  )

  useEffect(() => {
    // Reset al cambiar `src`: en vez de forzar siempre `loaded=false` (lo que
    // dejaría el shimmer en loop sobre una imagen cacheada que no dispara
    // `onLoad`), derivamos del elemento real. Si la nueva imagen ya está
    // completa la marcamos cargada; si no, volvemos a estado de carga.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetea estado al cambiar src
    setFailed(!src)
    if (!src || !syncFromElement()) {
      setLoaded(false)
    }
  }, [src, syncFromElement])

  if (failed) {
    return variant === "dark" ? <DarkFallback /> : <LightFallback />
  }

  // URLs externas absolutas (CMS) → <img> nativo (next/image rompería por host no configurado).
  // Rutas locales/proxy (`/api/uploads/...`) → next/image optimizado.
  const isRemote = /^https?:\/\//i.test(src)
  const sizesAttr = sizes ?? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

  // Shimmer interno: cubre la imagen mientras carga y se desvanece al terminar (sin blur).
  const shimmer = (
    <div
      className={`absolute inset-0 pointer-events-none ${variant === "dark" ? "img-shimmer img-shimmer--dark" : "img-shimmer"}`}
      style={{ opacity: loaded ? 0 : 1, transition: "opacity 0.45s ease" }}
      aria-hidden="true"
    />
  )

  const inner = isRemote ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={handleImgRef}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={imgClassName}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition }}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  ) : (
    <Image
      ref={handleImgRef}
      src={src}
      alt={alt}
      fill
      sizes={sizesAttr}
      className={imgClassName}
      style={{ objectFit: "cover", objectPosition }}
      priority={loading === "eager"}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  )

  return (
    <div
      className={className}
      style={useFill ? { position: "absolute", inset: 0, ...style } : { position: "relative", overflow: "hidden", ...style }}
    >
      {inner}
      {shimmer}
    </div>
  )
}
