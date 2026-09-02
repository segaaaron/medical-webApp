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
