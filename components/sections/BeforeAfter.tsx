"use client"

import { useCallback, useEffect, useState } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

interface BeforeAfterProps {
  before: string | null
  after: string | null
  name: string
}

/**
 * Cards "Antes y Después" del detalle de tratamiento.
 * - Cards: object-fit:fill (la foto cubre toda la caja, como pidió el cliente).
 * - Tap/click → lightbox con la imagen REAL (object-contain, sin recorte ni deformación).
 *
 * ────────────────────────────────────────────────────────────────────────────
 * SIN FOTO NO SE PINTA NADA
 *
 * Antes se pintaba un recuadro con un icono y el texto «Foto próximamente».
 * Salía en 10 de las 19 fichas del sitio, incluida la que mejor posicionaba.
 *
 * En medicina estética el antes y después ES la demostración: es lo que la
 * paciente viene a ver antes de escribir por WhatsApp. Un hueco que promete la
 * prueba para más adelante es peor que no tener la sección — señala que falta
 * algo justo en el momento de decidir, y lo hace dos veces por página.
 *
 * Devuelve `null` sin ninguna foto, para que la ficha no muestre ni el
 * encabezado «Antes y Después» sobre un vacío.
 */
export function BeforeAfter({ before, after, name }: BeforeAfterProps) {
  // Solo los lados con foto real. Un «antes» sin «después» sigue valiendo:
  // es media prueba, no una promesa vacía.
  const items = [
    { label: "Antes", src: before, gold: false },
    { label: "Después", src: after, gold: true },
  ].filter((it) => Boolean(it.src))
  const filled = items.map((it) => it.src).filter(Boolean) as string[]
  const [lb, setLb] = useState<number | null>(null)

  const close = useCallback(() => setLb(null), [])
  const prev = useCallback(() => setLb((i) => (i === null ? i : (i - 1 + filled.length) % filled.length)), [filled.length])
  const next = useCallback(() => setLb((i) => (i === null ? i : (i + 1) % filled.length)), [filled.length])

  useEffect(() => {
    if (lb === null) return
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
  }, [lb, close, prev, next])

  // Después de los hooks, nunca antes: salir temprano por encima de ellos
  // cambiaría el número de hooks entre renders.
  if (filled.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
        {items.map((side) => (
          <figure
            key={side.label}
            className="rounded-2xl overflow-hidden transition-all duration-500"
            style={{
              backgroundColor: "#FDF8F2",
              border: side.gold ? "1px solid rgba(184,151,59,0.5)" : "1px solid rgba(184,151,59,0.2)",
              boxShadow: side.gold ? "0 14px 40px rgba(58,15,32,0.16)" : "0 8px 28px rgba(58,15,32,0.1)",
            }}
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              {side.src && (
                <button
                  type="button"
                  onClick={() => setLb(filled.indexOf(side.src!))}
                  aria-label={`Ampliar foto ${side.label} — ${name}`}
                  className="group absolute inset-0 w-full h-full cursor-pointer"
                >
                  {/* object-fill: cubre toda la caja */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={side.src}
                    alt={`${side.label} — ${name}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-fill"
                  />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(to top, rgba(58,15,32,0.4), transparent 60%)" }} aria-hidden="true">
                    <span className="flex items-center justify-center w-11 h-11 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "var(--primary-darkest)", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                      <ZoomIn size={18} />
                    </span>
                  </span>
                </button>
              )}
            </div>
          </figure>
        ))}
      </div>

      {/* Lightbox — imagen real (object-contain, sin retoques) */}
      {lb !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-hidden"
          style={{ backgroundColor: "rgba(15,3,9,0.95)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada"
        >
          <button onClick={close} aria-label="Cerrar" className="absolute top-5 right-5 z-20 flex items-center justify-center w-11 h-11 rounded-full text-white" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
            <X size={20} />
          </button>

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

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={filled[lb]}
            alt={`${name} — vista ampliada`}
            className="max-h-[88vh] max-w-[92vw] object-contain rounded-xl shadow-2xl"
            style={{ border: "1px solid rgba(184,151,59,0.3)" }}
          />
        </div>
      )}
    </>
  )
}
