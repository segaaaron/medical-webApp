/**
 * Invalidación de caché on-demand — fuente única de verdad.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ EXISTE ESTE ARCHIVO
 *
 * Las páginas públicas se sirven con ISR (`export const revalidate`) y sus
 * datos con `backendFetch(..., { revalidate })`. En producción el CDN añade
 * `stale-while-revalidate` de ~1 año: el PRIMER visitante después de una
 * mutación recibe el HTML viejo y solo entonces se dispara la regeneración en
 * segundo plano.
 *
 * Resultado real observado: la doctora aprobaba una reseña y `/nosotros`
 * seguía anunciando "1 reseña verificada" hasta que alguien cargaba la página
 * dos veces. Contenido aprobado que el sitio no mostraba, sin ningún error a
 * la vista.
 *
 * La única cura es invalidar explícitamente en el momento de la mutación.
 * Antes de este módulo eso solo lo hacían `treatments` y `promo-banner`; el
 * resto de recursos —reseñas, blog, home, about, footer, contacto,
 * site-content— no invalidaban nada. Aquí se centraliza el mapa
 * recurso → rutas afectadas para que ningún endpoint nuevo vuelva a olvidarlo.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * REGLAS
 *
 * - Llamar SIEMPRE después de que el backend confirme la escritura, nunca antes.
 * - `revalidatePath(ruta)` invalida una página concreta.
 * - Las rutas dinámicas se invalidan por su PATRÓN (`/blog/[slug]`), no por una
 *   URL concreta: así caen todos los posts/tratamientos de golpe, que es lo que
 *   se quiere cuando cambia un listado o el slug de un elemento.
 * - `revalidatePath("/", "layout")` invalida el layout raíz y TODO lo anidado.
 *   Es el martillo, reservado a datos que aparecen en cada página (footer,
 *   WhatsApp, textos globales).
 */

import { revalidatePath, revalidateTag } from "next/cache"
import { logger } from "@/lib/logger"

/**
 * Tipo de invalidación de una ruta.
 *
 * `undefined` NO es lo mismo que `"page"`: `/sitemap.xml` es un Route Handler,
 * no una page, y pasarle `"page"` hacía que `revalidatePath` no encontrara la
 * entrada y no purgara NADA — verificado en runtime. Los route handlers se
 * invalidan sin tipo.
 */
type PathType = "page" | "layout" | undefined

/** Rutas públicas con contenido dinámico, agrupadas por su fuente de datos. */
const ROUTES = {
  home: "/",
  about: "/nosotros",
  treatmentsList: "/tratamientos",
  treatmentDetail: "/tratamientos/[slug]",
  blogList: "/blog",
  blogDetail: "/blog/[slug]",
  sitemap: "/sitemap.xml",
} as const

/**
 * Invalida un conjunto de rutas sin dejar que un fallo de caché tumbe la
 * mutación: el dato ya está guardado en el backend, así que un error aquí es
 * degradación (contenido stale hasta que expire el ISR), no pérdida de datos.
 * Se registra para que no pase en silencio — el bug original fue exactamente
 * eso, un silencio.
 */
function invalidate(
  resource: string,
  paths: readonly (readonly [string, PathType])[],
  tags: readonly string[] = []
): void {
  // Los tags son la misma moneda que usa `backendFetch` al escribir, así que
  // ambas capas invalidan exactamente lo mismo y ninguna depende de la otra.
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch (err) {
      logger.warn("cache.revalidate_failed", {
        resource,
        tag,
        detail: err instanceof Error ? err.message : String(err),
      })
    }
  }

  for (const [path, type] of paths) {
    try {
      revalidatePath(path, type)
    } catch (err) {
      logger.warn("cache.revalidate_failed", {
        resource,
        path,
        type: type ?? "route",
        detail: err instanceof Error ? err.message : String(err),
      })
    }
  }
}

/**
 * Reseñas: se listan en la home y en Sobre Nosotros, y alimentan el
 * `aggregateRating` del JSON-LD de ambas. Aprobar o borrar una reseña debe
 * reflejarse al instante.
 */
export function revalidateReviews(): void {
  invalidate("reviews", [
    [ROUTES.home, "page"],
    [ROUTES.about, "page"],
  ], ["backend:reviews"])
}

/**
 * Tratamientos: rejilla en la home, listado paginado y ficha por slug. El
 * sitemap enumera los slugs activos, así que también caduca.
 */
export function revalidateTreatments(): void {
  invalidate("treatments", [
    [ROUTES.home, "page"],
    [ROUTES.treatmentsList, "page"],
    [ROUTES.treatmentDetail, "page"],
    [ROUTES.sitemap, undefined],
  ], ["backend:treatments"])
}

/** Blog: listado, ficha por slug y sitemap. */
export function revalidateBlog(): void {
  invalidate("blog", [
    [ROUTES.blogList, "page"],
    [ROUTES.blogDetail, "page"],
    [ROUTES.sitemap, undefined],
  ], ["backend:blog"])
}

/** Contenido editable de la home (hero, FAQs, secciones). */
export function revalidateHome(): void {
  invalidate("home", [[ROUTES.home, "page"]], ["backend:home"])
}

/** Banner promocional: solo se pinta en la home. */
export function revalidatePromoBanner(): void {
  invalidate("promo-banner", [[ROUTES.home, "page"]], ["backend:promo-banner"])
}

/** Bio, galería y features de la doctora: aparecen en home y en Sobre Nosotros. */
export function revalidateAbout(): void {
  invalidate("about", [
    [ROUTES.home, "page"],
    [ROUTES.about, "page"],
  ], ["backend:about"])
}

/**
 * Footer: se renderiza en todas las páginas públicas. Invalidar el layout raíz
 * es más barato que enumerar rutas y olvidarse de la próxima que se añada.
 */
export function revalidateFooter(): void {
  invalidate("footer", [[ROUTES.home, "layout"]], ["backend:footer"])
}

/**
 * Datos de contacto: el botón flotante de WhatsApp vive en el layout raíz y el
 * teléfono se repite en fichas de tratamiento y en el JSON-LD del negocio.
 */
export function revalidateContact(): void {
  invalidate("contact", [[ROUTES.home, "layout"]], ["backend:contact"])
}

/**
 * `site-content` (clave `main` del content-store y `treatmentsPage`): textos
 * globales consumidos por casi todas las páginas públicas.
 */
export function revalidateSiteContent(): void {
  invalidate("site-content", [[ROUTES.home, "layout"]], ["backend:site-content"])
}
