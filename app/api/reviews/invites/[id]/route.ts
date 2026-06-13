import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { proxyError, checkCsrfOrigin, checkWriteRateLimit, isValidId, invalidIdResponse } from "@/lib/api-helpers"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// DELETE /api/reviews/invites/[id] — admin only (revoke invite)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateLimit = checkWriteRateLimit(req)
  if (rateLimit) return rateLimit
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!isValidId(id)) return invalidIdResponse()

  const { data, error, status } = await backendFetch<unknown>(`/reviews/invites/${id}`, {
    method: "DELETE",
    auth: true,
  })
  if (error) return proxyError(error, status)

  return NextResponse.json(data ?? { id, status: "revoked" })
}
