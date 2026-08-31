import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // `/api/uploads/` sirve TODAS las fotos del sitio (tratamientos, blog,
        // antes/después). Bloquear `/api/` entero las dejaba fuera de Google
        // Imágenes, que en estética es una fuente de tráfico real.
        allow: ["/", "/api/uploads/"],
        disallow: ["/dashboard/", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
