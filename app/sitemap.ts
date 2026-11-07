import type { MetadataRoute } from "next"
import { BASE_URL } from "@/lib/seo/site-url"
import { getPosts } from "@/lib/content/blog"
import { getActiveTreatments } from "@/lib/content/treatments"
import { getReviews } from "@/lib/content/reviews"

export const revalidate = 86400


/**
 * Imagen de una entrada del sitemap, en absoluto.
 *
 * En medicina estética, Google Imágenes es una vía de entrada real: la gente
 * busca «antes y después relleno de labios» y llega por la foto. El sitemap no
 * declaraba ninguna, así que el rastreo de esas imágenes dependía de que el bot
 * las encontrara al renderizar la página. Declararlas las pone en cola directa.
 *
 * Las URLs llegan ya resueltas (lib/content): relativas para lo que se sirve
 * por el proxy del propio sitio (`/api/uploads/...`), y el sitemap las exige
 * absolutas.
 */
function absoluteImages(...urls: string[]): string[] {
  const vistas = new Set<string>()
  for (const url of urls) {
    if (url) vistas.add(url.startsWith("http") ? url : `${BASE_URL}${url}`)
  }
  return [...vistas]
}

/**
 * Fecha de referencia para las páginas fijas del sitio.
 *
 * NO se usa `new Date()`: el sitemap se regenera a diario y eso le decía a
 * Google que TODAS las páginas habían cambiado hoy, cada día. Cuando un
 * `lastmod` miente de forma sistemática, Google deja de creérselo y lo ignora
 * — justo la señal que sirve para que reindexe rápido lo que sí cambió.
 *
 * Esta constante se actualiza a mano cuando el contenido fijo cambia de verdad.
 */
const STATIC_PAGES_LAST_MODIFIED = new Date("2026-09-02")

/**
 * Fecha del panel, o la de reserva si no es una fecha.
 *
 * Next llama `toISOString()` sobre cada `lastModified`, y eso LANZA con una
 * fecha inválida: un campo vacío o mal formado en un solo post dejaba
 * `/sitemap.xml` devolviendo 500. Sin sitemap, Google pierde el índice del
 * sitio entero por culpa de un registro.
 */
function fecha(...candidatas: string[]): Date {
  for (const c of candidatas) {
    if (!c) continue
    const d = new Date(c)
    if (!Number.isNaN(d.getTime())) return d
  }
  return STATIC_PAGES_LAST_MODIFIED
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Ambas lecturas van cacheadas y en paralelo, y etiquetadas por recurso:
  // publicar o borrar un post/tratamiento refresca el sitemap al instante.
  // Con servicio, solo lo que el servicio publica; sin él, su respaldo entero.
  const [posts, treatments, reviews] = await Promise.all([
    getPosts(),
    getActiveTreatments(),
    getReviews(),
  ])

  const blogEntries: MetadataRoute.Sitemap = posts.data.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    // `updatedAt` primero: el tipo ya lo trae (lib/content/parse/blog.ts) y
    // sin él una corrección de un artículo no cambiaba su `lastmod`, así que
    // Google no tenía motivo para volver a leerlo.
    lastModified: fecha(post.updatedAt, post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
    images: absoluteImages(post.imageUrl),
  }))

  const now = STATIC_PAGES_LAST_MODIFIED

  const treatmentEntries: MetadataRoute.Sitemap = treatments.data
    .filter((t) => t.active)
    .map((t) => ({
      url: `${BASE_URL}/tratamientos/${t.slug}`,
      // Fecha real de la última edición en el panel: cuando la doctora edita
      // un tratamiento, cambia su `lastmod` y solo ese.
      lastModified: fecha(t.updatedAt, t.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      // Portada MÁS el antes y el después: «antes y después» de un
      // tratamiento concreto es de las búsquedas por imagen más frecuentes.
      images: absoluteImages(t.imageUrl, t.beforeImageUrl, t.afterImageUrl),
    }))

  /**
   * Fecha del hub = la del hijo más reciente.
   *
   * `/blog`, `/tratamientos` y `/resenas` cambian cada vez que se publica un
   * artículo, se edita un tratamiento o se aprueba una reseña — y las tres
   * declaraban la constante de páginas fijas, congelada en el 2026-09-02.
   * Decirle a Google que el índice del blog no cambia desde septiembre,
   * mientras se publican artículos, es pedirle que no vuelva a pasar por ahí.
   *
   * Sin hijos se cae a la constante: un hub vacío no tiene fecha propia que
   * declarar.
   */
  function masReciente(fechas: Date[]): Date {
    const validas = fechas.filter((d) => !Number.isNaN(d.getTime()))
    if (validas.length === 0) return STATIC_PAGES_LAST_MODIFIED
    return new Date(Math.max(...validas.map((d) => d.getTime())))
  }

  // Se recalcula desde los registros, no desde las entradas ya construidas:
  // así no hace falta un `as Date` que esconda el tipo real de `lastModified`.
  const blogLastMod = masReciente(posts.data.map((x) => fecha(x.updatedAt, x.publishedAt)))
  const treatmentsLastMod = masReciente(
    treatments.data.filter((t) => t.active).map((t) => fecha(t.updatedAt, t.createdAt))
  )
  const reviewsLastMod = masReciente(
    reviews.data.reviews.map((r) => new Date(r.approved_at))
  )
  // La portada muestra tratamientos y reseñas: cambia cuando cambia cualquiera.
  const homeLastMod = masReciente([treatmentsLastMod, reviewsLastMod, blogLastMod])
  return [
    {
      url: BASE_URL,
      lastModified: homeLastMod,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tratamientos`,
      lastModified: treatmentsLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/nosotros`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: blogLastMod,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/resenas`,
      lastModified: reviewsLastMod,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terminos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...treatmentEntries,
    ...blogEntries,
  ]
}
