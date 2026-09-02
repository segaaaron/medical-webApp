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
 * el título para buscadores se deriva de él en vez de copiarlo.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * CÓMO SE MANTIENE
 *
 * Un tratamiento nuevo NO necesita tocarse aquí: `normalizeName` ya arregla
 * mayúsculas, comillas y espacios dobles. `SEARCH_TERMS` solo hace falta cuando
 * el nombre clínico y el término popular no coinciden — y es justo donde está
 * el tráfico que hoy se pierde.
 */

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
 * Término por el que la gente busca realmente, cuando difiere del nombre
 * clínico. La clave es el slug, que es estable aunque se reescriba el nombre.
 *
 * `title` va al `<title>` y al H1 de buscadores; `aliases` alimenta las
 * keywords y el `alternateName` del schema `MedicalProcedure`, que es como se
 * le dice a Google «esta página también trata de esto».
 */
const SEARCH_TERMS: Record<string, { title: string; aliases: string[] }> = {
  "toxina-botulinica-botox": {
    title: "Botox",
    aliases: ["botox", "toxina botulínica", "bótox para arrugas", "botox frente y entrecejo"],
  },
  "acido-hialuronico": {
    title: "Ácido Hialurónico",
    aliases: ["ácido hialurónico", "relleno facial", "rellenos con hialurónico"],
  },
  "aumento-y-perfilado-de-labios-con-hialuronico": {
    title: "Relleno de Labios",
    aliases: ["relleno de labios", "aumento de labios", "labios con hialurónico", "perfilado de labios"],
  },
  "rinomodelacion-con-hialuronico": {
    title: "Rinomodelación sin Cirugía",
    aliases: ["rinomodelación", "nariz sin cirugía", "rinoplastia sin cirugía", "armonización de nariz"],
  },
  "hiperhidrosis---tratamiento-para-sudoracion-excesiva-con-toxina-botulinica": {
    title: "Botox para Sudoración Excesiva",
    aliases: ["sudoración excesiva axilas", "hiperhidrosis tratamiento", "botox para sudor", "transpiración excesiva"],
  },
  "mesoterapia": {
    title: "Mesoterapia Facial",
    aliases: ["mesoterapia facial", "mesoterapia", "hidratación facial profunda"],
  },
  "radiofrecuencia-fraccionada-fraxface": {
    title: "Radiofrecuencia Facial",
    aliases: ["radiofrecuencia facial", "flacidez facial", "reafirmar la piel del rostro"],
  },
  "nctf-135-ha---oro-rosa": {
    title: "Mesoterapia con Vitaminas",
    aliases: ["mesoterapia con vitaminas", "cóctel de vitaminas facial", "NCTF 135 HA", "oro rosa facial"],
  },
  "pdrn-polinucleotidos-de-esperma-de-salmon": {
    title: "Bioestimulador de Colágeno",
    aliases: ["bioestimulador de colágeno", "polinucleótidos", "PDRN salmón", "regeneración de la piel"],
  },
  "plasma-rico-en-factores-de-crecimiento-prp": {
    title: "Plasma Rico en Plaquetas (PRP)",
    aliases: ["plasma rico en plaquetas", "PRP facial", "PRP para el cabello", "vampire facial"],
  },
  "peeling-quimico": {
    title: "Peeling Químico",
    aliases: ["peeling químico", "peeling facial", "manchas en la cara", "quitar manchas faciales"],
  },
}

/** Lo mínimo que se necesita de un tratamiento del panel. */
export interface TreatmentRef {
  slug: string
  name: string
}

/** Nombre optimizado para el `<title>` y los metadatos. */
export function seoTitleFor(slug: string, rawName: string): string {
  return SEARCH_TERMS[slug]?.title ?? normalizeName(rawName)
}

/** Términos alternativos por los que esta página debe poder encontrarse. */
export function searchAliasesFor(slug: string, rawName: string): string[] {
  const entry = SEARCH_TERMS[slug]
  if (entry) return entry.aliases
  const name = normalizeName(rawName)
  return [name.toLocaleLowerCase("es")]
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
 * Se comparan los alias de búsqueda ya definidos arriba contra el texto del
 * artículo. Reutiliza el mismo vocabulario que alimenta títulos y schema, así
 * que no hay una segunda lista que mantener sincronizada.
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
    // El vocabulario sale del tratamiento real: su nombre siempre cuenta, y
    // los sinónimos de SEARCH_TERMS se suman cuando existen. Así un
    // tratamiento nuevo queda cubierto desde el primer día, aunque nadie haya
    // escrito todavía sus sinónimos de búsqueda.
    for (const alias of [normalizeName(t.name), ...searchAliasesFor(slug, t.name)]) {
      const needle = normalizeForMatch(alias)
      if (!needle) continue
      // Alias de varias palabras pesan más: «relleno de labios» es una señal
      // mucho más específica que «labios» suelto.
      const weight = needle.includes(" ") ? 3 : 1
      const hits = haystack.split(needle).length - 1
      score += hits * weight
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
    terms.add(seoTitleFor(t.slug, t.name))
    // Solo alias de varias palabras: los sueltos («labios») son ambiguos
    // fuera de contexto y ensucian la señal.
    for (const alias of searchAliasesFor(t.slug, t.name)) {
      if (alias.includes(" ")) terms.add(alias)
    }
  }
  return [...terms]
}
