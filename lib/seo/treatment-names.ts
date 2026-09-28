/**
 * Nombre clínico → nombre que la gente teclea en Google.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EL PROBLEMA QUE RESUELVE
 *
 * El `<title>` de cada tratamiento se construía con el nombre crudo del panel.
 * Eso producía, literalmente, lo que Google mostraba en los resultados:
 *
 *   ÁCIDO HIALURÓNICO en Cochabamba | Dra. Yasmin Medrano Avila
 *   PDRN  (Polinucleotidos de esperma de Salmón) en Cochabamba | Dra. Y…
 *   Toxina Botulínica "BOTOX" en Cochabamba | Dra. Yasmin Medrano Avila
 *
 * Tres fallos distintos, todos costando clics:
 *
 * 1. MAYÚSCULAS SOSTENIDAS. Google las respeta tal cual. Un resultado que grita
 *    se lee como spam y baja el porcentaje de clics frente a un competidor.
 * 2. NOMBRE CLÍNICO ≠ BÚSQUEDA REAL. Nadie teclea «PDRN polinucleótidos de
 *    esperma de salmón» ni «NCTF 135 HA». Buscan «bioestimulador salmón» o
 *    «mesoterapia con vitaminas». Si la palabra que se busca no está en el
 *    título, la página no compite por ella.
 * 3. LARGO. 86 caracteres se cortan con «…» en el resultado.
 *
 * La doctora debe poder seguir escribiendo el nombre clínico en el panel —es su
 * lenguaje profesional y así debe aparecer en la página—. Lo que cambia es que
 * el título para buscadores sale de su `seoTitle` (Dashboard → SEO / Google) o,
 * si está vacío, del nombre sin el grito.
 *
 * REGLA: el `seoTitle` NUNCA llega a texto visible. Solo alimenta `<title>`,
 * metadatos, keywords, `alternateName` del schema y los términos de `llms.txt`.
 * Todo lo que ve el paciente —footer, listados, desplegables, enlaces— usa
 * `displayNameFor`, que es el nombre del panel con solo la limpieza de
 * mayúsculas de `normalizeName`. Si la doctora escribe «Toxina Botulínica», el
 * sitio dice «Toxina Botulínica», no «Botox».
 *
 * ────────────────────────────────────────────────────────────────────────────
 * CÓMO SE MANTIENE
 *
 * Un tratamiento nuevo NO necesita tocarse aquí: `normalizeName` ya arregla
 * mayúsculas, comillas y espacios dobles. Cuando el nombre clínico y el término
 * popular no coinciden, la doctora escribe el término en el `seoTitle` de la
 * ficha: no hay tabla en el código.
 */

import { concernsFor, bodyLocationsFor } from "@/lib/seo/vocabulary"

/** Palabras que deben quedar en minúscula dentro de un título en español. */
const LOWERCASE_WORDS = new Set([
  "de", "del", "la", "las", "el", "los", "con", "y", "en", "para", "por", "a", "al",
])

/**
 * Siglas y marcas que siempre van en mayúscula.
 *
 * Es el único punto que un tratamiento nuevo puede necesitar: cuando el nombre
 * llega TODO EN MAYÚSCULAS no hay forma de distinguir una sigla («PDO») de una
 * palabra corriente («ORO»), así que las siglas del sector se declaran. Si
 * alguna falta, el único síntoma es cosmético —«Pdo» en vez de «PDO»— y el
 * arreglo es añadir una palabra a esta lista.
 */
const KEEP_UPPERCASE = new Set([
  "PRP", "PRF", "PDRN", "PDO", "NCTF", "HA", "IPL", "HIFU", "LED", "PLLA",
  "CO2", "RF", "DMAE", "EMS", "BOTOX", "PPC", "MD",
])

/**
 * Convierte un nombre gritado en mayúsculas a capitalización de título legible.
 * Deja intactos los nombres ya escritos con mayúsculas y minúsculas: si la
 * doctora escribió «Toxina Botulínica», no se toca.
 */
export function normalizeName(raw: string): string {
  const cleaned = raw.replace(/["“”]/g, "").replace(/\s+/g, " ").trim()

  const letters = cleaned.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü]/g, "")
  const upperRatio = letters
    ? letters.split("").filter((c) => c === c.toUpperCase()).length / letters.length
    : 0

  // Menos del 80 % en mayúsculas = el nombre ya tiene forma de título.
  if (upperRatio < 0.8) return cleaned

  return cleaned
    .toLocaleLowerCase("es")
    .split(" ")
    .map((word, i) => {
      const bare = word.replace(/[()]/g, "")
      if (KEEP_UPPERCASE.has(bare.toUpperCase())) {
        return word.replace(bare, bare.toUpperCase())
      }
      if (i > 0 && LOWERCASE_WORDS.has(word)) return word
      return word.charAt(0).toLocaleUpperCase("es") + word.slice(1)
    })
    .join(" ")
}

/**
 * Titular de artículo saneado: quita el grito y las comillas del panel.
 *
 * Mismo problema que ya se resolvió con los nombres de tratamiento, vivo
 * todavía en el blog: la doctora escribe «OZONOTERAPIA "OZONO MÉDICO"» y
 * Google respeta las mayúsculas tal cual. Un resultado que grita se lee como
 * spam y pierde clics frente al competidor de al lado.
 *
 * A diferencia de `normalizeName`, que produce Título Con Mayúscula En Cada
 * Palabra —correcto para el nombre de un procedimiento—, aquí se usa mayúscula
 * solo al principio, que es como se escribe un titular en español. Las siglas
 * declaradas (PRP, PDRN, BOTOX…) se conservan.
 */
export function normalizeHeadline(raw: string): string {
  const limpio = raw.replace(/["""]/g, "").replace(/\s+/g, " ").trim()

  const letras = limpio.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü]/g, "")
  const ratio = letras
    ? letras.split("").filter((c) => c === c.toUpperCase()).length / letras.length
    : 0

  // Menos del 80 % en mayúsculas = el titular ya está escrito como tal.
  if (ratio < 0.8) return limpio

  const enMinusculas = limpio
    .toLocaleLowerCase("es")
    .split(" ")
    .map((palabra) => {
      const desnuda = palabra.replace(/[()«».,:;¿?¡!"-]/g, "")
      return KEEP_UPPERCASE.has(desnuda.toUpperCase())
        ? palabra.replace(desnuda, desnuda.toUpperCase())
        : palabra
    })
    .join(" ")

  return enMinusculas.charAt(0).toLocaleUpperCase("es") + enMinusculas.slice(1)
}

/** Lo mínimo que se necesita de un tratamiento del panel. */
export interface TreatmentRef {
  slug: string
  name: string
  /**
   * Texto del panel. Opcional porque no todas las llamadas lo piden, pero
   * cuando está, el vocabulario de zonas y motivos se deduce de él en vez de
   * depender de una tabla escrita a mano.
   */
  description?: string | null
  /**
   * Cómo se busca el tratamiento («Botox»), escrito en Dashboard → SEO /
   * Google. Vacío o ausente = se deriva del nombre.
   */
  seoTitle?: string | null
}

/**
 * Nombre visible del tratamiento: el del panel, solo con la limpieza de
 * mayúsculas y comillas. Es el único que se pinta en la interfaz.
 */
export function displayNameFor(t: Pick<TreatmentRef, "name">): string {
  return normalizeName(t.name ?? "")
}

/**
 * Término de búsqueda del tratamiento: el `seoTitle` del panel («Botox») o, si
 * está vacío, el nombre del panel sin el grito. Va al `<title>` («Botox en
 * Cochabamba») y a los metadatos; nunca a texto visible: ahí va
 * `displayNameFor`.
 */
export function seoTitleFor(t: Pick<TreatmentRef, "name" | "seoTitle">): string {
  const seo = (t.seoTitle ?? "").trim()
  return seo || normalizeName(t.name ?? "")
}

/**
 * Términos por los que esta página debe poder encontrarse: el término de
 * búsqueda del panel y el nombre, en minúsculas y sin repetir. Nada escrito a
 * mano: un tratamiento nuevo queda cubierto con lo que la doctora escribe.
 */
export function searchAliasesFor(t: Pick<TreatmentRef, "name" | "seoTitle">): string[] {
  const terms = [(t.seoTitle ?? "").trim(), normalizeName(t.name ?? "")]
    .map((x) => x.toLocaleLowerCase("es"))
    .filter(Boolean)
  return [...new Set(terms)]
}

/**
 * `alternateName` del schema: el término de búsqueda del panel (`seoTitle`)
 * cuando difiere del nombre visible. Sin `seoTitle` distinto, nada: repetir el
 * nombre como alternativo no le dice nada nuevo a Google.
 */
export function alternateNamesFor(t: Pick<TreatmentRef, "name" | "seoTitle">): string[] {
  const seo = (t.seoTitle ?? "").trim()
  const same = seo.toLocaleLowerCase("es") === displayNameFor(t).toLocaleLowerCase("es")
  return seo && !same ? [seo] : []
}

/**
 * Tratamientos mencionados en un texto, ordenados por relevancia.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * PARA QUÉ
 *
 * El blog hablaba de botox en dos artículos y no enlazaba ni una vez a la
 * página de botox. Para un buscador, un enlace interno cuyo texto ES la palabra
 * clave («botox») apuntando a la página que trata de eso es de las señales de
 * relevancia más baratas y directas que existen — y el sitio no tenía ninguna.
 *
 * Se comparan los términos de búsqueda de cada tratamiento (nombre +
 * `seoTitle` del panel) contra el texto del artículo: el mismo vocabulario que
 * alimenta títulos y schema, sin una segunda lista que mantener.
 *
 * @param text  Título + cuerpo del artículo, ya sin etiquetas HTML.
 * @param limit Máximo de tratamientos a devolver.
 * @returns Slugs de tratamiento, el más mencionado primero.
 */
export function matchTreatmentsInText(
  text: string,
  treatments: TreatmentRef[],
  limit = 3
): string[] {
  const haystack = normalizeForMatch(text)

  const scored = treatments.filter((t) => t.slug).map((t) => {
    const slug = t.slug
    let score = 0
    // El vocabulario sale del tratamiento real: su nombre y su término de
    // búsqueda del panel (`seoTitle`).
    for (const alias of searchAliasesFor(t)) {
      const needle = normalizeForMatch(alias)
      if (!needle) continue
      // Alias de varias palabras pesan más: «relleno de labios» es una señal
      // mucho más específica que «labios» suelto.
      const weight = needle.includes(" ") ? 3 : 1
      const hits = haystack.split(needle).length - 1
      score += hits * weight
    }

    // Y el vocabulario que se deduce del panel: los motivos de consulta y las
    // zonas que la ficha trata.
    //
    // Sin esto había DOS vocabularios que no se hablaban. El artículo
    // «Sudoración excesiva en axilas» y la ficha de hiperhidrosis tratan
    // exactamente de lo mismo, y no se enlazaban: el emparejador solo conocía
    // los nombres, no los términos derivados del texto.
    //
    // Pesan menos que un alias explícito —«arrugas» lo mencionan media docena
    // de fichas—, así que orientan el desempate en vez de decidirlo.
    for (const termino of concernsFor(t)) {
      const needle = normalizeForMatch(termino)
      if (needle && haystack.includes(needle)) score += 2
    }
    for (const zona of bodyLocationsFor(t)) {
      const needle = normalizeForMatch(zona)
      if (needle && haystack.includes(needle)) score += 1
    }
    return { slug, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.slug)
}

/** Minúsculas y sin tildes: «Bótox» y «botox» deben coincidir. */
function normalizeForMatch(s: string): string {
  return s
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Áreas de conocimiento de la doctora, para `knowsAbout` del schema `Physician`.
 *
 * En salud, Google no solo mira qué dice una página sino QUIÉN la firma. La
 * ficha de la doctora declaraba su especialidad pero no qué domina dentro de
 * ella, así que nada conectaba a la persona con los términos por los que
 * queremos que la encuentren. Se deriva del mismo vocabulario de búsqueda: si
 * mañana se añade un tratamiento con sus alias, la ficha lo hereda.
 */
export function doctorKnowsAbout(treatments: TreatmentRef[]): string[] {
  const terms = new Set<string>()
  for (const t of treatments) {
    if (!t.slug) continue
    terms.add(seoTitleFor(t))
    // Solo términos de varias palabras: los sueltos son ambiguos fuera de
    // contexto y ensucian la señal.
    for (const alias of searchAliasesFor(t)) {
      if (alias.includes(" ")) terms.add(alias)
    }
    // Y los motivos de consulta que la propia ficha menciona. En salud Google
    // pesa QUIÉN firma: esto conecta a la doctora con «sudoración excesiva» o
    // «caída del cabello», que es como la paciente nombra su problema.
    for (const motivo of concernsFor(t)) terms.add(motivo)
  }
  return [...terms]
}

/**
 * Enlaces a las fichas de tratamiento, para menús, footer y desplegables.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ
 *
 * Estas listas vivían escritas a mano en `lib/data/footer.ts`,
 * `lib/data/navigation.ts` y en el formulario de contacto, y anunciaban cinco
 * servicios que el consultorio no presta: depilación láser, armonización
 * facial, reducción de medidas, celulitis y estrías. Un paciente podía
 * elegirlos en el formulario y pedir cita para algo inexistente.
 *
 * Encima todos apuntaban a `/tratamientos` genérico, así que el enlace interno
 * no llevaba a ninguna ficha ni transmitía relevancia hacia ella.
 *
 * Ahora salen del panel: lo que existe se enlaza, y a su página real.
 */
export function treatmentLinks(
  treatments: TreatmentRef[]
): { label: string; href: string }[] {
  return treatments
    .filter((t) => t.slug)
    .map((t) => ({
      label: displayNameFor(t),
      href: `/tratamientos/${t.slug}`,
    }))
}
