import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL ?? "https://service.drayasminmedrano-services.cloud"

const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_\-\.]+$/

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "video/mp4",
  "video/webm",
  "application/pdf",
])

/**
 * Caché larga pero revalidable. Ver la nota de abajo, en la respuesta 200.
 */
const CACHE_CONTROL = "public, max-age=31536000, must-revalidate"

/**
 * Cabeceras de validación condicional que manda el cliente, para reenviarlas
 * al backend. Solo estas dos: cualquier otra cabecera del navegador que se
 * reenviara podría filtrar datos de la visitante a un servicio interno.
 */
function condicionales(req: NextRequest): HeadersInit {
  const out: Record<string, string> = {}
  const inm = req.headers.get("if-none-match")
  if (inm) out["If-None-Match"] = inm
  const ims = req.headers.get("if-modified-since")
  if (ims) out["If-Modified-Since"] = ims
  return out
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params

  for (const segment of path) {
    if (!SAFE_PATH_SEGMENT.test(segment) || segment === ".." || segment === ".") {
      return new NextResponse("Bad Request", { status: 400 })
    }
  }

  const backendUrl = `${BACKEND_URL}/uploads/${path.join("/")}`

  let res: Response
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    res = await fetch(backendUrl, {
      // no-store: never cache error responses; images are versioned by filename
      cache: "no-store",
      signal: controller.signal,
      // Se reenvía la validación condicional del cliente.
      //
      // Sin esto, el `ETag` que esta ruta devuelve no servía para NADA: el
      // navegador revalidaba mandando `If-None-Match`, la ruta lo ignoraba y
      // respondía 200 con el archivo entero otra vez. Reenviándolo, el backend
      // puede contestar 304 y la revalidación deja de costar una descarga —
      // que es justo lo que la cabecera promete.
      headers: condicionales(req),
    })
    clearTimeout(timeout)
  } catch {
    return new NextResponse("Gateway Timeout", { status: 504 })
  }

  // 304: el archivo no cambió. Se responde sin cuerpo, repitiendo las
  // cabeceras de validación para que el navegador renueve su copia.
  if (res.status === 304) {
    const cabeceras: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL,
      "Cross-Origin-Resource-Policy": "cross-origin",
    }
    const etag304 = res.headers.get("etag")
    if (etag304) cabeceras["ETag"] = etag304
    return new NextResponse(null, { status: 304, headers: cabeceras })
  }

  if (!res.ok) {
    // Return the upstream status so clients/CDN don't cache a stale error
    return new NextResponse("Not Found", { status: res.status === 404 ? 404 : 502 })
  }

  const contentType = res.headers.get("content-type")?.split(";")[0].trim() ?? ""

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return new NextResponse("Unsupported Media Type", { status: 415 })
  }

  // Stream del cuerpo (sin bufferear en memoria) → evita presión de memoria
  // con muchas imágenes/usuarios concurrentes. Cae a buffer si no hay stream.
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    // ────────────────────────────────────────────────────────────────────────
    // CACHÉ LARGA, PERO REVALIDABLE.
    //
    // Antes: `max-age=86400`. Los nombres de archivo que genera el backend
    // llevan marca de tiempo en milisegundos más dos hashes
    // («1789322081501-f309f27f021373df-919997f7.webp»), así que en la práctica
    // son inmutables: reemplazar una imagen produce un nombre nuevo. Con un
    // día de caché, el optimizador de Next volvía a pedir el original al
    // backend cada 24 h sin que nada hubiera cambiado. Medido: una petición en
    // frío al origen tarda 1,13 s.
    //
    // NO se usa `immutable`: el nombre lo genera un servicio que este
    // repositorio no controla, así que no se puede garantizar que nunca
    // reutilice uno. `immutable` le dice al navegador que no revalide NUNCA, y
    // si ese supuesto falla no hay forma de purgar una imagen equivocada —
    // estas rutas no están cubiertas por `revalidateTag` (ver lib/cache.ts).
    //
    // Con `must-revalidate` más el `ETag` de abajo, la revalidación cuesta un
    // 304 sin cuerpo en vez de volver a descargar el archivo: casi todo el
    // ahorro, y con marcha atrás.
    "Cache-Control": CACHE_CONTROL,
    "Cross-Origin-Resource-Policy": "cross-origin",
    "X-Content-Type-Options": "nosniff",
  }
  const contentLength = res.headers.get("content-length")
  if (contentLength) headers["Content-Length"] = contentLength
  // ETag del backend, para que la revalidación se resuelva con un 304. La ruta
  // no lo propagaba, así que cada revalidación bajaba el archivo entero.
  const etag = res.headers.get("etag")
  if (etag) headers["ETag"] = etag
  const lastModified = res.headers.get("last-modified")
  if (lastModified) headers["Last-Modified"] = lastModified

  if (res.body) {
    return new NextResponse(res.body, { status: 200, headers })
  }
  return new NextResponse(await res.arrayBuffer(), { status: 200, headers })
}
