import { UMAMI_URL } from "@/lib/analytics"
import { logger } from "@/lib/logger"

/**
 * Recolector de Umami servido desde nuestro dominio.
 *
 * El tracker (`/script.js`, reescrito en next.config.mjs) postea a `/api/send` del
 * mismo origen, así los bloqueadores que filtran hosts `analytics.*` no lo ven.
 *
 * La IP del visitante va DENTRO del cuerpo (`payload.ip`), no en cabeceras: el
 * Traefik de Umami pisa X-Forwarded-For/X-Real-IP con la IP de nuestro servidor y
 * todo el mundo terminaría como "(Unknown)". Umami admite `ip` y `userAgent` en el
 * payload y geolocaliza la IP que recibe ahí.
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Un evento real pesa < 1 KB; la ruta es pública, así que se corta lo absurdo. */
const MAX_BODY_BYTES = 16 * 1024

/** La primera de la lista es el cliente (la pone nuestro Traefik). */
function clientIp(req: Request): string | null {
  const first = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return first || req.headers.get("x-real-ip")
}

/** Inyecta ip/userAgent en `payload`; si el cuerpo no es lo esperado, va tal cual. */
function withVisitor(body: string, ip: string | null, userAgent: string): string {
  try {
    const data = JSON.parse(body)
    const payload = data?.payload
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return body
    if (ip) payload.ip = ip
    if (userAgent) payload.userAgent = userAgent
    return JSON.stringify(data)
  } catch {
    return body
  }
}

/** 204 y no 413: quien postea es nuestro script, un error solo ensucia la consola. */
const discard = () => new Response(null, { status: 204 })

export async function POST(req: Request) {
  if (!UMAMI_URL) return discard()

  // Antes de leer: el punto del tope es no bufferear un cuerpo enorme.
  const declared = Number.parseInt(req.headers.get("content-length") ?? "", 10)
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return discard()

  const raw = await req.text()
  // Otra vez después: content-length puede mentir o no venir.
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return discard()

  // Umami rechaza peticiones sin User-Agent y lo usa para navegador/SO.
  const userAgent = req.headers.get("user-agent") ?? ""
  const body = withVisitor(raw, clientIp(req), userAgent)

  try {
    const res = await fetch(`${UMAMI_URL}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": req.headers.get("content-type") ?? "application/json",
        "User-Agent": userAgent,
      },
      body,
    })
    return new Response(await res.text(), {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "text/plain",
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    // La analítica nunca puede romper la navegación: se pierde el evento y nada más.
    logger.warn("umami.collect.unreachable", {
      detail: err instanceof Error ? err.message : String(err),
    })
    return discard()
  }
}
