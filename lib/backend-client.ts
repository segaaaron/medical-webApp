/**
 * Server-side client for the medical-service-office Express API.
 * Never import this in Client Components.
 */

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001"
const SERVICE_TOKEN = process.env.BACKEND_SERVICE_TOKEN ?? ""

type FetchOptions = {
  method?: string
  body?: unknown
  auth?: boolean
}

export async function backendFetch<T>(
  path: string,
  { method = "GET", body, auth = false }: FetchOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (auth && SERVICE_TOKEN) {
      headers["Authorization"] = `Bearer ${SERVICE_TOKEN}`
    }

    const res = await fetch(`${BACKEND_URL}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      return { data: null, error: err.error ?? "Backend error" }
    }

    if (res.status === 204) return { data: null, error: null }

    const data: T = await res.json()
    return { data, error: null }
  } catch {
    return { data: null, error: "Could not reach backend" }
  }
}
