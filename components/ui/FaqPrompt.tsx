"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight } from "lucide-react"

interface FaqPromptProps {
  size?: "sm" | "md"
  className?: string
}

/** Invita al usuario a resolver dudas en las Preguntas Frecuentes del home. Pensado para fondos oscuros. */
export function FaqPrompt({ size = "md", className = "" }: FaqPromptProps) {
  const pathname = usePathname()
  const linkSize = size === "md" ? "text-xl py-2" : "text-sm py-3"
  const iconSize = size === "md" ? 16 : 14

  // En el home el hash ya puede estar en la URL: Next no re-dispara el scroll y
  // el href se concatena (#faq#faq). Hacemos el scroll a mano.
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return
    const target = document.getElementById("faq")
    if (!target) return
    e.preventDefault()
    target.scrollIntoView({ block: "start" })
    window.history.replaceState(null, "", "/#faq")
  }

  return (
    <div className={`text-center ${className}`}>
      <p className="text-xs mb-1" style={{ color: "var(--meteorite)" }}>
        ¿Tienes dudas antes de agendar?
      </p>
      <Link
        href="/#faq"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 ${linkSize} font-bold font-heading transition-opacity hover:opacity-80`}
        style={{ color: "var(--vintage-gold)" }}
      >
        Lee las Preguntas Frecuentes
        <ArrowRight size={iconSize} aria-hidden="true" />
      </Link>
      <span className="block mx-auto mt-2 w-16 h-px" style={{ backgroundColor: "rgba(184,151,59,0.4)" }} />
    </div>
  )
}
