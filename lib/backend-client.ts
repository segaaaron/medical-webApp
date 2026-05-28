/**
 * Server-side client for the medical-service-office Express API.
 * Never import this in Client Components.
 *
 * Auth strategy (in order):
 * 1. BACKEND_SERVICE_TOKEN env var (long-lived service JWT)
 * 2. User's accessToken from cookie (jn_access) with auto-refresh
 */

import { cookies } from "next/headers"
import {
  BACKEND_ACCESS_COOKIE,
  BACKEND_REFRESH_COOKIE,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
  CLEAR_COOKIE_OPTIONS,
  refreshBackendAccessToken,
} from "@/lib/auth/backend-tokens"
import { COOKIE_NAME } from "@/lib/auth/session"

const SESSION_CLEAR = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
}

const BACKEND_URL = process.env.BACKEND_URL ?? ""
const SERVICE_TOKEN = process.env.BACKEND_SERVICE_TOKEN ?? ""

// ─────────────────────────────────────────────────────────────────────────────

type FetchOptions = {
  method?: string
  body?: unknown
  formData?: FormData
  auth?: boolean
  revalidate?: number  // seconds; omit = no-store (default for dynamic/auth routes)
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
    const accessToken = cookieStore.get(BACKEND_ACCESS_COOKIE)?.value
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

  return null
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
  { method = "GET", body, formData, auth = false, revalidate }: FetchOptions = {}
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
    const cacheOption: RequestInit =
      revalidate !== undefined
        ? { next: { revalidate } }
        : { cache: "no-store" }

    const res = await fetch(`${BACKEND_URL}/api${path}`, {
      method,
      headers,
      body: fetchBody,
      ...cacheOption,
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      if (res.status === 401 && auth) {
        try {
          const cookieStore = await cookies()
          const storedRefresh = cookieStore.get(BACKEND_REFRESH_COOKIE)?.value

          if (storedRefresh) {
            const tokens = await refreshBackendAccessToken(storedRefresh)

            if (tokens) {
              // Refresh succeeded — update cookies and retry original request
              cookieStore.set(BACKEND_ACCESS_COOKIE, tokens.accessToken, ACCESS_COOKIE_OPTIONS)
              cookieStore.set(BACKEND_REFRESH_COOKIE, tokens.refreshToken, REFRESH_COOKIE_OPTIONS)
              headers["Authorization"] = `Bearer ${tokens.accessToken}`
              const retry = await fetch(`${BACKEND_URL}/api${path}`, {
                method,
                headers,
                body: fetchBody,
                ...cacheOption,
                signal: AbortSignal.timeout(10_000),
              })
              if (retry.ok) {
                if (retry.status === 204) return { data: null, error: null, status: 204 }
                const retryData: T = await retry.json()
                return { data: retryData, error: null, status: retry.status }
              }
              const retryErr = await retry.json().catch(() => ({ error: retry.statusText }))
              return { data: null, error: retryErr.error ?? "Backend error", status: retry.status }
            }

            // Refresh token expired — wipe all auth cookies to force logout
            cookieStore.set(BACKEND_ACCESS_COOKIE, "", CLEAR_COOKIE_OPTIONS)
            cookieStore.set(BACKEND_REFRESH_COOKIE, "", CLEAR_COOKIE_OPTIONS)
            cookieStore.set(COOKIE_NAME, "", SESSION_CLEAR)
            return { data: null, error: "SESSION_EXPIRED", status: 401 }
          }
        } catch {
          // cookies() may throw outside request context (e.g. generateMetadata)
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
 * Extracts an array from either a direct array or a paginated { data: T[] } response.
 * Handles backend pagination change transparently.
 */
export function extractList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === "object" && "data" in data && Array.isArray((data as { data: unknown }).data)) {
    return (data as { data: T[] }).data
  }
  return []
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
