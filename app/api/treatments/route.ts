import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"

// GET /api/treatments — public
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.toString()
  const path = query ? `/treatments?${query}` : "/treatments"
  const { data, error } = await backendFetch(path)
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data)
}

// POST /api/treatments — protected
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { data, error } = await backendFetch("/treatments", { method: "POST", body, auth: true })
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data, { status: 201 })
}

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}
