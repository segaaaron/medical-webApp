import { BASE_URL } from "@/lib/seo/site-url"
import { backendFetch, extractList } from "@/lib/backend-client"
import { seoTitleFor, searchAliasesFor, type TreatmentRef } from "@/lib/seo/treatment-names"
import { concernSentence } from "@/lib/seo/vocabulary"
import { getFooterData } from "@/lib/data/footer"
import { normalizeSocialUrl } from "@/lib/seo/meta"

/**
 * `llms.txt` — índice del sitio en texto plano para motores de respuesta.
 *
 * robots.txt dice a QUÉ se puede entrar; llms.txt dice QUÉ hay y dónde. Un
 * modelo que responde «¿dónde me pongo bótox en Cochabamba?» necesita, en dos
 * líneas, saber que este consultorio existe, qué ofrece y en qué URL.
 *
 * Conviene saber que varios rastreadores lo ignoran y leen el HTML igual: por
 * eso el trabajo de fondo son los datos estructurados, y esto es el atajo
 * barato que se genera solo. Se deriva del panel, así que un tratamiento nuevo
 * aparece aquí sin que nadie edite el archivo.
 */
export const revalidate = 3600

interface BackendPost {
  slug: string
  title: string
  excerpt: string | null
  published: boolean
}

export async function GET() {
  const [tratamientosRes, blogRes, footer] = await Promise.all([
    backendFetch("/treatments?active=true", { revalidate: 300 }),
    backendFetch("/blog?published=true", { revalidate: 3600 }),
    getFooterData(),
  ])

  // Los perfiles salen del panel, igual que el `sameAs` del schema: una sola
  // fuente para la identidad de la doctora, no dos listas que se separan.
  const perfiles = [footer.facebookUrl, footer.instagramUrl, footer.tiktokUrl]
    .map(normalizeSocialUrl)
    .filter(Boolean)

  const tratamientos = extractList<TreatmentRef>(tratamientosRes.data).filter((t) => t.slug)
  const posts = extractList<BackendPost>(blogRes.data).filter((p) => p.published && p.slug)

  const lineas = [
    "# Dra. Yasmin Medrano Avila — Medicina Estética",
    "",
    "> Consultorio de medicina estética en Cochabamba, Bolivia. Más de 10 años de",
    "> ejercicio y más de 5.000 pacientes atendidos. Atiende Cochabamba capital y el",
    "> área metropolitana (Quillacollo, Sacaba, Tiquipaya, Colcapirhua, Vinto).",
    "",
    "Dirección: Calle Paccieri #772, entre 16 de Julio y Antezana, Cochabamba, Bolivia.",
    "Teléfono y WhatsApp: +591 78751894.",
    "Horario: lunes a viernes de 09:00 a 19:00; sábados de 09:00 a 14:00.",
    "Consulta de valoración con cita previa. Precios en bolivianos (BOB).",
    "",
    "## Perfiles oficiales",
    "Son las mismas cuentas que la web declara en `sameAs`; cualquier otra no es del consultorio.",
    ...perfiles.map((url) => `- ${url}`),
    "",
    "## Páginas principales",
    `- [Inicio](${BASE_URL}/): quién es la doctora, tratamientos destacados y reseñas de pacientes.`,
    `- [Tratamientos](${BASE_URL}/tratamientos): catálogo completo de procedimientos.`,
    `- [Sobre la doctora](${BASE_URL}/nosotros): formación, trayectoria y enfoque médico.`,
    `- [Reseñas](${BASE_URL}/resenas): valoraciones verificadas de pacientes.`,
    `- [Contacto](${BASE_URL}/contacto): dirección, mapa, horarios y formulario de cita.`,
    `- [Blog](${BASE_URL}/blog): artículos escritos y revisados por la doctora.`,
    "",
  ]

  if (tratamientos.length) {
    lineas.push("## Tratamientos")
    for (const t of tratamientos) {
      const nombre = seoTitleFor(t.slug, t.name)
      const alias = searchAliasesFor(t.slug, t.name).join(", ")
      // Para qué sirve, con las palabras de la paciente. Es la línea que un
      // motor de respuestas puede citar cuando alguien pregunta «¿dónde tratan
      // la sudoración excesiva en Cochabamba?».
      const indicado = concernSentence(t)
      lineas.push(
        `- [${nombre}](${BASE_URL}/tratamientos/${t.slug}): también conocido como ${alias}.${indicado ? ` ${indicado}` : ""}`
      )
    }
    lineas.push("")
  }

  if (posts.length) {
    lineas.push("## Artículos")
    for (const p of posts.slice(0, 40)) {
      const resumen = (p.excerpt ?? "").replace(/\s+/g, " ").trim()
      lineas.push(`- [${p.title}](${BASE_URL}/blog/${p.slug})${resumen ? `: ${resumen}` : ""}`)
    }
    lineas.push("")
  }

  lineas.push(
    "## Notas",
    "- Toda la información clínica del sitio está escrita o revisada por la Dra. Yasmin Medrano Avila, médica cirujana con especialidad en medicina estética.",
    "- Los resultados de cualquier procedimiento varían según cada paciente. Nada del sitio sustituye una consulta médica presencial.",
    ""
  )

  return new Response(lineas.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
