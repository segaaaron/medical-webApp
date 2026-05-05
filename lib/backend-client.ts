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
  REFRESH_COOKIE_OPTIONS,
  refreshBackendAccessToken,
} from "@/lib/auth/backend-tokens"

const BACKEND_URL = process.env.BACKEND_URL ?? ""
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
  formData?: FormData
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
      const tokens = await refreshBackendAccessToken(refreshToken)
      if (tokens) {
        cookieStore.set(BACKEND_ACCESS_COOKIE, tokens.accessToken, ACCESS_COOKIE_OPTIONS)
        cookieStore.set(BACKEND_REFRESH_COOKIE, tokens.refreshToken, REFRESH_COOKIE_OPTIONS)
        return tokens.accessToken
      }
    }
  } catch {
    // cookies() may throw in certain server contexts (e.g. generateMetadata)
  }

  // 3. Auto-login fallback (for public Server Components without user session)
  if (cachedToken && Date.now() < cachedTokenExp) return cachedToken
  return autoLogin()
}

// Validate backend path to prevent SSRF — must start with / and contain no traversal
function validateBackendPath(path: string): boolean {
  if (!path.startsWith("/")) return false
  if (path.includes("..")) return false
  if (path.startsWith("//")) return false
  // Must be a relative path — no protocol schemes
  if (/^[a-z][a-z0-9+\-.]*:/i.test(path)) return false
  return true
}

export async function backendFetch<T>(
  path: string,
  { method = "GET", body, formData, auth = false }: FetchOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  if (!validateBackendPath(path)) {
    return { data: null, error: "Invalid backend path", status: 400 }
  }

  try {
    const headers: Record<string, string> = formData
      ? {} // Let fetch set Content-Type with boundary for multipart
      : { "Content-Type": "application/json" }

    if (auth) {
      const token = await resolveToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    const fetchBody = formData ? formData : body ? JSON.stringify(body) : undefined

    const res = await fetch(`${BACKEND_URL}/api${path}`, {
      method,
      headers,
      body: fetchBody,
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
            body: fetchBody,
            cache: "no-store",
          })
          if (retry.ok) {
            if (retry.status === 204) return { data: null, error: null, status: 204 }
            const retryData: T = await retry.json()
            return { data: retryData, error: null, status: retry.status }
          }
        }
      }

      const err = await res.json().catch(() => ({ error: res.statusText }))
      return { data: null, error: err.error ?? "Backend error", status: res.status }
    }

    if (res.status === 204) return { data: null, error: null, status: 204 }

    const data: T = await res.json()
    return { data, error: null, status: res.status }
  } catch {
    return { data: null, error: "Could not reach backend", status: 0 }
  }
}

/**
 * Resolves a backend image path to a browser-safe URL.
 * - Relative /uploads/* paths are proxied through Next.js (/api/uploads/*)
 *   to avoid Cross-Origin-Resource-Policy blocking.
 * - Absolute URLs are returned as-is.
 * - Malformed paths like "/https//..." are cleaned up.
 */
export function resolveImageUrl(raw: string | null | undefined): string {
  if (!raw) return ""
  const cleaned = raw
    .replace(/^\/+(https?:\/\/)/, "$1")
    .replace(/^\/+(https?\/\/)/, "https://")
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    // If the URL belongs to the backend domain, route it through the /api/uploads proxy
    // to avoid Cross-Origin-Resource-Policy blocking in the browser.
    try {
      const url = new URL(cleaned)
      const backendHost = new URL(BACKEND_URL || "https://service.drayasminmedrano-services.cloud").host
      if (url.host === backendHost && url.pathname.startsWith("/uploads/")) {
        return `/api${url.pathname}`
      }
    } catch {
      // not a valid URL, fall through
    }
    return cleaned
  }
  if (raw.startsWith("/uploads/")) return `/api${raw}`
  if (raw.startsWith("/")) return `${BACKEND_URL}${raw}`
  return raw
}
