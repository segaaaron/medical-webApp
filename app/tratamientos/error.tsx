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
        style={{ color: "var(--vintage-gold)", fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
      >
        Tratamientos
      </p>
      <h1
        className="text-3xl md:text-4xl font-light mb-4"
        style={{ color: "var(--primary-darkest)", fontFamily: "var(--font-display, Georgia, serif)" }}
      >
        No se pudo cargar
      </h1>
      <p className="text-base mb-8 max-w-md" style={{ color: "var(--gray-mid)" }}>
        Hubo un problema al obtener los tratamientos. Intenta de nuevo o vuelve al inicio.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={reset}
          className="px-8 py-3 rounded-full text-sm font-bold text-white transition-all hover:brightness-110"
          style={{ backgroundColor: "var(--primary-darkest)" }}
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="px-8 py-3 rounded-full text-sm font-bold transition-all hover:brightness-90"
          style={{ backgroundColor: "transparent", color: "var(--primary-darkest)", border: "1px solid var(--primary-darkest)" }}
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
