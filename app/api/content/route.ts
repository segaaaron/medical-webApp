import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { readContent, writeContent } from "@/lib/store/content-store"
import { initDb } from "@/lib/db"

async function requireAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  const session = await verifyToken(token)
  return session !== null
}

export async function GET() {
  try {
    await initDb()
    const content = await readContent()
    return NextResponse.json(content)
  } catch (err) {
    console.error("[GET /api/content]", err)
    return NextResponse.json({ error: "Error al leer contenido" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  try {
    const override = await req.json()
    await initDb()
    await writeContent(override)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[POST /api/content]", err)
    return NextResponse.json({ error: "Error al guardar contenido" }, { status: 500 })
  }
}
