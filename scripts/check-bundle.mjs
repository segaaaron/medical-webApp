/**
 * Presupuesto de JavaScript para las páginas públicas.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ
 *
 * El peso del bundle no rompe nada: crece de a poco, cada quien añade una
 * librería «pequeña», y seis meses después el LCP en un Android de gama media
 * con 4G ya no pasa. Google mide Core Web Vitals sobre móvil incluso para
 * resultados de escritorio, y en este consultorio el tráfico llega de anuncios
 * de Instagram, o sea móvil casi entero.
 *
 * Esto suma el JavaScript que descarga cada página prerenderizada, comprimido
 * como lo sirve un servidor real, y falla si alguna se pasa del presupuesto.
 * No adivina: lee los `<script>` del HTML que el build acaba de generar.
 *
 *   npm run check:bundle
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"

const DIR = ".next/server/app"
const CHUNKS = ".next/static/chunks"
const IGNORAR = /(\/_|\/dashboard|resenas\/nueva|resenas\/r)/

/**
 * Techo por página, en KB comprimidos.
 *
 * Hoy la más pesada es la portada con 272 KB. El margen es deliberadamente
 * corto —bastante para un icono o un componente nuevo, insuficiente para que
 * entre una librería sin que nadie lo note—. Subirlo es una decisión
 * consciente: si hace falta más, que se discuta al subir este número.
 */
const PRESUPUESTO_KB = 290

function paginas(dir, acc = []) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) paginas(ruta, acc)
    else if (nombre.endsWith(".html") && !IGNORAR.test(ruta)) acc.push(ruta)
  }
  return acc
}

/** KB comprimidos que descarga una página, sin contar dos veces un chunk. */
function pesoDe(html) {
  const nombres = new Set([...html.matchAll(/\/_next\/static\/chunks\/([^"]+\.js)/g)].map((m) => m[1]))
  let bytes = 0
  for (const nombre of nombres) {
    const ruta = join(CHUNKS, nombre)
    if (existsSync(ruta)) bytes += gzipSync(readFileSync(ruta), { level: 6 }).length
  }
  return { kb: Math.round(bytes / 1024), scripts: nombres.size }
}

if (!existsSync(DIR)) {
  console.error(`No existe ${DIR}. Corre \`npm run build\` antes.`)
  process.exit(2)
}

const medidas = paginas(DIR)
  .map((ruta) => ({ pagina: ruta.replace(`${DIR}/`, "").replace(/\.html$/, "") || "/", ...pesoDe(readFileSync(ruta, "utf8")) }))
  .sort((a, b) => b.kb - a.kb)

for (const { pagina, kb, scripts } of medidas.slice(0, 5)) {
  console.log(`${String(kb).padStart(4)} KB  ${String(scripts).padStart(2)} scripts  ${pagina}`)
}

const excedidas = medidas.filter((m) => m.kb > PRESUPUESTO_KB)
if (excedidas.length) {
  console.error(`\nPresupuesto de ${PRESUPUESTO_KB} KB superado:`)
  for (const { pagina, kb } of excedidas) console.error(`  ${pagina}: ${kb} KB`)
  console.error("\nRevisa qué librería entró al bundle del cliente antes de subir el techo.")
  process.exit(1)
}
console.log(`\n${medidas.length} páginas dentro del presupuesto de ${PRESUPUESTO_KB} KB.`)
