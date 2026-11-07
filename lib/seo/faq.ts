/**
 * Preguntas frecuentes de una ficha de tratamiento.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EL PROBLEMA QUE RESUELVE
 *
 * La ficha declaraba un `FAQPage` con tres preguntas generadas y NO las
 * mostraba en ninguna parte. Medido sobre `/tratamientos/tratamiento-de-ojeras`:
 * las tres preguntas del JSON-LD no aparecían en el texto visible de la página.
 * Ni una.
 *
 * Eso son dos fallos a la vez:
 *
 * 1. INCUMPLE LA POLÍTICA. Google exige que el marcado FAQ refleje contenido
 *    visible en la página. Marcado que describe algo que el usuario no puede
 *    leer es motivo de acción manual, y en salud (YMYL) el listón es más alto.
 *    Encima los resultados enriquecidos de FAQ se retiraron el 2026-05-07, así
 *    que el marcado invisible tenía todo el riesgo y cero beneficio.
 *
 * 2. DESPERDICIA LA RESPUESTA. «¿Cuánto cuesta el bótox en Cochabamba?» es una
 *    búsqueda real y frecuente. La respuesta estaba escrita, con el teléfono
 *    dentro, lista para que un motor de respuestas la citara — y escondida en
 *    un `<script>`. La paciente que hacía esa pregunta no la veía al entrar.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * CÓMO FUNCIONA AHORA
 *
 * Este archivo es el ÚNICO origen. Devuelve un array de preguntas y respuestas
 * que se usa dos veces en la misma página: para pintar la sección visible y
 * para construir el `FAQPage`. No pueden divergir porque son el mismo dato.
 *
 * Todo se deriva de la ficha del panel —nombre, descripción, precio, zonas y
 * motivos deducidos del texto—, así que un tratamiento nuevo trae sus preguntas
 * el día que se publica, sin tocar código y sin que nadie las escriba a mano.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * LO QUE NO SE DICE
 *
 * La versión anterior respondía «¿Es seguro?» enumerando los años de
 * experiencia de la doctora. Eso no responde la pregunta: habla de quién lo
 * hace, no del riesgo. Y la ficha de ácido hialurónico afirmaba «reversible y
 * completamente seguro» sin mencionar una sola contraindicación.
 *
 * Ningún procedimiento médico es «completamente seguro», y prometerlo en una
 * página de salud es un problema legal antes que de posicionamiento. Aquí la
 * respuesta de seguridad dice lo que es verdad y es verificable: es un acto
 * médico, lo realiza una médica, hay valoración previa y existen
 * contraindicaciones que se evalúan en consulta.
 */

import { bodyLocationsFor, concernsFor } from "@/lib/seo/vocabulary"
import { formatPhone } from "@/lib/seo/local"
import { readsAsTreatment } from "@/lib/seo/treatment-names"

export interface FaqItem {
  question: string
  answer: string
}

/** Lo que hace falta de la ficha para generar sus preguntas. */
export interface FaqSource {
  name: string
  description?: string | null
  seoTitle?: string | null
  price?: number
}

interface FaqContext {
  /** Término de búsqueda ya saneado («Botox»). */
  seoName: string
  /** Precio del panel; 0 o ausente = se responde por valoración. */
  price?: number
  /** Teléfono en E.164 derivado del WhatsApp del panel; "" si no hay. */
  phone?: string
  /** Lista de palabras tipo «12+ años de experiencia»; "" si no hay. */
  trackRecord?: string
}

/**
 * «el tratamiento de Botox» / «Tratamiento de Ojeras».
 *
 * Sin esto salía «¿Es seguro el tratamiento de Tratamiento de Ojeras?», que es
 * lo que de verdad servía el sitio: el nombre del panel ya empieza por
 * «Tratamiento» en varias fichas y la plantilla lo prefijaba otra vez.
 */
function named(seoName: string): string {
  return readsAsTreatment(seoName) ? seoName : `el tratamiento de ${seoName}`
}

/** Enumeración en español: «a, b y c». */
function enumerate(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ""
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`
}

/**
 * Preguntas frecuentes de la ficha, en el orden en que una paciente las hace.
 *
 * El precio va primero a propósito: es la búsqueda con más intención
 * («bótox cochabamba precio») y la duda que más abandona la página. Responderla
 * arriba, aunque la respuesta sea «depende de la valoración», retiene más que
 * esconderla.
 */
export function treatmentFaqs(t: FaqSource, ctx: FaqContext): FaqItem[] {
  const { seoName, phone, trackRecord } = ctx
  const price = ctx.price ?? t.price ?? 0
  const zonas = bodyLocationsFor(t)
  const motivos = concernsFor(t)
  const contacto = phone
    ? `Escríbenos por WhatsApp al ${formatPhone(phone)}`
    : "Escríbenos por WhatsApp"

  const faqs: FaqItem[] = []

  // 1. Precio.
  faqs.push({
    question: `¿Cuánto cuesta ${seoName} en Cochabamba?`,
    answer:
      price > 0
        ? `${seoName} tiene un precio de Bs. ${price.toLocaleString("es-BO")} en el consultorio de la Dra. Yasmin Medrano Avila, en Cochabamba. El precio final se confirma en la consulta de valoración, porque la zona a tratar y la cantidad de producto necesaria varían en cada paciente. ${contacto} para agendar.`
        : `El precio de ${seoName} se define en la consulta de valoración: la zona a tratar y la cantidad de producto necesaria cambian el presupuesto de cada paciente, así que dar una cifra única sería inexacto. ${contacto} y te damos el precio para tu caso.`,
  })

  // 2. Para qué sirve. Se construye con los motivos que la propia ficha
  //    menciona, que es como la paciente nombra su problema.
  if (motivos.length) {
    faqs.push({
      question: `¿Para qué sirve ${seoName}?`,
      answer: `En el consultorio se indica ${named(seoName)} principalmente para ${enumerate(
        motivos
      )}. Si tu caso es otro, la valoración sirve justamente para decidir si este es el tratamiento adecuado o si conviene otro.`,
    })
  }

  // 3. Zonas. Solo si la descripción del panel las nombra: inventarlas sería
  //    afirmar que se trata una zona que quizá no se trata.
  if (zonas.length) {
    faqs.push({
      question: `¿En qué zonas se aplica ${seoName}?`,
      answer: `Según lo que indique la valoración, ${named(
        seoName
      )} se aplica en ${enumerate(zonas)}. La zona exacta y el plan se definen en consulta.`,
    })
  }

  // 4. Seguridad. Honesta: acto médico, valoración previa, contraindicaciones
  //    reales. Sin «completamente seguro», que es lo que decía antes.
  faqs.push({
    question: `¿Es seguro ${seoName}?`,
    answer: `${
      seoName.charAt(0).toLocaleUpperCase("es") + seoName.slice(1)
    } es un procedimiento médico y, como todo acto médico, tiene indicaciones, contraindicaciones y posibles efectos secundarios. En el consultorio lo realiza la Dra. Yasmin Medrano Avila, médica especialista en medicina estética${
      trackRecord ? ` (${trackRecord})` : ""
    }, siempre después de una consulta de valoración en la que se revisa tu historia clínica para confirmar que puedes recibirlo y explicarte los riesgos de tu caso concreto.`,
  })

  // 5. Dónde. Con ciudad y área metropolitana: es la respuesta que cita un
  //    motor cuando alguien pregunta «dónde me hago X cerca de mí».
  faqs.push({
    question: `¿Dónde puedo realizarme ${seoName} en Cochabamba?`,
    answer: `En el consultorio de la Dra. Yasmin Medrano Avila, en Cochabamba, Bolivia. Atendemos también a pacientes de Quillacollo, Sacaba, Tiquipaya, Colcapirhua y Vinto. ${contacto} para agendar tu consulta de valoración.`,
  })

  return faqs
}

/**
 * `FAQPage` a partir de las MISMAS preguntas que la página muestra.
 *
 * Recibe el array ya construido en vez de volver a generarlo: si se generara
 * dos veces, un cambio en una de las dos copias volvería a producir el marcado
 * invisible que este archivo existe para evitar.
 */
export function faqPageLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }
}
