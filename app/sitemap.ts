import type { MetadataRoute } from "next"
import { BASE_URL } from "@/lib/seo/site-url"
import { staticBlogPosts } from "@/lib/data/blog-posts"
import { backendFetch, extractList, resolveImageUrl } from "@/lib/backend-client"

export const revalidate = 86400


interface BackendBlogPost {
  slug: string
  publishedAt: string | null
  createdAt: string
  published: boolean
  imageUrl?: string | null
}

interface BackendTreatment {
  id: string
  slug: string
  active: boolean
  updatedAt?: string | null
  createdAt?: string | null
  imageUrl?: string | null
  beforeImageUrl?: string | null
  afterImageUrl?: string | null
}

/**
 * Imagen de una entrada del sitemap, en absoluto.
 *
 * En medicina estética, Google Imágenes es una vía de entrada real: la gente
 * busca «antes y después relleno de labios» y llega por la foto. El sitemap no
 * declaraba ninguna, así que el rastreo de esas imágenes dependía de que el bot
 * las encontrara al renderizar la página. Declararlas las pone en cola directa.
 *
 * `resolveImageUrl` devuelve rutas relativas para lo que se sirve por el proxy
 * del propio sitio (`/api/uploads/...`), y el sitemap las exige absolutas.
 */
function absoluteImages(...crudas: (string | null | undefined)[]): string[] {
  const vistas = new Set<string>()
  for (const cruda of crudas) {
    const url = resolveImageUrl(cruda)
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
function fecha(...candidatas: (string | null | undefined)[]): Date {
  for (const c of candidatas) {
    if (!c) continue
    const d = new Date(c)
    if (!Number.isNaN(d.getTime())) return d
  }
  return STATIC_PAGES_LAST_MODIFIED
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Ambas lecturas van cacheadas y en paralelo. Cacheadas porque, sin
  // `revalidate`, `backendFetch` usa `no-store` y eso volvía la ruta dinámica:
  // el `revalidate = 86400` de arriba era letra muerta y cada bot que pedía el
  // sitemap disparaba dos llamadas al backend. Cacheadas además quedan
  // etiquetadas por recurso, así que publicar o borrar un post/tratamiento
  // refresca el sitemap al instante en vez de esperar 24 h.
  const [{ data: rawBlogData }, { data: rawTreatmentData }] = await Promise.all([
    backendFetch("/blog?published=true", { revalidate: 86400 }),
    backendFetch("/treatments?active=true", { revalidate: 300 }),
  ])

  const blogData = extractList<BackendBlogPost>(rawBlogData)
  const blogEntries: MetadataRoute.Sitemap = blogData.length > 0
    ? blogData
        .filter((p) => p.published)
        .map((post) => ({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: fecha(post.publishedAt, post.createdAt),
          changeFrequency: "monthly" as const,
          priority: 0.6,
          images: absoluteImages(post.imageUrl),
        }))
    : staticBlogPosts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: fecha(post.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))

  const treatmentData = extractList<BackendTreatment>(rawTreatmentData)
  const now = STATIC_PAGES_LAST_MODIFIED
  const treatmentEntries: MetadataRoute.Sitemap = treatmentData
    .filter((t) => t.active)
    .map((t) => ({
      url: `${BASE_URL}/tratamientos/${t.slug}`,
      // Fecha real de la última edición en el panel. Así, cuando la doctora
      // actualiza un tratamiento, su `lastmod` cambia y solo ese: es la señal
      // que hace que Google vuelva a rastrear esa página y no las demás.
      lastModified: fecha(t.updatedAt, t.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      // Portada MÁS el antes y el después. Vienen en el mismo listado, así que
      // declararlas no cuesta ni una llamada extra — y «antes y después» de un
      // tratamiento concreto es de las búsquedas por imagen más frecuentes del
      // sector.
      images: absoluteImages(t.imageUrl, t.beforeImageUrl, t.afterImageUrl),
    }))

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tratamientos`,
      lastModified: now,
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
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/resenas`,
      lastModified: now,
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
