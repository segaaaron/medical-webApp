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
export function buildMetaDescription(html: string, suffix: string, limit = 158): string {
  const plain = (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!plain) return suffix.trim()

  const room = limit - suffix.length
  if (plain.length <= room) return `${plain}${suffix}`

  const cut = plain.slice(0, room)
  // Preferir cerrar en frase completa; si no la hay, en la última palabra entera.
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "))
  const word = cut.lastIndexOf(" ")
  const head = sentence > room * 0.5 ? cut.slice(0, sentence + 1) : `${cut.slice(0, word)}…`

  return `${head.trim()}${suffix}`
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
    return url.toString()
  } catch {
    return ""
  }
}
