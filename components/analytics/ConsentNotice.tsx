"use client"

import Link from "next/link"
import { useTrackingConsent } from "./useTrackingConsent"

const GOLD = "var(--vintage-gold)"

/**
 * Aviso de consentimiento para los píxeles publicitarios.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * DECISIONES DE DISEÑO, Y POR QUÉ
 *
 * 1. NO BLOQUEA. Sin capa oscura por encima ni modal: la paciente puede leer
 *    la ficha entera e irse a WhatsApp sin tocar esto. Un muro de cookies
 *    delante de una página médica cuesta reservas, y el objetivo del sitio es
 *    que la gente agende.
 *
 * 2. ABAJO Y ESTRECHO. En móvil ocupa una franja; no tapa el botón flotante de
 *    WhatsApp, que va en la esquina opuesta.
 *
 * 3. ALTURA MÍNIMA DE 44px en los dos botones (`min-h-[44px]`), no derivada
 *    del padding: con `py-2.5` quedaban en ~36px, por debajo del mínimo
 *    recomendado para tocar con el dedo.
 *
 * 4. DOS BOTONES CON EL MISMO PESO VISUAL. «Aceptar» no es más grande ni más
 *    llamativo que «Rechazar». Un aviso donde rechazar está escondido no es un
 *    consentimiento, es un trámite.
 *
 * 5. NADA SE CARGA MIENTRAS DECIDE. Los tres píxeles esperan a «Aceptar»
 *    (`AnalyticsScripts`). Umami, que es propio y sin cookies, sigue midiendo
 *    siempre: el consultorio nunca se queda sin datos de tráfico.
 *
 * 6. SIN FRAMER-MOTION, A PROPÓSITO. La primera versión usaba `m.div`, y este
 *    componente va montado FUERA de `<LazyMotion>` (está junto a
 *    `AnalyticsScripts`, al final del body). Sin las features cargadas, un
 *    `m.*` no llega a pintarse: el aviso existía en el HTML pero era invisible
 *    — exactamente la trampa que el propio `app/layout.tsx` ya documenta para
 *    `WhatsAppFAB`. La animación es un deslizamiento; el CSS lo hace igual,
 *    sin depender de que haya cargado una librería.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * SI SE QUIERE QUITAR
 *
 * Borrar este componente de `app/layout.tsx` y cambiar la condición de
 * `AnalyticsScripts` para que no dependa del consentimiento. Está escrito para
 * ser reversible en dos ediciones, porque es una decisión de negocio y puede
 * cambiar.
 */
export function ConsentNotice() {
  const { debePreguntar, aceptar, rechazar } = useTrackingConsent()

  if (!debePreguntar) return null

  return (
    <div
          role="region"
          aria-label="Aviso sobre medición y publicidad"
          className="consent-notice fixed inset-x-0 bottom-0 z-[55] px-4 pb-4"
        >
          <div
            className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
            style={{
              backgroundColor: "var(--primary-darkest)",
              border: "1px solid rgba(184,151,59,0.35)",
              boxShadow: "0 10px 40px rgba(15,3,9,0.45)",
            }}
          >
            <p
              className="text-xs leading-relaxed sm:flex-1"
              style={{ color: "rgba(255,255,255,0.82)" }}
            >
              Usamos cookies de Meta, TikTok y Google solo para medir si nuestros
              anuncios funcionan. Puedes rechazarlas y el sitio funciona igual.{" "}
              <Link
                href="/privacidad"
                className="underline hover:opacity-80"
                style={{ color: GOLD }}
              >
                Más detalles
              </Link>
              .
            </p>

            <div className="flex shrink-0 gap-2">
              {/* Mismo tamaño y misma jerarquía visual que «Aceptar». */}
              <button
                type="button"
                onClick={rechazar}
                className="flex min-h-[44px] flex-1 items-center justify-center rounded-full px-5 text-xs font-bold uppercase tracking-wide transition-colors sm:flex-none"
                style={{
                  color: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  backgroundColor: "transparent",
                }}
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={aceptar}
                className="flex min-h-[44px] flex-1 items-center justify-center rounded-full px-5 text-xs font-bold uppercase tracking-wide transition-all hover:brightness-110 sm:flex-none"
                style={{ backgroundColor: GOLD, color: "var(--primary-darkest)" }}
              >
                Aceptar
              </button>
            </div>
      </div>
    </div>
  )
}
