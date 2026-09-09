import DOMPurify from "isomorphic-dompurify"
import type { SafeHtml } from "@/lib/html/safe-html"

/**
 * Saneado de HTML. **Solo servidor.**
 *
 * Vive separado de `safe-html.ts` por una razón concreta y medida: los
 * componentes de cliente necesitan el TIPO `SafeHtml` y la marca `trustedHtml`
 * para sus literales, y si eso viviera en el mismo archivo que este `import`,
 * cada uno de ellos arrastraría `isomorphic-dompurify` al bundle del navegador
 * —9 KB comprimidos en todas las páginas públicas— exactamente el coste que la
 * separación viene a eliminar.
 *
 * Regla: si un archivo empieza por `"use client"`, no puede importar de aquí.
 */

/** Limpia HTML que viene del panel o de cualquier origen que no controlamos. */
export function sanitizeHtml(raw: string | null | undefined): SafeHtml {
  return DOMPurify.sanitize(raw ?? "") as SafeHtml
}

/**
 * Igual que `sanitizeHtml`, y además degrada los `<h1>` del contenido a `<h2>`.
 *
 * La página ya pinta su propio `<h1>` —el nombre del tratamiento o el título
 * del artículo—. El contenido del panel viene casi siempre con otro dentro
 * («Bótox – Toxina Botulínica»), así que se servían DOS h1 compitiendo por el
 * mismo término. Estaba resuelto solo en las fichas: dos artículos publicados
 * seguían sirviendo dos h1 y nadie lo vio hasta que `npm run check:seo` empezó
 * a mirarlo.
 */
export function sanitizeBody(raw: string | null | undefined): SafeHtml {
  return sanitizeHtml(raw)
    .replace(/<h1(\s[^>]*)?>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>") as SafeHtml
}
