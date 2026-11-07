"use client"

import { m, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { Fragment, useEffect, useState, useSyncExternalStore, type CSSProperties } from "react"
import { LinkButton } from "@/components/ui/Button"
import { StatCard } from "@/components/ui/StatCard"
import { trackHeroCTA } from "@/lib/analytics"
import type { HeroStat, HeroCTA } from "@/types"

/** Estilo inline con las custom properties que leen las clases `hero-in*`. */
type HeroStyle = CSSProperties & Record<`--${string}`, string>
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

/** `navigator.connection`, que TypeScript no tipa. */
interface NetworkInformation {
  saveData?: boolean
  effectiveType?: string
}

/**
 * ¿Conviene gastar 388 KB de vídeo decorativo en esta conexión?
 *
 * `Save-Data` es el usuario pidiendo explícitamente que no. `2g` y `slow-2g`
 * son redes donde el vídeo de fondo llegaría después de que la paciente ya
 * decidió irse. En Cochabamba una parte del tráfico llega por datos móviles,
 * así que esto no es un caso teórico.
 */
function mediaPesadaDesaconsejada(): boolean {
  if (typeof navigator === "undefined") return false
  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection
  if (!conn) return false
  if (conn.saveData) return true
  return conn.effectiveType === "2g" || conn.effectiveType === "slow-2g"
}

/**
 * Carga diferida del vídeo de fondo del hero.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EL PROBLEMA QUE RESUELVE
 *
 * `<video autoPlay preload="none">` NO respeta el `preload`: por especificación
 * `autoplay` implica cargar el recurso. Así que los 388 KB de
 * `hero-mobile.webm` se descargaban igual, compitiendo por ancho de banda y por
 * hilo principal con el elemento LCP (`p.hero__description`). Medido: ~1 s de
 * descarga en móvil, con el LCP ya en 8,3 s simulados.
 *
 * El vídeo es decorativo (`aria-hidden`) y el póster —que el CSS ya pinta como
 * fondo— es un hero perfectamente válido por sí mismo; el propio código lo dice
 * más abajo. Así que no hay nada que perder esperando.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ SOLO EN VERTICAL
 *
 * En escritorio el LCP ya está en 2,4 s y la conexión suele aguantar el vídeo
 * sin penalizar nada: ahí se monta igual que antes, en cuanto hidrata. El
 * diferido se aplica donde el problema está medido, no en todas partes.
 *
 * @param diferir  true en vertical/móvil; false mantiene el comportamiento anterior.
 */
function useVideoDiferido(diferir: boolean): boolean {
  // El estado SOLO registra "el idle ya llegó". El caso no diferido se resuelve
  // en el valor devuelto, no con un `setState` dentro del efecto: asignar
  // estado en el cuerpo de un efecto provoca un render extra y lo prohíbe
  // `react-hooks/set-state-in-effect`.
  const [idleListo, setListo] = useState(false)

  useEffect(() => {
    if (!diferir) return
    if (mediaPesadaDesaconsejada()) return

    // `requestIdleCallback` espera a que el hilo principal esté libre, que es
    // justo después de pintar lo que importa. Safari no lo implementa, así que
    // cae a un temporizador: 1,5 s es más que el LCP observado (2,2 s) menos el
    // margen de pintado, y el póster cubre el hueco.
    const idle = (window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    }).requestIdleCallback

    if (typeof idle === "function") {
      const id = idle(() => setListo(true), { timeout: 3000 })
      return () => {
        const cancel = (window as Window & { cancelIdleCallback?: (h: number) => void })
          .cancelIdleCallback
        if (typeof cancel === "function") cancel(id)
      }
    }
    const t = setTimeout(() => setListo(true), 1500)
    return () => clearTimeout(t)
  }, [diferir])

  // Sin diferir (escritorio) se monta igual que antes; diferido, cuando el
  // hilo principal quedó libre. En conexión lenta o con Save-Data nunca: el
  // póster se queda, y es un hero válido.
  return !diferir || idleListo
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
  const center = (doctorName.length - 1) / 2

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

  // En vertical el vídeo espera a que el hilo principal esté libre; en
  // escritorio se monta igual que antes. Ver `useVideoDiferido`.
  const videoListo = useVideoDiferido(isPortrait)

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
        {mounted && videoListo && (
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
        {/* Entrada del hero SOLO con CSS y SIN opacidad (clases `hero-in*` en
            globals.css). Antes era Framer Motion con `initial={{ opacity: 0 }}`:
            el HTML del servidor llegaba invisible y el texto no se pintaba hasta
            hidratar — el párrafo de descripción era el LCP y tardaba 11 s en
            móvil. Ahora todo se pinta en el primer frame y solo se desplaza. */}
        {tagline && <p
          className="hero-in text-xs sm:text-sm md:text-base uppercase tracking-[0.22em] sm:tracking-[0.3em] mb-5 sm:mb-4 font-medium"
          style={{ color: "var(--meteorite)", "--hero-from": "-14px" } as HeroStyle}
        >
          {tagline}
        </p>}

        {/* Doctor name — letter assembly from sides.
            ────────────────────────────────────────────────────────────────────
            EL ESPACIO ENTRE PALABRAS ES TEXTO REAL, NO SOLO `gap`.

            Cada letra va en su propio `<span>` para animarla, y la separación
            entre palabras la pintaba únicamente `gap: 0 0.3em`. Visualmente
            perfecto; en el texto del DOM, no:

              Dra.YasminLoreleyMedranoAvila

            Eso es lo que extrae cualquiera que lea el HTML sin aplicar CSS —un
            buscador, un motor de respuestas— del encabezado más importante de
            la página más enlazada del sitio. El nombre de la doctora, que es la
            entidad que todo el sitio intenta posicionar, llegaba como una sola
            palabra inexistente.

            La solución ya estaba en este archivo veinte líneas más abajo: el
            `<p>` de especialidad intercala `{i > 0 && " "}` entre palabras. Se
            usa lo mismo aquí. El `gap` se mantiene para el espaciado óptico.

            Y se quita el `aria-label`: ahora el texto del elemento ES el nombre
            con sus espacios, así que el lector de pantalla lo lee bien sin
            necesidad de una etiqueta que lo duplique. */}
        {doctorName && <h1
          className="font-bold text-[2.4rem] sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-4 leading-[1.12]"
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", fontFamily: "var(--font-display)", fontWeight: 300, letterSpacing: "-0.02em", gap: "0 0.3em" }}
        >
          {doctorName.split(" ").map((word, wordIdx, words) => {
            const charOffset = words.slice(0, wordIdx).reduce((acc, w) => acc + w.length + 1, 0)
            return (
              <Fragment key={wordIdx}>
                {wordIdx > 0 && " "}
              <span aria-hidden="true" style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
                {word.split("").map((char, charIdx) => {
                  const i = charOffset + charIdx
                  const x = Math.max(-140, Math.min(140, (i - center) * 12))
                  return (
                    <span
                      key={charIdx}
                      className="hero-in-letter"
                      style={{ "--hero-x": `${x}px`, "--hero-delay": `${0.1 + i * 0.022}s` } as HeroStyle}
                    >
                      {char}
                    </span>
                  )
                })}
              </span>
              </Fragment>
            )
          })}
        </h1>}

        {/* Specialty subtitle — word-by-word rise, after title.
            Sin aria-label: en un <p> está prohibido. Las palabras son texto real
            y el espacio entre ellas lo lee el lector (flex no lo pinta). */}
        {specialty && <p
          className="italic font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 sm:mb-6 leading-snug"
          style={{ color: "var(--meteorite-light)", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.25em" }}
        >
          {specialty.split(" ").map((word, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span
                className="hero-in-soft"
                style={{ display: "inline-block", "--hero-delay": `${0.45 + i * 0.07}s` } as HeroStyle}
              >
                {word}
              </span>
            </Fragment>
          ))}
        </p>}

        {/* Gold divider */}
        <div
          className="hero-in-line w-20 sm:w-24 h-0.5 mx-auto mb-7 sm:mb-8 origin-center"
          style={{ backgroundColor: VINTAGE_GOLD, "--hero-delay": "0.7s" } as HeroStyle}
        />

        {/* Description */}
        {description && <p
          className="hero__description text-base sm:text-lg md:text-2xl mb-9 sm:mb-10 max-w-3xl mx-auto font-light leading-relaxed"
          // Sin animación a propósito: es el LCP de la home y debe pintarse
          // estable en el primer frame, sin transform ni filtro pendientes.
          style={{ color: "var(--meteorite-light)" }}
        >
          {description}
        </p>}

        {/* CTAs — a ancho completo en móvil (objetivo táctil holgado),
            en fila desde sm. */}
        <div
          className="hero-in flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-stretch sm:items-center w-full max-w-sm sm:max-w-none mx-auto"
          style={{ "--hero-delay": "0.75s" } as HeroStyle}
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
        </div>

        {/* Stats — en fila de 3 desde el móvil.
            Apiladas con gap-8 y mt-16 añadían ~250px de alto y eran la causa
            principal de que el contenido rebasara la pantalla. */}
        <div className="mt-11 sm:mt-12 md:mt-16 grid grid-cols-3 gap-3 sm:flex sm:flex-row sm:gap-8 justify-center items-start sm:items-center">
          {stats.map((stat, i) => (
            <div
              key={`${stat.label}-${i}`}
              className="hero-in"
              style={{ "--hero-delay": `${0.85 + i * 0.1}s` } as HeroStyle}
            >
              <StatCard value={stat.value} label={stat.label} light />
            </div>
          ))}
        </div>
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
