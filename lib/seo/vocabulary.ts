/**
 * Vocabulario clínico: de lo que la doctora escribe, a lo que la gente teclea.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EL PROBLEMA
 *
 * Una paciente en Cochabamba no busca «hiperhidrosis». Busca «sudor en las
 * axilas», «me suda mucho la axila», «manchas de sudor en la ropa». Tampoco
 * busca «toxina botulínica»: busca «arrugas en la frente» o «entrecejo
 * marcado». El sitio nombraba los procedimientos por su nombre clínico y por
 * un puñado de sinónimos escritos a mano, así que toda esa búsqueda —la de
 * quien describe su problema en vez de nombrar el tratamiento— no encontraba
 * nada.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ SE DERIVA DEL PANEL Y NO DE UNA TABLA
 *
 * La tentación es escribir a mano, por cada tratamiento, su lista de zonas y
 * problemas. Eso ya se hizo una vez en este sitio y produjo lo de siempre: la
 * lista anunciaba depilación láser y reducción de medidas, que el consultorio
 * no presta, y no mencionaba los tratamientos nuevos.
 *
 * Aquí lo único fijo es el IDIOMA —cómo se llaman en español boliviano las
 * zonas del cuerpo y los problemas de piel—, que no cambia cuando la doctora
 * añade un tratamiento. Qué términos le corresponden a cada ficha se deduce de
 * su nombre y su descripción, que son justo lo que ella escribe en el panel.
 * Un tratamiento nuevo trae sus términos el día que se publica, sin tocar
 * código.
 */

/**
 * Una idea del dominio, con todas las formas en que se escribe.
 *
 * `termino` es la forma canónica —la que se muestra y se declara en el schema—.
 * `formas` son las variantes que se buscan dentro del texto del panel: singular
 * y plural, con y sin tilde, y los coloquialismos («patas de gallo»).
 */
interface Concepto {
  termino: string
  formas: string[]
  /**
   * Frases donde una de las formas aparece SIN significar este concepto. Se
   * borran del texto antes de buscar.
   *
   * El caso que lo motivó: la ficha de hiperhidrosis habla de «manchas de
   * sudor en la ropa», y eso hacía que se clasificara también como tratamiento
   * para «manchas en la piel». Un término mal atribuido no es solo ruido: lleva
   * a la ficha equivocada a quien busca manchas faciales.
   */
  excepciones?: string[]
}

/**
 * Zonas del cuerpo. Se declaran como `bodyLocation`, que es el campo con el que
 * un buscador entiende «esta página trata de las axilas».
 */
const ZONAS: Concepto[] = [
  { termino: "axilas", formas: ["axila", "axilas", "sobaco", "sobacos"] },
  { termino: "frente", formas: ["frente", "líneas de la frente", "lineas de la frente"] },
  { termino: "entrecejo", formas: ["entrecejo", "ceño", "ceno", "glabela"] },
  { termino: "contorno de ojos", formas: ["contorno de ojos", "alrededor de los ojos", "patas de gallo", "párpados", "parpados"] },
  { termino: "ojeras", formas: ["ojeras", "ojera", "surco lagrimal"] },
  { termino: "labios", formas: ["labios", "labio", "boca", "comisuras", "código de barras", "codigo de barras"] },
  { termino: "nariz", formas: ["nariz", "nasal", "punta de la nariz", "dorso", "caballete", "tabique"] },
  { termino: "pómulos", formas: ["pómulos", "pomulos", "malar", "mejillas", "cachetes"] },
  { termino: "mentón", formas: ["mentón", "menton", "barbilla", "papada"] },
  { termino: "surcos nasogenianos", formas: ["nasogenianos", "surcos", "líneas de marioneta", "lineas de marioneta"] },
  { termino: "cuello", formas: ["cuello", "escote"] },
  { termino: "manos", formas: ["manos", "mano"] },
  { termino: "pies", formas: ["pies", "planta de los pies"] },
  { termino: "cuero cabelludo", formas: ["cuero cabelludo", "cabello", "pelo", "capilar"] },
  { termino: "rostro", formas: ["rostro", "cara", "facial"] },
]

/** Motivos de consulta: cómo describe la paciente lo que le pasa. */
const PROBLEMAS: Concepto[] = [
  { termino: "sudoración excesiva", formas: ["sudoración", "sudoracion", "sudor", "transpiración", "transpiracion", "hiperhidrosis", "manchas de sudor"] },
  { termino: "arrugas", formas: ["arrugas", "arruga", "líneas de expresión", "lineas de expresion", "líneas finas", "lineas finas"] },
  { termino: "flacidez", formas: ["flacidez", "flácida", "flacida", "piel caída", "piel caida", "descolgada"] },
  {
    termino: "manchas en la piel",
    formas: ["manchas", "mancha", "melasma", "hiperpigmentación", "hiperpigmentacion", "paño", "manchas solares"],
    excepciones: ["manchas de sudor", "mancha de sudor", "manchas en la ropa"],
  },
  { termino: "acné y sus marcas", formas: ["acné", "acne", "espinillas", "cicatrices de acné", "cicatrices de acne", "marcas de acné"] },
  { termino: "pérdida de volumen", formas: ["pérdida de volumen", "perdida de volumen", "volumen", "hundido", "demacrado"] },
  { termino: "piel apagada", formas: ["piel apagada", "sin luminosidad", "opaca", "deshidratada", "deshidratación", "deshidratacion"] },
  { termino: "poros abiertos", formas: ["poros", "poro abierto", "textura irregular"] },
  { termino: "caída del cabello", formas: ["caída del cabello", "caida del cabello", "alopecia", "pérdida de cabello", "perdida de cabello"] },
  { termino: "cicatrices", formas: ["cicatriz", "cicatrices"] },
  { termino: "rejuvenecimiento facial", formas: ["rejuvenecimiento", "antiedad", "anti-edad", "envejecimiento"] },
]

/** Minúsculas y sin tildes: «Axilas» y «axila» deben coincidir. */
function normalizar(texto: string): string {
  return texto
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * ¿Aparece la forma como PALABRA en el texto?
 *
 * Con `includes` a secas, «mano» casaba dentro de «manos» pero también dentro
 * de «manoseado», y «acne» dentro de cualquier palabra que la contuviera. Se
 * exige que empiece y acabe en frontera de palabra, admitiendo el plural.
 */
function mencionada(texto: string, forma: string): boolean {
  const escapada = normalizar(forma).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(^|[^a-z0-9])${escapada}(es|s)?($|[^a-z0-9])`, "i").test(texto)
}

/** El texto sin las frases donde el concepto no significa lo que parece. */
function sinExcepciones(texto: string, c: Concepto): string {
  if (!c.excepciones?.length) return texto
  return c.excepciones.reduce((acc, frase) => acc.split(normalizar(frase)).join(" "), texto)
}

/** Lo mínimo que hace falta de un tratamiento para deducir su vocabulario. */
export interface TreatmentContent {
  name: string
  description?: string | null
}

/**
 * Conceptos que el tratamiento menciona de verdad, en su propio texto.
 *
 * @param limite Tope de conceptos. Una ficha que mencione veinte no es más
 *               relevante para ninguno: diluye la señal en vez de reforzarla.
 */
function conceptosDe(t: TreatmentContent, lista: Concepto[], limite = 6): Concepto[] {
  const completo = normalizar(`${t.name} ${t.description ?? ""}`)
  return lista
    .map((c) => ({
      concepto: c,
      // Cuántas de sus formas aparecen: un concepto nombrado de varias maneras
      // es más central en el texto que uno mencionado de pasada.
      peso: c.formas.filter((f) => mencionada(sinExcepciones(completo, c), f)).length,
    }))
    .filter((x) => x.peso > 0)
    .sort((a, b) => b.peso - a.peso)
    .slice(0, limite)
    .map((x) => x.concepto)
}

/** Zonas del cuerpo que trata esta ficha, para `bodyLocation` del schema. */
export function bodyLocationsFor(t: TreatmentContent): string[] {
  return conceptosDe(t, ZONAS, 4).map((c) => c.termino)
}

/** Motivos de consulta que resuelve esta ficha. */
export function concernsFor(t: TreatmentContent): string[] {
  return conceptosDe(t, PROBLEMAS, 4).map((c) => c.termino)
}

/**
 * Términos de búsqueda derivados del contenido, con su forma geográfica.
 *
 * Combina zona y problema con la ciudad y el país porque así se busca en
 * Bolivia: «sudoración excesiva axilas Cochabamba», no «hiperhidrosis». Las
 * variantes sin tilde entran porque es como se teclea en el móvil.
 */
export function derivedKeywords(t: TreatmentContent): string[] {
  const zonas = bodyLocationsFor(t)
  const problemas = concernsFor(t)
  const terminos = [...problemas, ...zonas]
  if (terminos.length === 0) return []

  const keywords = new Set<string>()
  for (const termino of terminos) {
    keywords.add(termino)
    keywords.add(`${termino} Cochabamba`)
    keywords.add(`${termino} tratamiento Bolivia`)
  }
  // El cruce más buscado: el problema sobre su zona.
  for (const problema of problemas.slice(0, 2)) {
    for (const zona of zonas.slice(0, 2)) {
      keywords.add(`${problema} ${zona}`)
      keywords.add(`${problema} ${zona} Cochabamba`)
    }
  }

  const sinTilde = [...keywords]
    .map((k) => k.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    .filter((k) => !keywords.has(k))

  return [...keywords, ...sinTilde]
}

/**
 * Frase legible con lo que resuelve la ficha, para la meta description y para
 * el `llms.txt`, donde un motor de respuestas la puede citar entera.
 *
 * Devuelve cadena vacía si el texto del panel no menciona nada reconocible: es
 * preferible a inventar una frase que no describa el tratamiento.
 */
export function concernSentence(t: TreatmentContent): string {
  const problemas = concernsFor(t)
  const zonas = bodyLocationsFor(t).slice(0, 2)
  if (problemas.length === 0) return ""

  const lista =
    problemas.length === 1
      ? problemas[0]
      : `${problemas.slice(0, -1).join(", ")} y ${problemas[problemas.length - 1]}`

  return zonas.length ? `Indicado para ${lista} en ${zonas.join(" y ")}.` : `Indicado para ${lista}.`
}
