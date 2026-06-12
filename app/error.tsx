"use client"

import { useEffect } from "react"

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F8F0E3" }}
    >
      <p
        className="text-xs uppercase tracking-[0.3em] font-semibold mb-3"
        style={{ color: "var(--vintage-gold)", fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
      >
        Algo salió mal
      </p>
      <h1
        className="text-3xl md:text-4xl font-light mb-4"
        style={{ color: "var(--primary-darkest)", fontFamily: "var(--font-display, Georgia, serif)" }}
      >
        Error inesperado
      </h1>
      <p className="text-base mb-8 max-w-md" style={{ color: "var(--gray-mid)" }}>
        Ocurrió un problema al cargar esta página. Por favor intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="px-8 py-3 rounded-full text-sm font-bold text-white transition-all hover:brightness-110"
        style={{ backgroundColor: "var(--primary-darkest)" }}
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
