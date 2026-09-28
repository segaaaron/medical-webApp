import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { revalidateSiteContent } from "@/lib/cache"
import { getSiteSeo } from "@/lib/content/seo"
import { checkCsrfOrigin, checkWriteRateLimit, proxyError } from "@/lib/api-helpers"

/**
 * Metadatos SEO por página (clave `seo` de site-content).
 * El backend no valida longitudes: se validan aquí, en la frontera.
 */

const PAGES = ["home", "nosotros", "tratamientos", "contacto", "blog"] as const
const TITLE_MAX = 70
const DESCRIPTION_MAX = 170

type SeoEntry = { title: string; description: string }
type SeoValue = Record<(typeof PAGES)[number], SeoEntry>

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "")

/** Solo las páginas y campos conocidos; ausente → "". */
function normalize(raw: unknown): SeoValue {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  return Object.fromEntries(
    PAGES.map((p) => {
      const e = src[p] && typeof src[p] === "object" ? (src[p] as Record<string, unknown>) : {}
      return [p, { title: str(e.title), description: str(e.description) }]
    })
  ) as SeoValue
}

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/seo — público. 404 del backend (nunca guardado) → lo que el sitio
// publica hoy (el respaldo entero), para que el primer guardado no deje en
// blanco —título genérico duplicado— las páginas que la doctora no tocó.
export async function GET() {
  const { data, error, status } = await backendFetch<{ value?: unknown }>("/site-content/seo")
  if (status === 404) return NextResponse.json(normalize(await getSiteSeo()))
  if (error) return proxyError(error, status)
  return NextResponse.json(normalize(data?.value))
}

// PUT /api/seo — protegido. JSON { home:{title,description}, … }.
export async function PUT(req: NextRequest) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const value = normalize(body)
  for (const p of PAGES) {
    if (value[p].title.length > TITLE_MAX || value[p].description.length > DESCRIPTION_MAX) {
      return NextResponse.json(
        { error: `«${p}»: título máx. ${TITLE_MAX} y descripción máx. ${DESCRIPTION_MAX} caracteres.` },
        { status: 400 }
      )
    }
  }

  const { data, error, status } = await backendFetch("/site-content", {
    method: "PUT",
    body: { key: "seo", value },
    auth: true,
  })
  if (error) return proxyError(error, status)

  revalidateSiteContent()
  return NextResponse.json(data)
}
