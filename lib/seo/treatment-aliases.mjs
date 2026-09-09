/**
 * URLs cortas de palabra clave → slug real del tratamiento.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * PARA QUÉ
 *
 * Los slugs del panel son nombres clínicos largos
 * («pdrn-polinucleotidos-de-esperma-de-salmon»). Nadie los teclea, nadie los
 * dicta por teléfono y no caben en una story de Instagram. Lo que la gente
 * escribe es «botox».
 *
 * Con estos alias, `yasminmedrano.com/botox` lleva directo a la ficha. Eso vale
 * para tres cosas distintas:
 *
 * 1. El paciente que teclea la palabra en la barra del navegador o la ve en un
 *    flyer llega a la página, no a un 404.
 * 2. Instagram, TikTok y WhatsApp pueden llevar una URL memorizable en la bio.
 * 3. Un enlace entrante a `/botox` transfiere su autoridad a la ficha real a
 *    través del 301, en vez de perderse.
 *
 * Se sirven como redirección permanente desde `next.config.mjs`, resueltas
 * antes de renderizar nada: sin coste de servidor y sin que nadie vea un 404.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * ARCHIVO .mjs A PROPÓSITO
 *
 * `next.config.mjs` no puede importar TypeScript. Manteniendo el mapa aquí, la
 * configuración y el verificador (`scripts/check-treatment-aliases.mjs`) leen
 * la MISMA lista, en vez de tener dos copias que se desincronizan.
 *
 * ⚠️ El destino debe existir entre los tratamientos activos del panel. Si un
 * slug cambia, `npm run check:aliases` lo detecta antes de desplegar.
 */

/** @type {Record<string, string>} alias (sin barra inicial) → slug real */
export const TREATMENT_ALIASES = {
  // Toxina botulínica. «botox» sin tilde es como se teclea; «bótox» es la forma
  // correcta según la RAE y la que usan los teclados con autocorrección.
  "botox": "toxina-botulinica-botox",
  "botox-cochabamba": "toxina-botulinica-botox",
  "toxina-botulinica": "toxina-botulinica-botox",
  "arrugas": "toxina-botulinica-botox",

  // Ácido hialurónico y rellenos faciales.
  "acido-hialuronico": "acido-hialuronico",
  "hialuronico": "acido-hialuronico",
  "rellenos": "acido-hialuronico",
  "relleno-facial": "acido-hialuronico",

  // Labios.
  "labios": "aumento-y-perfilado-de-labios-con-hialuronico",
  "relleno-de-labios": "aumento-y-perfilado-de-labios-con-hialuronico",
  "aumento-de-labios": "aumento-y-perfilado-de-labios-con-hialuronico",

  // Nariz sin cirugía.
  "rinomodelacion": "rinomodelacion-con-hialuronico",
  "nariz-sin-cirugia": "rinomodelacion-con-hialuronico",

  // Sudoración excesiva.
  "hiperhidrosis": "hiperhidrosis---tratamiento-para-sudoracion-excesiva-con-toxina-botulinica",
  "sudoracion-excesiva": "hiperhidrosis---tratamiento-para-sudoracion-excesiva-con-toxina-botulinica",
  "botox-para-sudor": "hiperhidrosis---tratamiento-para-sudoracion-excesiva-con-toxina-botulinica",

  // Mesoterapia.
  "mesoterapia": "mesoterapia",

  // Radiofrecuencia y flacidez.
  "radiofrecuencia": "radiofrecuencia-fraccionada-fraxface",
  "flacidez": "radiofrecuencia-fraccionada-fraxface",

  // Cóctel de vitaminas.
  "mesoterapia-con-vitaminas": "nctf-135-ha---oro-rosa",
  "vitaminas-para-la-piel": "nctf-135-ha---oro-rosa",

  // Bioestimulación con polinucleótidos.
  "bioestimulador": "pdrn-polinucleotidos-de-esperma-de-salmon",
  "bioestimulacion": "pdrn-polinucleotidos-de-esperma-de-salmon",
  "polinucleotidos": "pdrn-polinucleotidos-de-esperma-de-salmon",
  "pdrn": "pdrn-polinucleotidos-de-esperma-de-salmon",

  // Plasma rico en plaquetas.
  "prp": "plasma-rico-en-factores-de-crecimiento-prp",
  "plasma-rico-en-plaquetas": "plasma-rico-en-factores-de-crecimiento-prp",

  // Peeling y manchas.
  "peeling": "peeling-quimico",
  "peeling-quimico": "peeling-quimico",
  "manchas": "peeling-quimico",
  "manchas-en-la-cara": "peeling-quimico",
}

/** Rutas del sitio que un alias generado NO puede pisar. */
const RESERVADAS = new Set([
  "tratamientos", "blog", "nosotros", "contacto", "resenas", "resena",
  "terminos", "privacidad", "dashboard", "api", "images", "videos",
  "sitemap.xml", "robots.txt", "llms.txt", "manifest.json", "icon.svg",
])

/** Palabras que no identifican un tratamiento por sí solas. */
const VACIAS = new Set([
  "con", "de", "del", "la", "el", "los", "las", "para", "por", "y", "en", "a",
  "tratamiento", "sin",
])

/**
 * URL corta deducida del slug de un tratamiento.
 *
 * Toma la primera palabra con significado: `peeling-quimico` → `peeling`,
 * `mesoterapia` → `mesoterapia`. No intenta ser lista: si el resultado choca
 * con otra ficha o con una ruta del sitio, se descarta. Un alias ambiguo es
 * peor que ninguno, porque manda a la paciente a la ficha equivocada.
 */
function aliasDeSlug(slug) {
  const palabra = slug.split("-").find((p) => p.length > 3 && !VACIAS.has(p))
  if (!palabra || RESERVADAS.has(palabra)) return null
  // Solo ASCII. Está comprobado contra el servidor que Next no casa una ruta
  // con tildes —ni escrita en letras ni percent-encoded—, así que un alias
  // generado a partir de un slug acentuado sería una redirección que nunca
  // dispara: 404 silencioso, sin que nadie lo note. Mejor no declararla.
  return /^[a-z0-9]+$/.test(palabra) ? palabra : null
}

/**
 * Alias generados a partir de los tratamientos ACTIVOS del panel.
 *
 * Es lo que hace que un tratamiento nuevo tenga su URL corta el día que se
 * publica, sin que nadie edite este archivo. Los curados de arriba siguen
 * mandando: son los que usan la palabra por la que la gente busca de verdad
 * («labios» en vez de «aumento»), y un generado nunca los pisa.
 *
 * Si el backend no responde, se devuelve lista vacía y el sitio se queda con
 * los curados: una build no debe romperse porque el panel esté caído, y
 * quedarse sin tres redirecciones es un fallo menor que no desplegar.
 */
async function aliasDelPanel() {
  const base = process.env.BACKEND_URL
  if (!base) return []
  try {
    const res = await fetch(`${base}/api/treatments?active=true`, {
      headers: process.env.BACKEND_SERVICE_TOKEN
        ? { Authorization: `Bearer ${process.env.BACKEND_SERVICE_TOKEN}` }
        : {},
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return []
    const cuerpo = await res.json()
    const lista = Array.isArray(cuerpo) ? cuerpo : cuerpo.data ?? cuerpo.items ?? []

    const candidatos = new Map()
    for (const t of lista) {
      if (!t?.slug) continue
      const alias = aliasDeSlug(t.slug)
      if (!alias || alias in TREATMENT_ALIASES) continue
      // Dos tratamientos que producen el mismo alias lo dejan sin dueño.
      candidatos.set(alias, candidatos.has(alias) ? null : t.slug)
    }
    return [...candidatos].filter(([, slug]) => slug)
  } catch {
    return []
  }
}

/**
 * Los mismos alias en el formato de `redirects()` de Next.
 *
 * Solo formas SIN TILDE, a propósito. Se probaron las dos maneras de declarar
 * una ruta acentuada contra el servidor de producción —`/bótox` en letras y
 * `/b%C3%B3tox` percent-encoded— y ninguna casa: Next devuelve 404 en ambos
 * casos. No es una omisión, es lo que el matcher soporta hoy.
 *
 * En la práctica no se pierde nada. La barra de direcciones de un móvil no
 * añade tildes sola, nadie enlaza `/bótox` y las búsquedas con tilde llegan por
 * la ficha del tratamiento, no por su URL corta. Si algún día hace falta, el
 * sitio para resolverlo es `middleware.ts`, que sí ve la ruta decodificada.
 *
 * El emparejamiento de Next NO distingue mayúsculas —`/BOTOX` y `/Botox`
 * redirigen igual— y la barra final se normaliza sola, así que esos dos casos
 * ya están cubiertos sin escribir nada.
 */
export async function aliasRedirects() {
  const entradas = [...Object.entries(TREATMENT_ALIASES), ...(await aliasDelPanel())]
  return entradas.map(([alias, slug]) => ({
    source: `/${alias}`,
    destination: `/tratamientos/${slug}`,
    permanent: true,
  }))
}
