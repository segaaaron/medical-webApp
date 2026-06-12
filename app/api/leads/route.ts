import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { checkCsrfOrigin, checkWriteRateLimit } from "@/lib/api-helpers"
import { insertLead, listLeads } from "@/lib/store/leads-store"
import { logger } from "@/lib/logger"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

const MAX = { name: 120, phone: 32, treatment: 120, message: 1000, source: 40 }

function cleanField(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

// POST /api/leads — public: persist a contact-form lead before WhatsApp redirect
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

  // Honeypot: hidden field real users never fill. Pretend success for bots.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true })
  }

  const name = cleanField(body.name, MAX.name)
  if (!name) {
    return NextResponse.json({ error: "El nombre es requerido." }, { status: 400 })
  }

  // Preferred appointment date — accept only YYYY-MM-DD
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

  try {
    const id = await insertLead(lead)
    logger.info("lead.created", { detail: `id=${id} source=${lead.source}` })
    return NextResponse.json({ ok: true, id })
  } catch (err) {
    // DB down must not break the WhatsApp flow — log the lead so it is recoverable
    logger.error("lead.store_failed", {
      detail: `${lead.name} | ${lead.phone ?? "-"} | ${lead.treatment ?? "-"} | ${err instanceof Error ? err.message : String(err)}`,
    })
    return NextResponse.json({ ok: true, stored: false })
  }
}

// GET /api/leads — admin only: latest leads for the dashboard
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? "100")
  const limit = Number.isFinite(limitParam) ? limitParam : 100

  try {
    const leads = await listLeads(limit)
    return NextResponse.json({ leads })
  } catch (err) {
    logger.error("lead.list_failed", { detail: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: "No se pudieron obtener los leads." }, { status: 500 })
  }
}
