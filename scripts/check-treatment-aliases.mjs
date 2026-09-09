/**
 * Verifica que cada alias de `lib/seo/treatment-aliases.mjs` apunte a un
 * tratamiento que existe y está activo en el panel.
 *
 * Un alias huérfano produce lo peor que puede hacer una redirección: un 301
 * permanente —que los navegadores cachean con fuerza— hacia un 404. Este
 * script lo detecta antes de desplegar.
 *
 *   BACKEND_URL=... BACKEND_SERVICE_TOKEN=... npm run check:aliases
 */
import { TREATMENT_ALIASES, aliasRedirects } from "../lib/seo/treatment-aliases.mjs"

const BACKEND_URL = process.env.BACKEND_URL ?? ""
const TOKEN = process.env.BACKEND_SERVICE_TOKEN ?? ""

if (!BACKEND_URL) {
  console.error("BACKEND_URL no está definido. No se puede verificar.")
  process.exit(2)
}

const res = await fetch(`${BACKEND_URL}/api/treatments?active=true`, {
  headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
})
if (!res.ok) {
  console.error(`El backend respondió ${res.status}. No se puede verificar.`)
  process.exit(2)
}

const body = await res.json()
const list = Array.isArray(body) ? body : (body.data ?? body.items ?? [])
const activos = new Set(list.map((t) => t.slug).filter(Boolean))

// Los curados se comprueban uno a uno: son los que pueden quedarse apuntando a
// un slug que ya no existe. Los generados salen del propio listado de activos,
// así que no pueden estar huérfanos — pero sí cuentan para saber qué
// tratamiento se quedó sin URL corta.
const huerfanos = Object.entries(TREATMENT_ALIASES).filter(([, slug]) => !activos.has(slug))

const conAlias = new Set((await aliasRedirects()).map((r) => r.destination.replace("/tratamientos/", "")))
const sinAlias = [...activos].filter((slug) => !conAlias.has(slug))

if (huerfanos.length) {
  console.error("\nAlias que apuntan a un tratamiento inexistente o inactivo:")
  for (const [alias, slug] of huerfanos) console.error(`  /${alias}  →  /tratamientos/${slug}`)
}
if (sinAlias.length) {
  console.warn("\nTratamientos activos sin URL corta (opcional, pero se pierde tráfico directo):")
  for (const slug of sinAlias) console.warn(`  ${slug}`)
}
if (!huerfanos.length && !sinAlias.length) console.log("Todos los alias apuntan a tratamientos activos.")

process.exit(huerfanos.length ? 1 : 0)
