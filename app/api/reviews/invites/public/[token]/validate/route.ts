import { NextRequest, NextResponse } from "next/server"
import { backendFetch } from "@/lib/backend-client"
import { proxyError, INVITE_TOKEN_RE } from "@/lib/api-helpers"

// GET /api/reviews/invites/public/[token]/validate — public (validate invite token)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  if (!INVITE_TOKEN_RE.test(token)) {
    return NextResponse.json({ valid: false, reason: "not_found" })
  }

  const { data, error, status } = await backendFetch<unknown>(
    `/reviews/invites/validate/${token}`
  )
  if (error) return proxyError(error, status)

  return NextResponse.json(data)
}
