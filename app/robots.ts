import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo/site-url";

export const dynamic = "force-static";

/**
 * Rastreadores de motores de respuesta.
 *
 * En 2026 cada proveedor separa sus agentes por función: uno entrena el modelo,
 * otro construye el índice con el que responde, y otro visita la página en el
 * momento en que un usuario pregunta. Bloquear `ClaudeBot` no bloquea a
 * `Claude-SearchBot` — cada nombre necesita su propia línea.
 *
 * Aquí se permiten TODOS los de búsqueda y citación: para un consultorio, que
 * ChatGPT o Perplexity puedan responder «en Cochabamba está la Dra. Yasmin
 * Medrano» citando la web es exactamente el objetivo. No hay contenido de pago
 * ni propiedad intelectual que proteger, así que no hay nada que ganar cerrando
 * la puerta.
 *
 * Los de ENTRENAMIENTO se dejan también abiertos por la misma razón: en salud
 * local, que el modelo conozca la existencia del consultorio pesa más que el
 * uso de unos textos que ya son públicos. Si algún día se decide lo contrario,
 * se cambia `entrenamiento` a `disallow: ["/"]` y no hay que tocar nada más.
 */
const BUSQUEDA = [
  "OAI-SearchBot",      // índice de búsqueda de ChatGPT
  "ChatGPT-User",       // visita en vivo, cuando el usuario pregunta
  "Claude-SearchBot",   // índice de búsqueda de Claude
  "Claude-User",        // visita en vivo de Claude
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",    // Gemini y las respuestas generadas de Google
  "Applebot-Extended",
];

const ENTRENAMIENTO = ["GPTBot", "ClaudeBot", "anthropic-ai", "CCBot", "Bytespider", "meta-externalagent"];

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
      {
        userAgent: [...BUSQUEDA, ...ENTRENAMIENTO],
        allow: ["/", "/api/uploads/"],
        // El panel queda fuera también para ellos: contiene datos de pacientes.
        disallow: ["/dashboard/", "/api/", "/resenas/r/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
