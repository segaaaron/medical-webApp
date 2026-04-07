import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { backendFetch } from "@/lib/backend-client"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/treatments/info — public
export async function GET() {
  const { data, error } = await backendFetch<{ key: string; value: Record<string, unknown> }>(
    "/site-content/treatmentsPage"
  )
  if (error) return NextResponse.json({ error }, { status: 502 })

  // Backend returns { id, key, value: {...}, createdAt, updatedAt }
  // We only expose the value object to the client
  const content = data?.value ?? {}
  return NextResponse.json(content)
}

// PUT /api/treatments/info — protected (multipart: fields + optional image)
export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const incoming = await req.formData()

  // Build the FormData to forward to the backend
  const responseData = new FormData()
  responseData.append("key", "treatmentsPage")

  // Collect all text fields into a value object, except "doctorImage" and "key"
  const value: Record<string, unknown> = {}
  for (const [key, val] of incoming.entries()) {
    if (key === "doctorImage") continue
    // Parse consultationItems back into an array
    if (key === "consultationItems") {
      try {
        value[key] = JSON.parse(val as string)
      } catch {
        value[key] = val
      }
    } else {
      value[key] = val
    }
  }
  responseData.append("value", JSON.stringify(value))

  // Forward the image file if present
  const imageEntry = incoming.get("doctorImage")
  if (imageEntry && imageEntry instanceof File && imageEntry.size > 0) {
    responseData.append("image", imageEntry)
  }

  const { data, error } = await backendFetch("/site-content", {
    method: "PUT",
    formData: responseData,
    auth: true,
  })
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json(data)
}
