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

// POST /api/upload — proxies to POST /site-content/upload-image
// Field name expected by backend: "image"
export async function POST(req: NextRequest) {
  const csrfErr = checkCsrfOrigin(req)
  if (csrfErr) return csrfErr
  const rateErr = checkWriteRateLimit(req)
  if (rateErr) return rateErr

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()

  // Validate uploaded file is an image
  const file = formData.get("image")
  if (!file) {
    return NextResponse.json({ error: "No se proporcionó ningún archivo de imagen." }, { status: 400 })
  }
  if (file instanceof File) {
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]
    const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
    if (!ALLOWED_TYPES.includes(file.type)) {
      logger.warn("upload.rejected", { detail: `disallowed type: ${file.type}` })
      return NextResponse.json({ error: "Tipo de archivo no permitido." }, { status: 415 })
    }
    if (file.size > MAX_SIZE_BYTES) {
      logger.warn("upload.rejected", { detail: `file too large: ${file.size}` })
      return NextResponse.json({ error: "El archivo excede el tamaño máximo de 10 MB." }, { status: 413 })
    }
  }

  const { data, error, status } = await backendFetch<{ imageUrl: string }>(
    "/site-content/upload-image",
    { method: "POST", formData, auth: true }
  )
  if (error) return proxyError(error, status)
  return NextResponse.json(data)
}
