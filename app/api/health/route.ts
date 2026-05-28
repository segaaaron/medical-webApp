import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const checks: Record<string, "ok" | "error"> = { api: "ok" }

  try {
    const pool = getPool()
    await pool.query("SELECT 1")
    checks.db = "ok"
  } catch {
    checks.db = "error"
  }

  const healthy = Object.values(checks).every((v) => v === "ok")

  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks, ts: Date.now() },
    { status: healthy ? 200 : 503 }
  )
}
