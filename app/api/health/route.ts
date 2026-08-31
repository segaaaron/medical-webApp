import { NextResponse } from "next/server"
import { backendFetch } from "@/lib/backend-client"

export const dynamic = "force-dynamic"

/**
 * Estado del frontend y de aquello de lo que depende.
 *
 * Antes comprobaba una conexión propia a Postgres. El frontend ya no habla con
 * la base: todo pasa por el backend, así que lo que hay que vigilar es que el
 * backend responda. Comprobar una dependencia que no se usa solo producía un
 * "degraded" permanente que nadie miraba.
 */
export async function GET() {
  const checks: Record<string, "ok" | "error"> = { api: "ok" }

  // Endpoint público y barato: si responde, el backend está en pie.
  const { error } = await backendFetch<unknown>("/contact", { revalidate: 0 })
  checks.backend = error ? "error" : "ok"

  const healthy = Object.values(checks).every((v) => v === "ok")

  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks, ts: Date.now() },
    { status: healthy ? 200 : 503 }
  )
}
