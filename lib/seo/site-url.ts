/**
 * Dirección canónica del sitio.
 *
 * Estaba repetida en once archivos, y en ocho de ellos con `?? ""` como valor
 * por defecto. Si la variable de entorno falta en un despliegue, ese vacío no
 * rompe la build: genera canonicals como `/blog/post`, `sitemap` sin host y
 * URLs de schema relativas — errores silenciosos que solo se ven semanas
 * después en Search Console, cuando las páginas ya se desindexaron.
 *
 * Un único valor, con el dominio real como respaldo.
 */
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasminmedrano.com"
