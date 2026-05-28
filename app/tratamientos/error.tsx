"use client"

import { useEffect } from "react"
import Link from "next/link"

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function TratamientosError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[TratamientosError]", error)
  }, [error])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F8F0E3" }}
    >
      <p
        className="text-xs uppercase tracking-[0.3em] font-semibold mb-3"
        style={{ color: "#B8973B", fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
      >
        Tratamientos
      </p>
      <h1
        className="text-3xl md:text-4xl font-light mb-4"
        style={{ color: "#3a0f20", fontFamily: "var(--font-display, Georgia, serif)" }}
      >
        No se pudo cargar
      </h1>
      <p className="text-base mb-8 max-w-md" style={{ color: "#7a6570" }}>
        Hubo un problema al obtener los tratamientos. Intenta de nuevo o vuelve al inicio.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={reset}
          className="px-8 py-3 rounded-full text-sm font-bold text-white transition-all hover:brightness-110"
          style={{ backgroundColor: "#3a0f20" }}
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="px-8 py-3 rounded-full text-sm font-bold transition-all hover:brightness-90"
          style={{ backgroundColor: "transparent", color: "#3a0f20", border: "1px solid #3a0f20" }}
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
