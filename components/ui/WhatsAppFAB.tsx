"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { m, AnimatePresence, useReducedMotion } from "framer-motion"
import { trackWhatsAppClick } from "@/lib/analytics"
import { useWhatsAppLink } from "@/components/providers/WhatsAppProvider"

const WA_MESSAGE = "Hola, me gustaría agendar una consulta de valoración gratuita."
/** Aparece pasado el hero: sobre la primera pantalla estorbaría el mensaje principal. */
const SHOW_AFTER_PX = 300
/** La etiqueta se despliega sola una vez, lo justo para que se lea qué es. */
const LABEL_AUTO_OPEN_MS = 900
const LABEL_AUTO_CLOSE_MS = 4200

function WhatsAppGlyph({ size = 26 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/**
 * Botón flotante de WhatsApp.
 *
 * Verde de WhatsApp para que se reconozca al instante, pero montado sobre la
 * paleta de la casa: cápsula en burdeos profundo, filo dorado y tipografía
 * mono en versalitas. Un halo dorado late despacio para atraer la mirada sin
 * parpadear, y la etiqueta se abre sola una vez para decir qué hay detrás.
 */
export function WhatsAppFAB() {
  const [visible, setVisible] = useState(false)
  const [labelOpen, setLabelOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const prefersReduced = useReducedMotion()
  // El panel es una herramienta interna: nadie se escribe a sí mismo por
  // WhatsApp, y el botón se colaba por encima del overlay de carga.
  const isDashboard = usePathname()?.startsWith("/dashboard") ?? false
  const href = useWhatsAppLink(WA_MESSAGE)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Presentación única: se abre, se lee y se recoge. No vuelve a insistir.
  useEffect(() => {
    if (!visible) return
    const open = window.setTimeout(() => setLabelOpen(true), LABEL_AUTO_OPEN_MS)
    const close = window.setTimeout(() => setLabelOpen(false), LABEL_AUTO_CLOSE_MS)
    return () => {
      window.clearTimeout(open)
      window.clearTimeout(close)
    }
  }, [visible])

  const expanded = labelOpen || hovered

  return (
    <AnimatePresence>
      {visible && !isDashboard && (
        <m.a
          key="wa-fab"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribir por WhatsApp a la Dra. Yasmin Medrano"
          onClick={() => trackWhatsAppClick("floating-button")}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          whileTap={{ scale: 0.96 }}
          className="wa-fab"
          data-expanded={expanded ? "true" : "false"}
        >
          {!prefersReduced && <span className="wa-fab__halo" aria-hidden="true" />}

          <span className="wa-fab__disc" aria-hidden="true">
            <WhatsAppGlyph />
          </span>

          <span className="wa-fab__label" aria-hidden="true">
            <span className="wa-fab__label-title">Escríbenos</span>
            <span className="wa-fab__label-sub">Consulta gratuita</span>
          </span>
        </m.a>
      )}
    </AnimatePresence>
  )
}
