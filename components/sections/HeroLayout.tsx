"use client"

import { m, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { useSyncExternalStore } from "react"
import { LinkButton } from "@/components/ui/Button"
import { StatCard } from "@/components/ui/StatCard"
import { trackHeroCTA } from "@/lib/analytics"
import type { HeroStat, HeroCTA } from "@/types"

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]
const VINTAGE_GOLD = "var(--vintage-gold)"

/**
 * Altura extra del vídeo, en porcentaje, para que el parallax tenga recorrido.
 * El transform lo desplaza un 30%, así que necesita un 30% de más alto.
 *
 * SOLO se aplica cuando el parallax está activo. Antes era incondicional, y en
 * móvil —donde el parallax no corre— dejaba el vídeo un 30% más alto sin
 * desplazarse nunca: un tercio quedaba fuera de pantalla y `object-cover`
 * ampliaba el resto para rellenar. Ese era el "se ve todo grande".
 */
const PARALLAX_OVERSCAN = "130%"

// ─── Media queries vía store externo ─────────────────────────────────────────
// useSyncExternalStore en vez de setState dentro de un efecto: evita el
// renderizado doble y es seguro en SSR (el snapshot del servidor es false).
function makeMediaStore(query: string) {
  // La MediaQueryList se crea una vez y se reutiliza. React llama a getSnapshot
  // en cada render, y `matchMedia()` construye un objeto nuevo cada llamada:
  // hacerlo ahí era fabricar basura en el camino caliente.
  let mql: MediaQueryList | null = null
  const get = () => (mql ??= window.matchMedia(query))

  return {
    subscribe(callback: () => void) {
      const m = get()
      m.addEventListener("change", callback)
      return () => m.removeEventListener("change", callback)
    },
    getSnapshot: () => get().matches,
    getServerSnapshot: () => false,
  }
}

const desktopStore = makeMediaStore("(min-width: 1024px)")
/**
 * Punto de corte del recurso de vídeo: pantalla más alta que ancha.
 *
 * Por proporción y no por ancho a propósito. Con un corte en 767px, un iPad en
 * vertical (820x1180) recibía el vídeo apaisado y volvía el recorte que este
 * cambio vino a eliminar. Lo que decide qué recurso encaja es la forma de la
 * pantalla, no cuántos píxeles mide de lado.
 */
const portraitStore = makeMediaStore("(max-aspect-ratio: 1/1)")

/**
 * "¿Estamos en el cliente?" sin efectos ni setState: el servidor devuelve false
 * y el cliente true. Mismo patrón que las media queries de arriba, que es como
 * este proyecto resuelve las diferencias servidor/cliente.
 */
const clientStore = {
  subscribe: () => () => {},
  getSnapshot: () => true,
  getServerSnapshot: () => false,
}

export interface HeroLayoutProps {
  tagline: string         // top eyebrow text
  doctorName: string      // animated word-by-word
  specialty: string       // subtitle below name
  description: string     // body text paragraph
  ctas: HeroCTA[]
  stats: HeroStat[]
}

export function HeroLayout({ tagline, doctorName, specialty, description, ctas, stats }: HeroLayoutProps) {
  const prefersReduced = useReducedMotion()
  const charCount = doctorName.length
  const center = (charCount - 1) / 2
  // Last char animates at: delay 0.15 + (charCount-1)*0.028 + duration 0.55
  const titleDuration = prefersReduced ? 0 : 0.15 + (charCount - 1) * 0.028 + 0.55
  const specialtyWords = specialty.split(" ")
  // Subtitle ends at: titleDuration + (words-1)*0.07 + duration 0.6
  const subtitleDuration = prefersReduced ? 0 : titleDuration + (specialtyWords.length - 1) * 0.07 + 0.6

  const { scrollY } = useScroll()
  const videoY = useTransform(scrollY, [0, 600], ["0%", "30%"])

  const isDesktop = useSyncExternalStore(
    desktopStore.subscribe,
    desktopStore.getSnapshot,
    desktopStore.getServerSnapshot,
  )
  const isPortrait = useSyncExternalStore(
    portraitStore.subscribe,
    portraitStore.getSnapshot,
    portraitStore.getServerSnapshot,
  )

  const parallaxOn = !prefersReduced && isDesktop

  /**
   * Las fuentes se añaden tras montar, no en el HTML del servidor.
   *
   * Es la única forma de bajar UN solo archivo. Con los dos <video> en el HTML,
   * `autoplay` fuerza la descarga de ambos aunque uno esté en display:none:
   * medido, 674 KB + 318 KB en un móvil. Y el servidor no puede saber el ancho
   * de la pantalla, así que la elección tiene que ocurrir en el cliente.
   *
   * Mientras tanto se ve el póster, que el CSS ya sirve en la versión correcta.
   * Si el JavaScript no llega, el hero se queda con esa imagen: sigue siendo un
   * hero válido, no un hueco.
   */
  const mounted = useSyncExternalStore(
    clientStore.subscribe,
    clientStore.getSnapshot,
    clientStore.getServerSnapshot,
  )

  const videoSrc = isPortrait ? "/videos/hero-mobile" : "/videos/hero"

  return (
    <section
      className="hero__section gradient-hero relative flex flex-col items-center justify-center overflow-hidden"
      // El `paddingTop` reserva el alto de la barra de navegación, que flota
      // encima. Sin un `paddingBottom` igual, `justify-center` centraba dentro
      // de una caja descuadrada y dejaba 70px más de aire arriba que abajo: el
      // contenido parecía caído. Con los dos iguales, el centrado es real.
      style={{ minHeight: "100svh", marginTop: "-70px", paddingTop: "70px", paddingBottom: "70px" }}
    >
      {/* Fondo. El póster va como background del contenedor —CSS ya elige la
          versión apaisada o la vertical— y cubre mientras el vídeo carga. */}
      <m.div
        className="hero__media absolute inset-0 z-0 overflow-hidden"
        style={{
          y: parallaxOn ? videoY : 0,
          willChange: parallaxOn ? "transform" : "auto",
          // Solo se estira cuando el parallax va a moverlo. Si no, 100%.
          height: parallaxOn ? PARALLAX_OVERSCAN : "100%",
        }}
        aria-hidden="true"
      >
        {mounted && (
          /* Sin atributo `poster`: el contenedor ya pinta el póster correcto
             como fondo, y duplicarlo aquí descargaba las dos versiones —medido,
             38 KB de más— porque el atributo se resuelve antes de que la
             consulta de proporción se asiente. */
          <video
            key={videoSrc}
            className="hero__video"
            autoPlay muted loop playsInline preload="none"
            aria-hidden="true"
          >
            <source src={`${videoSrc}.webm`} type="video/webm" />
            <source src={`${videoSrc}.mp4`} type="video/mp4" />
          </video>
        )}
      </m.div>

      {/* Light leaks */}
      <div className="hero__leak1 z-[1]" aria-hidden="true" />
      <div className="hero__leak2 z-[1]" aria-hidden="true" />

      {/* Overlay 1 — dark fade */}
      <div className="absolute inset-0 z-[2]" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.2) 100%)" }} />
      {/* Overlay 2 — vignette */}
      <div className="absolute inset-0 z-[3]" style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 25%, rgba(0,0,0,0.72) 100%)" }} />

      {/* Content
          Padding simétrico: el indicador de scroll ya no ocupa espacio en móvil
          —está oculto— y el `pb` grande desplazaba el centrado hacia arriba. */}
      <div className="hero__content relative z-[10] text-center text-white px-5 sm:px-6 max-w-5xl mx-auto py-10 sm:py-20">
        {/* Eyebrow tagline */}
        <m.p
          initial={prefersReduced ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          className="text-xs sm:text-sm md:text-base uppercase tracking-[0.22em] sm:tracking-[0.3em] mb-5 sm:mb-4 font-medium"
          style={{ color: "var(--meteorite)" }}
        >
          {tagline}
        </m.p>

        {/* Doctor name — letter assembly from sides */}
        <h1
          className="font-bold text-[2.4rem] sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-4 leading-[1.12]"
          aria-label={doctorName}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", fontFamily: "var(--font-display)", fontWeight: 300, letterSpacing: "-0.02em", gap: "0 0.3em" }}
        >
          {doctorName.split(" ").map((word, wordIdx, words) => {
            const charOffset = words.slice(0, wordIdx).reduce((acc, w) => acc + w.length + 1, 0)
            return (
              <span key={wordIdx} aria-hidden="true" style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
                {word.split("").map((char, charIdx) => {
                  const i = charOffset + charIdx
                  const dist = i - center
                  // `initial` NO puede depender de estado que cambie tras
                  // hidratar. Si lo hace, Framer Motion recibe un valor inicial
                  // distinto en el re-render posterior a la hidratación,
                  // reinicia la animación y las letras se quedan congeladas en
                  // opacity 0. Este cálculo es constante a propósito.
                  const xStart = dist < 0
                    ? Math.max(-600, dist * 48)
                    : Math.min(600, dist * 48)
                  return (
                    <m.span
                      key={charIdx}
                      style={{ display: "inline-block" }}
                      initial={prefersReduced ? false : { x: xStart, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        duration: 0.55,
                        delay: 0.15 + i * 0.028,
                        ease: EASE_OUT_EXPO,
                      }}
                    >
                      {char}
                    </m.span>
                  )
                })}
              </span>
            )
          })}
        </h1>

        {/* Specialty subtitle — word-by-word slide up, after title */}
        <p
          className="italic font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 sm:mb-6 leading-snug"
          style={{ color: "#fce4ec", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.25em" }}
          aria-label={specialty}
        >
          {specialty.split(" ").map((word, i) => (
            <span key={i} style={{ overflow: "hidden", display: "inline-block" }}>
              <m.span
                aria-hidden="true"
                style={{ display: "inline-block" }}
                initial={prefersReduced ? false : { y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: titleDuration + i * 0.07, ease: EASE_OUT_EXPO }}
              >
                {word}
              </m.span>
            </span>
          ))}
        </p>

        {/* Gold divider */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: subtitleDuration + 0.05, ease: EASE_OUT_EXPO }}
          className="w-20 sm:w-24 h-0.5 mx-auto mb-7 sm:mb-8 origin-center"
          style={{ backgroundColor: VINTAGE_GOLD }}
        />

        {/* Description */}
        <m.p
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: subtitleDuration + 0.2 }}
          className="hero__description text-base sm:text-lg md:text-2xl mb-9 sm:mb-10 max-w-3xl mx-auto font-light leading-relaxed"
          style={{ color: "#fce4ec" }}
        >
          {description}
        </m.p>

        {/* CTAs — a ancho completo en móvil (objetivo táctil holgado),
            en fila desde sm. */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: subtitleDuration + 0.45 }}
          className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-stretch sm:items-center w-full max-w-sm sm:max-w-none mx-auto"
        >
          {ctas.map((cta, idx) => (
            <LinkButton
              key={cta.label}
              href={cta.href}
              variant={idx === 0 ? "primary" : "warning"}
              className="px-8 sm:px-10 py-4 justify-center"
              onClick={() => trackHeroCTA({ label: cta.label, href: cta.href })}
            >
              {cta.label}
            </LinkButton>
          ))}
        </m.div>

        {/* Stats — en fila de 3 desde el móvil.
            Apiladas con gap-8 y mt-16 añadían ~250px de alto y eran la causa
            principal de que el contenido rebasara la pantalla. */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: subtitleDuration + 0.75 }}
          className="mt-11 sm:mt-12 md:mt-16 grid grid-cols-3 gap-3 sm:flex sm:flex-row sm:gap-8 justify-center items-start sm:items-center"
        >
          {stats.map((stat, i) => (
            <m.div
              key={stat.label}
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: subtitleDuration + 0.75 + i * 0.1, ease: EASE_OUT_EXPO }}
            >
              <StatCard value={stat.value} label={stat.label} light />
            </m.div>
          ))}
        </m.div>
      </div>

      {/* Scroll indicator — oculto en móvil: el contenido ya llega al borde
          inferior y ahí solo servía para taparlo. */}
      <m.div
        className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-[10] flex-col items-center gap-2"
        animate={prefersReduced ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: 4, repeatType: "reverse" }}
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>Descubre más</span>
        <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)" }} />
      </m.div>
    </section>
  )
}
