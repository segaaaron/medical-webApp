import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { checkCsrfOrigin, checkWriteRateLimit, proxyError } from "@/lib/api-helpers"
import { logger } from "@/lib/logger"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

const MAX = { name: 120, phone: 30, treatment: 150, message: 2000, source: 60 }

function cleanField(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

/**
 * POST /api/leads — público: guarda el contacto del formulario antes de saltar
 * a WhatsApp.
 *
 * Antes esto escribía en Postgres directamente con `pg`, contra una tabla que
 * el propio frontend intentaba crear al vuelo. El contenedor web nunca tuvo
 * `DATABASE_URL`, así que la escritura fallaba siempre y cada contacto quedaba
 * únicamente en un log. Ahora va al backend, que es el dueño de la base.
 */
export async function POST(req: NextRequest) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  // Honeypot: campo oculto que una persona real nunca rellena. Al bot se le
  // responde que todo fue bien para que no reintente.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true })
  }

  const name = cleanField(body.name, MAX.name)
  if (!name) {
    return NextResponse.json({ error: "El nombre es requerido." }, { status: 400 })
  }

  // Fecha preferida — solo YYYY-MM-DD
  const rawDate = cleanField(body.preferredDate, 10)
  const preferredDate = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null

  const lead = {
    name,
    phone: cleanField(body.phone, MAX.phone),
    treatment: cleanField(body.treatment, MAX.treatment),
    message: cleanField(body.message, MAX.message),
    preferredDate,
    source: cleanField(body.source, MAX.source) ?? "contact-form",
  }

  const { data, error } = await backendFetch<{ id: string }>("/leads", { method: "POST", body: lead })

  if (error) {
    // Que el backend falle no puede romper el salto a WhatsApp: la conversación
    // con la paciente vale más que el registro. Se deja trazado para recuperarlo.
    logger.error("lead.store_failed", {
      detail: `${lead.name} | ${lead.phone ?? "-"} | ${lead.treatment ?? "-"} | ${error}`,
    })
    return NextResponse.json({ ok: true, stored: false })
  }

  logger.info("lead.created", { detail: `id=${data?.id} source=${lead.source}` })
  return NextResponse.json({ ok: true, id: data?.id })
}

/** GET /api/leads — solo ADMIN: últimos contactos para el panel. */
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? "100")
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 100

  const { data, error, status } = await backendFetch<unknown[]>(`/leads?limit=${limit}`, { auth: true })
  if (error) return proxyError(error, status)

  return NextResponse.json({ leads: Array.isArray(data) ? data : [] })
}
