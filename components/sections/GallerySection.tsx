"use client"

import { useCallback, useEffect, useState } from "react"
import { m, useReducedMotion } from "framer-motion"
import { ImageIcon, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"

interface GallerySectionProps {
  /** URLs de las fotos (hasta 10). Las posiciones vacías muestran un placeholder elegante. */
  images: string[]
}

const SLOTS = 10
// Rotaciones marcadas → pila de fotos polaroid superpuestas (estilo collage).
const TILTS = [-8, 6, -4, 9, -7, 5, -10, 7, -5, 8]
const Z = [3, 7, 2, 9, 5, 8, 1, 6, 4, 10]

export function GallerySection({ images }: GallerySectionProps) {
  const slots = Array.from({ length: SLOTS }, (_, i) => images[i] ?? "")
  const filled = slots.filter(Boolean)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const reduce = useReducedMotion()

  const close = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() => setLightbox((i) => (i === null ? i : (i - 1 + filled.length) % filled.length)), [filled.length])
  const next = useCallback(() => setLightbox((i) => (i === null ? i : (i + 1) % filled.length)), [filled.length])

  useEffect(() => {
    if (lightbox === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
      else if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [lightbox, close, prev, next])

  return (
    <section
      className="relative py-20 px-6 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 12% 18%, rgba(184,151,59,0.12), transparent 42%), radial-gradient(circle at 88% 82%, rgba(143,52,82,0.10), transparent 46%), linear-gradient(135deg, #FAF6EE 0%, #F2E9D8 50%, #EAD9C2 100%)",
      }}
      aria-label="Galería"
    >
      {/* Textura punteada sutil + viñeta para look vintage */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(rgba(122,72,40,0.10) 1px, transparent 1px)", backgroundSize: "22px 22px", opacity: 0.5 }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 140px rgba(58,15,32,0.10)" }}
        aria-hidden="true"
      />
      <div className="relative z-10 container-xl">
        <div className="text-center mb-12">
          <p className="text-xs uppercase mb-3" style={{ color: "var(--vintage-gold)", fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.22em" }}>
            Congresos
          </p>
          <h2 className="text-3xl md:text-4xl font-light" style={{ fontFamily: "var(--font-heading, Georgia, serif)", color: "var(--primary-darkest)", letterSpacing: "-0.02em" }}>
            Galería
          </h2>
          <div className="mt-5 mx-auto w-16 h-px" style={{ backgroundColor: "var(--vintage-gold)" }} />
        </div>

        {/* Pila de fotos polaroid — 2 filas de 5, superpuestas */}
        <div className="flex flex-col items-center gap-1">
          {[0, 1].map((row) => (
            <div key={row} className="flex flex-nowrap items-center justify-center">
              {slots.slice(row * 5, row * 5 + 5).map((src, j) => {
                const i = row * 5 + j
                return (
                  <m.div
                    key={i}
                    className="relative -mx-2 transition-[z-index] duration-0 hover:z-50"
                    style={{ zIndex: Z[i] }}
                    initial={reduce ? false : { opacity: 0, x: `${(2 - (i % 5)) * 108}%` }}
                    whileInView={{ opacity: 1, x: "0%" }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      type: "spring",
                      stiffness: 42,
                      damping: 16,
                      mass: 1.15,
                      // Orden serpiente: fila 1 izq→der, fila 2 der→izq
                      delay: (i < 5 ? i : 5 + (4 - (i % 5))) * 0.28,
                    }}
                  >
                    {src ? (
                      <button
                        type="button"
                        onClick={() => setLightbox(filled.indexOf(src))}
                        aria-label={`Ampliar foto ${i + 1}`}
                        className="group block bg-white p-1.5 pb-4 md:p-2 md:pb-6 shadow-xl transition-transform duration-500 ease-out hover:rotate-0 hover:scale-[1.08] hover:shadow-2xl cursor-pointer"
                        style={{ transform: `rotate(${TILTS[i]}deg)`, borderRadius: "3px" }}
                      >
                        <div className="relative overflow-hidden" style={{ width: "clamp(52px, 16.5vw, 160px)", aspectRatio: "3/4" }}>
                          <ImageWithFallback
                            src={src}
                            alt={`Galería — foto ${i + 1}`}
                            fill
                            variant="light"
                            loading="lazy"
                            sizes="160px"
                            imgClassName="transition-[filter] duration-500 [filter:sepia(0.42)_saturate(0.78)_contrast(0.9)_brightness(1.05)] group-hover:[filter:sepia(0.1)_saturate(1)_contrast(1)_brightness(1)]"
                          />
                          {/* Tinte cálido vintage */}
                          <span
                            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-60 group-hover:opacity-0 transition-opacity duration-500"
                            style={{ background: "linear-gradient(160deg, rgba(255,225,170,0.35), rgba(120,70,40,0.28))" }}
                            aria-hidden="true"
                          />
                          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                            <span className="flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.92)", color: "var(--primary-darkest)", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                              <ZoomIn size={15} />
                            </span>
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="bg-white p-1.5 pb-4 md:p-2 md:pb-6 shadow-lg" style={{ transform: `rotate(${TILTS[i]}deg)`, borderRadius: "3px" }}>
                        <div
                          className="flex flex-col items-center justify-center gap-1.5 aspect-[3/4]"
                          style={{ width: "clamp(52px, 16.5vw, 160px)", background: "linear-gradient(155deg, var(--vintage-parchment, #FAF6EE) 0%, var(--vintage-cream-dark, #EDE5D5) 100%)" }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: "rgba(184,151,59,0.1)", border: "1px solid rgba(184,151,59,0.3)" }}>
                            <ImageIcon size={14} aria-hidden="true" style={{ color: "var(--vintage-gold)" }} />
                          </div>
                          <span className="text-[7px] uppercase text-center px-1" style={{ color: "rgba(58,15,32,0.4)", fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.1em" }}>
                            Próximamente
                          </span>
                        </div>
                      </div>
                    )}
                  </m.div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox — coverflow 3D */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "rgba(15,3,9,0.95)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada"
        >
          <button onClick={close} aria-label="Cerrar" className="absolute top-5 right-5 z-20 flex items-center justify-center w-11 h-11 rounded-full text-white" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
            <X size={20} />
          </button>

          {/* Escenario coverflow */}
          <div className="relative w-full h-[72vh] flex items-center justify-center" style={{ perspective: "1600px" }} onClick={(e) => { if (e.target === e.currentTarget) close() }}>
            {filled.map((src, i) => {
              const offset = i - lightbox
              const abs = Math.abs(offset)
              if (abs > 2) return null
              const isCenter = offset === 0
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(i)}
                  aria-label={isCenter ? `Foto ${i + 1}` : "Ver esta foto"}
                  className="absolute top-1/2 left-1/2 transition-all duration-500 ease-out"
                  style={{
                    transform: `translate(-50%, -50%) translateX(${offset * 32}%) rotateY(${offset * -20}deg) scale(${abs === 0 ? 1 : abs === 1 ? 0.86 : 0.74})`,
                    opacity: abs === 0 ? 1 : abs === 1 ? 0.95 : 0.8,
                    zIndex: 10 - abs,
                    cursor: isCenter ? "default" : "pointer",
                    filter: isCenter ? "none" : "brightness(0.88)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Foto ${i + 1} de ${filled.length}`}
                    className="max-h-[72vh] w-auto max-w-[78vw] object-contain rounded-2xl shadow-2xl"
                    style={{ border: "1px solid rgba(184,151,59,0.35)" }}
                  />
                </button>
              )
            })}
          </div>

          {filled.length > 1 && (
            <>
              <button onClick={prev} aria-label="Anterior" className="absolute left-4 md:left-8 z-20 flex items-center justify-center w-12 h-12 rounded-full text-white" style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={next} aria-label="Siguiente" className="absolute right-4 md:right-8 z-20 flex items-center justify-center w-12 h-12 rounded-full text-white" style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-xs px-3 py-1 rounded-full" style={{ color: "var(--vintage-gold-light, #D4B483)", backgroundColor: "rgba(0,0,0,0.4)", fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.1em" }}>
            {lightbox + 1} / {filled.length}
          </span>
        </div>
      )}
    </section>
  )
}
