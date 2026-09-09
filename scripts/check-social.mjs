/**
 * Los perfiles que el sitio declara como suyos, ¿existen?
 *
 * ────────────────────────────────────────────────────────────────────────────
 * QUÉ COMPRUEBA
 *
 * `sameAs` y `rel="me"` le dicen a Google «esta cuenta es la misma entidad que
 * este sitio». Es la propiedad que une la web con el Facebook, el Instagram y
 * el TikTok, y por eso las señales de cada uno se suman en vez de dispersarse.
 *
 * Un perfil renombrado o borrado convierte esa afirmación en un enlace muerto.
 * No rompe nada visible —la build pasa, la página se ve bien— y la señal de
 * identidad se degrada en silencio. Esto lo saca a la luz.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ NO FALLA LA BUILD
 *
 * Instagram y Facebook responden 403 o 302 a cualquier petición que no parezca
 * un navegador, y lo hacen de forma intermitente. Bloquear un despliegue por
 * eso sería un falso positivo constante. Este script INFORMA: sale con código 0
 * salvo que un perfil no tenga forma de perfil, que sí es un fallo nuestro y no
 * depende de la red.
 *
 *   BACKEND_URL=... npm run check:social
 */
const BACKEND_URL = process.env.BACKEND_URL ?? ""
const TOKEN = process.env.BACKEND_SERVICE_TOKEN ?? ""

/** Misma validación que `lib/seo/meta.ts`, en la forma mínima que hace falta. */
const NO_PERFIL = /^(p|reel|reels|share|stories|explore|tv|video|photo|posts|watch|groups|events|permalink\.php|story\.php)(\/|$)/i

function formaDePerfil(raw) {
  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, "")
    const ruta = url.pathname.replace(/^\/|\/$/g, "")
    if (!/instagram\.com$|tiktok\.com$|facebook\.com$/.test(host)) return true
    return Boolean(ruta) && !NO_PERFIL.test(ruta) && ruta.split("/").filter(Boolean).length === 1
  } catch {
    return false
  }
}

if (!BACKEND_URL) {
  console.error("BACKEND_URL no está definido. No se puede verificar.")
  process.exit(2)
}

const res = await fetch(`${BACKEND_URL}/api/contact`, {
  headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
})
if (!res.ok) {
  console.error(`El backend respondió ${res.status}. No se puede verificar.`)
  process.exit(2)
}

const cuerpo = await res.json()
const c = cuerpo.data ?? cuerpo
const perfiles = [
  ["Facebook", c.facebookUrl],
  ["Instagram", c.instagramUrl],
  ["TikTok", c.tiktokUrl],
].filter(([, url]) => url)

if (perfiles.length === 0) {
  console.warn("El panel no tiene ningún perfil social configurado: el sitio no declara `sameAs`.")
  process.exit(0)
}

let malFormados = 0
for (const [red, url] of perfiles) {
  const forma = formaDePerfil(url)
  if (!forma) malFormados++

  let alcance = "no comprobado"
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; verificacion-perfiles)" },
      signal: AbortSignal.timeout(10_000),
    })
    alcance = `HTTP ${r.status}`
  } catch (e) {
    alcance = `sin respuesta (${e.name})`
  }

  console.log(`${forma ? "  ok  " : "FALLA "} ${red.padEnd(10)} ${url}`)
  console.log(`        forma de perfil: ${forma ? "sí" : "NO — parece una publicación, no una cuenta"} · alcance: ${alcance}`)
}

const faltan = ["Facebook", "Instagram", "TikTok"].filter((r) => !perfiles.some(([n]) => n === r))
if (faltan.length) console.warn(`\nSin configurar en el panel: ${faltan.join(", ")}`)

if (malFormados) {
  console.error(`\n${malFormados} perfil(es) con forma incorrecta: no entran en \`sameAs\` y la identidad queda coja.`)
  process.exit(1)
}
console.log("\nTodos los perfiles declarados tienen forma de perfil.")
