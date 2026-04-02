/**
 * Server-side client for the medical-service-office Express API.
 * Never import this in Client Components.
 *
 * Auth strategy:
 * 1. Use BACKEND_SERVICE_TOKEN (env var) if available — long-lived service JWT
 * 2. Fallback to user's accessToken from cookie (jn_access) with auto-refresh
 */

import { cookies } from "next/headers"
import {
  BACKEND_ACCESS_COOKIE,
  BACKEND_REFRESH_COOKIE,
  ACCESS_COOKIE_OPTIONS,
  refreshBackendAccessToken,
} from "@/lib/auth/backend-tokens"

const BACKEND_URL = process.env.BACKEND_URL ?? "https://service.drayasminmedrano-services.cloud"
const SERVICE_TOKEN = process.env.BACKEND_SERVICE_TOKEN ?? ""

type FetchOptions = {
  method?: string
  body?: unknown
  auth?: boolean
}

/**
 * Resolves the best available token for backend auth.
 * Prefers SERVICE_TOKEN, then user's accessToken (with auto-refresh).
 */
async function resolveToken(): Promise<string | null> {
  if (SERVICE_TOKEN) return SERVICE_TOKEN

  const cookieStore = await cookies()
  let accessToken = cookieStore.get(BACKEND_ACCESS_COOKIE)?.value

  if (accessToken) return accessToken

  // Access token missing or expired — try refreshing
  const refreshToken = cookieStore.get(BACKEND_REFRESH_COOKIE)?.value
  if (!refreshToken) return null

  const newToken = await refreshBackendAccessToken(refreshToken)
  if (newToken) {
    accessToken = newToken
    cookieStore.set(BACKEND_ACCESS_COOKIE, accessToken, ACCESS_COOKIE_OPTIONS)
    return accessToken
  }

  return null
}

export async function backendFetch<T>(
  path: string,
  { method = "GET", body, auth = false }: FetchOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (auth) {
      const token = await resolveToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
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
