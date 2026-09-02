import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"
import { revalidateReviews } from "@/lib/cache"
import { proxyError, checkCsrfOrigin, isValidId, invalidIdResponse } from "@/lib/api-helpers"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// PATCH /api/reviews/[id] — protected, update status (approve/reject)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!isValidId(id)) return invalidIdResponse()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 })
  }

  const { status } = body as Record<string, unknown>
  // El backend solo soporta la transición pending -> approved vía /reviews/:id/approve.
  // Rechazar/eliminar usa DELETE (soft delete). No existe "un-approve".
  if (status !== "approved") {
    return NextResponse.json(
      { error: "Solo se admite la aprobación aquí. Para rechazar usa DELETE." },
      { status: 400 }
    )
  }

  const { data, error, status: httpStatus } = await backendFetch<unknown>(`/reviews/${id}/approve`, {
    method: "PATCH",
    auth: true,
  })
  if (error) return proxyError(error, httpStatus)

  revalidateReviews()

  return NextResponse.json(data)
}

// DELETE /api/reviews/[id] — protected
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!isValidId(id)) return invalidIdResponse()

  const { error, status } = await backendFetch<unknown>(`/reviews/${id}`, {
    method: "DELETE",
    auth: true,
  })
  if (error) return proxyError(error, status)

  revalidateReviews()

  return new NextResponse(null, { status: 204 })
}
