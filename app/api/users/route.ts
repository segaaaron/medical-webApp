import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { proxyError } from "@/lib/api-helpers"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/users — protected
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error, status } = await backendFetch<unknown>("/users", { auth: true })
  if (error) return proxyError(error, status)

  const list = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>)?.data)
      ? (data as Record<string, unknown>).data
      : data

  return NextResponse.json(list)
}
