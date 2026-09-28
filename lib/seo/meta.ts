import type { Metadata } from "next"
/**
 * Utilidades de metadatos para buscadores.
 */

/**
 * Recorta un texto a una longitud apta para la meta description sin partir
 * palabras ni frases.
 *
 * El fallo que evita: `.slice(0, 160)` sobre el texto crudo cortaba a media
 * palabra, y en Google se leía «…en tu frente, entrecejo o». Ese fragmento es
 * lo único que un paciente lee antes de decidir si entra.
 *
 * @param html   Texto de origen; puede traer etiquetas HTML.
 * @param suffix Cierre fijo (marca, ciudad, llamada a la acción).
 * @param limit  Longitud máxima del resultado completo.
 */
export function buildMetaDescription(html: string, suffix: string, limit = 155): string {
  const plain = decodeEntities(
    (html ?? "")
      // Fin de bloque = salto de línea, para reconocer la firma como línea propia.
      .replace(/<\/(p|div|h[1-6]|li)>|<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, " ")
  )
    // Firma inicial («Por: Dra. …»): no describe nada.
    .replace(/^\s*Por:[^\n]*\n/i, "")
  // Rótulos iniciales (títulos, credenciales, «Introducción»): bloques cortos
  // sin puntuación final. La descripción empieza en el primer bloque con frase.
  const blocks = plain.split("\n").map((b) => b.replace(/\s+/g, " ").trim()).filter(Boolean)
  const first = blocks.findIndex((b) => b.length > 80 || /[.?!:…"”»)]$/.test(b))
  const text = (first > 0 ? blocks.slice(first) : blocks)
    .join(" ")
    .replace(/^\d+\.\s+/, "") // numeración suelta («1. »)

  if (!text) return suffix.trim()

  const room = limit - suffix.length
  if (text.length <= room) return `${text}${suffix}`

  const cut = text.slice(0, room)
  // Preferir cerrar en frase completa; si no la hay, en la última palabra entera.
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "))
  const word = cut.lastIndexOf(" ")
  const head = sentence > room * 0.5 ? cut.slice(0, sentence + 1) : `${cut.slice(0, word)}…`

  return `${head.trim()}${suffix}`
}

const ENTIDADES: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  laquo: "«", raquo: "»", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’",
  hellip: "…", ndash: "–", mdash: "—", iexcl: "¡", iquest: "¿", ordm: "º", ordf: "ª", deg: "°",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", Uuml: "Ü",
}

/**
 * Decodifica entidades HTML (las nombradas comunes y todas las numéricas) en
 * una sola pasada: `&amp;nbsp;` queda como «&nbsp;» literal, no como espacio.
 * Sin esto, Google mostraba «&nbsp;» tal cual en el fragmento.
 */
function decodeEntities(text: string): string {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] !== "#") return ENTIDADES[e] ?? m
    const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m
  })
}

/**
 * Normaliza la URL de un perfil social para `sameAs`.
 *
 * TikTok, Instagram y Facebook añaden parámetros de seguimiento al compartir
 * («?_r=1&_t=ZS-99PdSx1EEbP»). En `sameAs` esas direcciones deben ser limpias y
 * estables: la propiedad le dice a Google «este perfil y esta web son la misma
 * entidad», y un enlace con seguimiento de sesión no identifica a nadie de
 * forma permanente.
 *
 * Se aplica al leer del panel, no al guardar: la doctora pega el enlace tal
 * como se lo da la app y no tiene por qué limpiarlo a mano.
 *
 * @returns La URL sin query ni fragmento, o cadena vacía si no es válida.
 */
export function normalizeSocialUrl(raw: string | null | undefined): string {
  if (!raw) return ""
  try {
    const url = new URL(raw.trim())
    if (url.protocol !== "https:" && url.protocol !== "http:") return ""
    url.protocol = "https:"
    url.search = ""
    url.hash = ""
    // Sin barra final: `.../@perfil` y `.../@perfil/` son la misma página, y
    // repetirlas de dos formas distintas debilita la señal.
    url.pathname = url.pathname.replace(/\/+$/, "") || "/"
    return esPerfil(url) ? url.toString() : ""
  } catch {
    return ""
  }
}

/**
 * ¿La dirección apunta a un PERFIL, y no a una publicación suelta?
 *
 * `sameAs` significa «esta cuenta es la misma entidad que este sitio». Si en el
 * panel se pega el enlace de un reel —lo que devuelve el botón «compartir» de
 * Instagram— se le está diciendo a Google que la doctora «es» esa publicación.
 * Eso no refuerza la identidad: la confunde, y es un fallo que nadie ve porque
 * el enlace funciona perfectamente al hacer clic.
 *
 * Se validan las formas de perfil de las tres redes que usa el consultorio.
 * Un dominio desconocido se acepta tal cual: puede ser un directorio médico o
 * un colegio profesional, que también son `sameAs` legítimos, y no es este el
 * sitio para llevar una lista cerrada de internet.
 */
function esPerfil(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, "")
  const ruta = url.pathname.replace(/^\//, "")

  // Rutas que existen en varias redes y NUNCA son un perfil.
  const NO_PERFIL = /^(p|reel|reels|share|stories|explore|tv|video|photo|posts|watch|groups|events|permalink\.php|story\.php)(\/|$)/i

  if (host.endsWith("instagram.com") || host.endsWith("tiktok.com") || host.endsWith("facebook.com")) {
    if (!ruta || NO_PERFIL.test(ruta)) return false
    // Un perfil es un solo segmento: `/dra_yasmin.medrano`, `/@usuario`.
    // `/dra_yasmin.medrano/reel/ABC` son dos, y es una publicación.
    return ruta.split("/").filter(Boolean).length === 1
  }
  return true
}

/**
 * Metadatos de una página fija a partir de su entrada de Dashboard → SEO /
 * Google (o del respaldo entero, si ese servicio no responde).
 *
 * El título se usa COMPLETO, tal cual (`absolute`: la marca no se añade dos
 * veces). Un título o una descripción vacíos no se declaran y la página hereda
 * los del layout: vacío = oculto, nunca un texto de reserva mezclado.
 */
export function pageSeoMetadata(
  seo: { title: string; description: string },
  opts: {
    canonical: string
    ogImageAlt: string
    /** Añadido al título (p. ej. « — Página 2»). */
    pageSuffix?: string
    keywords?: string[]
    ogType?: "website" | "profile"
  }
): Metadata {
  const title = seo.title ? `${seo.title}${opts.pageSuffix ?? ""}` : ""
  const text = { ...(title ? { title } : {}), ...(seo.description ? { description: seo.description } : {}) }
  return {
    ...(title ? { title: { absolute: title } } : {}),
    ...(seo.description ? { description: seo.description } : {}),
    ...(opts.keywords?.length ? { keywords: opts.keywords } : {}),
    alternates: { canonical: opts.canonical },
    openGraph: {
      ...text,
      url: opts.canonical,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: opts.ogImageAlt }],
      type: opts.ogType ?? "website",
      locale: "es_BO",
    },
    twitter: {
      card: "summary_large_image",
      images: ["/opengraph-image"],
      ...text,
    },
  }
}
