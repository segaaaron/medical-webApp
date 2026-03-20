import { NextResponse } from "next/server"
import { readContent, writeContent } from "@/lib/store/content-store"
import type { ContentOverride } from "@/types/content"

// GET /api/content — returns the full content store (defaults + overrides)
export async function GET() {
  const content = readContent()
  return NextResponse.json(content)
}

// POST /api/content — saves a partial override to data/content.json
export async function POST(request: Request) {
  try {
    const body: ContentOverride = await request.json()
    writeContent(body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save content", detail: String(error) },
      { status: 500 }
    )
  }
}
