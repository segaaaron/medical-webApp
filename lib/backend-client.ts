/**
 * Server-side client for the medical-service-office Express API.
 * Never import this in Client Components.
 *
 * Auth strategy (in order):
 * 1. BACKEND_SERVICE_TOKEN env var (long-lived service JWT)
 * 2. User's accessToken from cookie (jn_access) with auto-refresh
 * 3. Auto-login using DASHBOARD_USER / DASHBOARD_PASSWORD (cached in memory)
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

// ── In-memory token cache for auto-login ────────────────────────────────────
let cachedToken: string | null = null
let cachedTokenExp = 0 // timestamp in ms

async function autoLogin(): Promise<string | null> {
  const email = process.env.DASHBOARD_USER
  const password = process.env.DASHBOARD_PASSWORD
  if (!email || !password) return null

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    })
    if (!res.ok) return null
    const { accessToken } = await res.json()
    if (!accessToken) return null

    // Cache for 12 minutes (access tokens typically last 15 min)
    cachedToken = accessToken
    cachedTokenExp = Date.now() + 12 * 60 * 1000
    return accessToken
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────

type FetchOptions = {
  method?: string
  body?: unknown
  auth?: boolean
}

/**
 * Resolves the best available token for backend auth.
 */
async function resolveToken(): Promise<string | null> {
  // 1. Service token from env
  if (SERVICE_TOKEN) return SERVICE_TOKEN

  // 2. User's cookie-based token
  try {
    const cookieStore = await cookies()
    let accessToken = cookieStore.get(BACKEND_ACCESS_COOKIE)?.value
    if (accessToken) return accessToken

    const refreshToken = cookieStore.get(BACKEND_REFRESH_COOKIE)?.value
    if (refreshToken) {
      const newToken = await refreshBackendAccessToken(refreshToken)
      if (newToken) {
        cookieStore.set(BACKEND_ACCESS_COOKIE, newToken, ACCESS_COOKIE_OPTIONS)
        return newToken
      }
    }
  } catch {
    // cookies() may throw in certain server contexts (e.g. generateMetadata)
  }

  // 3. Auto-login fallback (for public Server Components without user session)
  if (cachedToken && Date.now() < cachedTokenExp) return cachedToken
  return autoLogin()
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
      // If 401 and we used a cached token, invalidate and retry once
      if (res.status === 401 && cachedToken && auth) {
        cachedToken = null
        cachedTokenExp = 0
        const freshToken = await resolveToken()
        if (freshToken) {
          headers["Authorization"] = `Bearer ${freshToken}`
          const retry = await fetch(`${BACKEND_URL}/api${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            cache: "no-store",
          })
          if (retry.ok) {
            if (retry.status === 204) return { data: null, error: null }
            const retryData: T = await retry.json()
            return { data: retryData, error: null }
          }
        }
      }

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
