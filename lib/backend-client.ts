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

const BACKEND_URL = process.env.BACKEND_URL ?? ""
const SERVICE_TOKEN = process.env.BACKEND_SERVICE_TOKEN ?? ""

// ─────────────────────────────────────────────────────────────────────────────
// Deduped refresh with rotation grace.
//
// The backend ROTATES the refresh token on every /auth/refresh call: the old
// token is invalidated and a new one returned. Two failure modes under
// concurrency, both of which wiped the user's backend session:
//
//   1. Simultaneous refresh — the Sidebar pending-badge + the Reseñas
//      InviteManager both mount on the same page load and hit an expired access
//      token at once. Both try to refresh with the SAME token; the first
//      rotates it, the second sends the now-invalid old token and fails.
//      → Fixed by sharing one in-flight promise per token (`inflightByToken`).
//
//   2. Propagation lag — after a rotation R0→R1 completes, a straggler request
//      the browser already sent with R0 (before the R1 Set-Cookie propagated)
//      arrives and re-spends R0, which the backend now rejects.
//      → Fixed by a short-TTL grace cache (`rotatedCache`) mapping a just-
//      consumed token to its successful result, so the straggler reuses the
//      rotated tokens instead of hitting the backend again.
//
// Module scope is shared across concurrent requests within a server instance —
// exactly where these races occur. Maps are keyed by token (per-user unique),
// so distinct users never collide.

type RefreshResult = { accessToken: string; refreshToken: string }

const ROTATION_GRACE_MS = 30_000

const inflightByToken = new Map<string, Promise<RefreshResult | null>>()
const rotatedCache = new Map<string, { result: RefreshResult; expiresAt: number }>()

function pruneRotatedCache(now: number): void {
  for (const [token, entry] of rotatedCache) {
    if (entry.expiresAt <= now) rotatedCache.delete(token)
  }
}

function refreshDeduped(refreshToken: string): Promise<RefreshResult | null> {
  const now = Date.now()

  // Grace cache — a token we already rotated within the window returns the
  // result it produced, so propagation-lagged stragglers don't re-spend it.
  const cached = rotatedCache.get(refreshToken)
  if (cached && cached.expiresAt > now) return Promise.resolve(cached.result)

  // Coalesce concurrent refreshes of the same token onto one backend call.
  const existing = inflightByToken.get(refreshToken)
  if (existing) return existing

  const promise = refreshBackendAccessToken(refreshToken)
    .then((result) => {
      if (result) {
        const ts = Date.now()
        pruneRotatedCache(ts)
        rotatedCache.set(refreshToken, { result, expiresAt: ts + ROTATION_GRACE_MS })
      }
      return result
    })
    .finally(() => {
      inflightByToken.delete(refreshToken)
    })

  inflightByToken.set(refreshToken, promise)
  return promise
}

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
      const tokens = await refreshDeduped(refreshToken)
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
            const tokens = await refreshDeduped(storedRefresh)

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

            // Refresh failed — backend tokens are dead. Clear ONLY the backend
            // cookies. Do NOT touch the dashboard session (jn_session): it is an
            // independent HMAC cookie governed by middleware, and wiping it here
            // logs the user out of the whole dashboard over a backend-only
            // failure. Return 401 with a distinct error; proxyError maps it to a
            // 502 so the client surfaces a feature error instead of a logout.
            cookieStore.set(BACKEND_ACCESS_COOKIE, "", CLEAR_COOKIE_OPTIONS)
            cookieStore.set(BACKEND_REFRESH_COOKIE, "", CLEAR_COOKIE_OPTIONS)
            return { data: null, error: "BACKEND_SESSION_EXPIRED", status: 401 }
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
  if (data && typeof data === "object") {
    if ("data" in data && Array.isArray((data as { data: unknown }).data)) {
      return (data as { data: T[] }).data
    }
    // Backend review endpoints wrap the array under `reviews`
    if ("reviews" in data && Array.isArray((data as { reviews: unknown }).reviews)) {
      return (data as { reviews: T[] }).reviews
    }
  }
  return []
}

/**
 * Extracts the `{ avg_rating, total_count }` aggregate from a backend
 * `/reviews/public` response. The aggregate is computed server-side over ALL
 * approved reviews (not just the returned page), so it is the source of truth
 * for the rating badge and JSON-LD `aggregateRating`. Returns null when absent.
 */
export function extractReviewAggregate(
  data: unknown
): { avg_rating: number | null; total_count: number } | null {
  if (data && typeof data === "object" && "aggregate" in data) {
    const agg = (data as { aggregate?: unknown }).aggregate
    if (agg && typeof agg === "object" && "total_count" in agg) {
      const a = agg as { avg_rating?: number | null; total_count?: unknown }
      if (typeof a.total_count === "number") {
        return { avg_rating: a.avg_rating ?? null, total_count: a.total_count }
      }
    }
  }
  return null
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
