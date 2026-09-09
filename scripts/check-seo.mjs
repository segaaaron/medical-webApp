/**
 * Red mínima de seguridad para las señales de SEO.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * QUÉ PROTEGE Y POR QUÉ ASÍ
 *
 * El sitio acumuló, sin que nadie se enterara, cuatro fichas de la doctora y
 * tres del consultorio: cada página nueva se inventaba las suyas y todas se
 * contradecían. También llevaba tiempo sirviendo dos secciones con los enlaces
 * internos ilegibles. Ninguna de las dos cosas rompe la build, ninguna sale en
 * `tsc`, y las dos costaban posicionamiento en silencio.
 *
 * Esto revisa el HTML que el build YA generó. Sin framework de tests, sin
 * dependencias nuevas y sin levantar un servidor: son asertos sobre archivos
 * que existen después de `npm run build`.
 *
 * Cubre solo las páginas prerenderizadas —portada, nosotros, legales, blog y
 * las once fichas de tratamiento—. Las dinámicas (`/contacto`, `/resenas`, cada
 * artículo) no dejan HTML en disco y quedan fuera: comprobarlas exigiría
 * levantar servidor y backend en la CI, que es justo la complejidad que esta
 * red evita. Con las fichas dentro, cualquier regresión del `@graph` compartido
 * o de la plantilla de metadatos se detecta igual, porque el layout es común.
 *
 *   npm run check:seo            revisa el build
 *   npm run check:seo -- --self-test   comprueba que las reglas detectan fallos
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs"
import { join } from "node:path"

const DIR = ".next/server/app"
/**
 * Páginas internas que no compiten en buscadores: el panel, las pantallas de
 * error que Next genera y los flujos privados de reseña. El `_` va precedido de
 * barra a propósito — anclarlo al principio no servía, porque la ruta empieza
 * por `.next/`.
 */
const IGNORAR = /(\/_|\/dashboard|resenas\/nueva|resenas\/r)/

const LIMITE_DESCRIPTION = 160

// ─────────────────────────────────────────────────────────────────────────────
// Reglas
// ─────────────────────────────────────────────────────────────────────────────

/** Todos los bloques JSON-LD de una página, ya parseados. */
function bloquesJsonLd(html) {
  const crudos = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  return crudos.map(([, texto], i) => {
    try {
      return JSON.parse(texto)
    } catch (e) {
      throw new Error(`bloque JSON-LD #${i + 1} no es JSON válido: ${e.message}`)
    }
  })
}

/** Aplana `@graph` para poder recorrer todos los nodos por igual. */
function nodos(bloques) {
  return bloques.flatMap((b) => (Array.isArray(b["@graph"]) ? b["@graph"] : [b]))
}

function tipos(nodo) {
  return [nodo?.["@type"]].flat().filter(Boolean)
}

const reglas = [
  {
    nombre: "El JSON-LD es válido",
    check: (html) => {
      bloquesJsonLd(html)
      return null
    },
  },
  {
    nombre: "Una sola doctora y un solo consultorio",
    check: (html) => {
      // El fallo que evita: cada página describía su propia `Physician` y su
      // propio negocio, sin `@id`, así que para Google eran entidades
      // distintas y las señales —reseñas incluidas— se repartían entre ellas.
      const lista = nodos(bloquesJsonLd(html))
      const fallos = []
      for (const [etiqueta, tipo] of [["doctora", "Physician"], ["consultorio", "MedicalClinic"]]) {
        const anonimos = lista.filter((n) => tipos(n).includes(tipo) && !n["@id"])
        if (anonimos.length) fallos.push(`${anonimos.length} ${etiqueta}(s) sin @id`)
      }
      return fallos.length ? fallos.join("; ") : null
    },
  },
  {
    nombre: "Ningún @id se contradice consigo mismo",
    check: (html) => {
      // Dos nodos con el MISMO `@id` y distinto `name` son dos versiones de la
      // misma entidad peleándose en la misma página. Ya pasó con `WebSite`.
      const porId = new Map()
      for (const n of nodos(bloquesJsonLd(html))) {
        if (!n["@id"] || !n.name) continue
        const previo = porId.get(n["@id"])
        if (previo && previo !== n.name) {
          return `${n["@id"]} se declara como «${previo}» y como «${n.name}»`
        }
        porId.set(n["@id"], n.name)
      }
      return null
    },
  },
  {
    nombre: "Sin reseñas propias en el schema del negocio",
    check: (html) => {
      // Google declara inelegibles para estrellas las reseñas que la propia
      // entidad aloja sobre sí misma. El `aggregateRating` sí se mantiene.
      const conReviews = nodos(bloquesJsonLd(html)).filter(
        (n) => Array.isArray(n.review) && tipos(n).some((t) => /Medical|LocalBusiness|Organization/.test(t))
      )
      return conReviews.length ? `${conReviews.length} nodo(s) de negocio con review[]` : null
    },
  },
  {
    nombre: "Las fichas declaran zona o motivo de consulta",
    check: (html) => {
      // El vocabulario clínico se deduce del texto del panel
      // (`lib/seo/vocabulary.ts`). Si esa derivación se rompe —una expresión
      // regular mal tocada, un cambio en el formato del panel— las fichas
      // pierden en silencio `bodyLocation` e `indication`, que es lo que hace
      // que «axila» o «sudoración» lleven a la ficha correcta. No falla la
      // build ni el tipado: solo deja de encontrarse.
      const procedimientos = nodos(bloquesJsonLd(html)).filter((n) =>
        tipos(n).includes("MedicalProcedure")
      )
      const mudos = procedimientos.filter((n) => !n.bodyLocation && !n.indication)
      return mudos.length ? `${mudos.length} MedicalProcedure sin bodyLocation ni indication` : null
    },
  },
  {
    nombre: "Tiene canonical",
    check: (html) => (/<link rel="canonical"/.test(html) ? null : "falta <link rel=\"canonical\">"),
  },
  {
    nombre: "Tiene title",
    check: (html) => {
      const m = html.match(/<title>([^<]*)<\/title>/)
      if (!m || !m[1].trim()) return "falta <title>"
      return null
    },
  },
  {
    nombre: `La description cabe en ${LIMITE_DESCRIPTION} caracteres`,
    check: (html) => {
      const m = html.match(/<meta name="description" content="([^"]*)"/)
      if (!m) return "falta la meta description"
      // Google corta por el final: pasarse significa perder el cierre, que es
      // justo donde suele ir la ciudad o la llamada a la acción.
      return m[1].length > LIMITE_DESCRIPTION
        ? `${m[1].length} caracteres`
        : null
    },
  },
  {
    nombre: "Un solo <h1>",
    check: (html) => {
      const n = (html.match(/<h1[\s>]/g) ?? []).length
      if (n === 0) return "no hay <h1>"
      return n > 1 ? `${n} elementos <h1>` : null
    },
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Recorrido
// ─────────────────────────────────────────────────────────────────────────────

function paginas(dir, acc = []) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) paginas(ruta, acc)
    else if (nombre.endsWith(".html") && !IGNORAR.test(ruta)) acc.push(ruta)
  }
  return acc
}

function revisar(rutas) {
  const fallos = []
  for (const ruta of rutas) {
    const html = readFileSync(ruta, "utf8")
    const pagina = ruta.replace(`${DIR}/`, "").replace(/\.html$/, "")
    for (const regla of reglas) {
      let problema
      try {
        problema = regla.check(html)
      } catch (e) {
        problema = e.message
      }
      if (problema) fallos.push(`${pagina}: ${regla.nombre} → ${problema}`)
    }
  }
  return fallos
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-comprobación: una red que no detecta nada no es una red
// ─────────────────────────────────────────────────────────────────────────────

function selfTest() {
  const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`
  const base = (extra = "", desc = "corta") =>
    `<html><head><title>t</title><link rel="canonical" href="/"/>` +
    `<meta name="description" content="${desc}"/>${extra}</head><body><h1>uno</h1></body></html>`

  const casos = [
    ["página correcta", base(ld({ "@type": "Physician", "@id": "/#doctor", name: "Dra." })), 0],
    ["ficha con zona", base(ld({ "@type": "MedicalProcedure", bodyLocation: ["axilas"] })), 0],
    ["ficha con motivo", base(ld({ "@type": "MedicalProcedure", indication: [{ name: "sudoración excesiva" }] })), 0],
    ["ficha muda", base(ld({ "@type": "MedicalProcedure", name: "Algo" })), 1],
    ["doctora sin @id", base(ld({ "@type": "Physician", name: "Dra." })), 1],
    ["consultorio sin @id", base(ld({ "@type": "MedicalClinic", name: "C" })), 1],
    [
      "mismo @id con dos nombres",
      base(ld({ "@graph": [
        { "@type": "MedicalClinic", "@id": "/#b", name: "Uno" },
        { "@type": "MedicalClinic", "@id": "/#b", name: "Dos" },
      ] })),
      1,
    ],
    ["reseñas propias", base(ld({ "@type": "MedicalClinic", "@id": "/#b", review: [{}] })), 1],
    // Un JSON roto hace saltar las CINCO reglas que necesitan parsearlo. No es
    // ruido: cada una informa de que no pudo comprobar lo suyo.
    ["JSON roto", base('<script type="application/ld+json">{nope}</script>'), 5],
    ["sin canonical", '<html><head><title>t</title><meta name="description" content="c"/></head><body><h1>u</h1></body></html>', 1],
    ["dos h1", base().replace("<h1>uno</h1>", "<h1>uno</h1><h1>dos</h1>"), 1],
    ["description larga", base("", "x".repeat(161)), 1],
  ]

  let malos = 0
  for (const [nombre, html, esperados] of casos) {
    const encontrados = reglas
      .map((r) => { try { return r.check(html) } catch (e) { return e.message } })
      .filter(Boolean).length
    const ok = encontrados === esperados
    if (!ok) malos++
    console.log(`${ok ? "ok  " : "FALLA"}  ${nombre} — esperaba ${esperados}, encontró ${encontrados}`)
  }
  if (malos) {
    console.error(`\n${malos} regla(s) no detectan lo que deberían.`)
    process.exit(1)
  }
  console.log("\nLas reglas detectan todos los fallos de prueba.")
}

// ─────────────────────────────────────────────────────────────────────────────

if (process.argv.includes("--self-test")) {
  selfTest()
} else {
  if (!existsSync(DIR)) {
    console.error(`No existe ${DIR}. Corre \`npm run build\` antes.`)
    process.exit(2)
  }
  const rutas = paginas(DIR)
  if (rutas.length === 0) {
    console.error(`No se encontró ninguna página en ${DIR}.`)
    process.exit(2)
  }
  const fallos = revisar(rutas)
  if (fallos.length) {
    console.error(`\n${fallos.length} problema(s) de SEO en ${rutas.length} páginas:\n`)
    for (const f of fallos) console.error(`  ${f}`)
    process.exit(1)
  }
  console.log(`${rutas.length} páginas revisadas, sin problemas de SEO.`)
}
