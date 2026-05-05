/**
 * Manages the backend JWT tokens (accessToken + refreshToken) stored as httpOnly cookies.
 * These are separate from the dashboard session cookie (jn_session).
 */

export const BACKEND_ACCESS_COOKIE = "jn_access"
export const BACKEND_REFRESH_COOKIE = "jn_refresh"

const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://service.drayasminmedrano-services.cloud"

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 15 * 60, // 15 minutos (igual que el backend)
}

export const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 7 * 24 * 60 * 60, // 7 días (igual que el backend)
}

export const CLEAR_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 0,
}

/**
 * Calls the backend to refresh the access token using the refresh token.
 * Backend now rotates the refresh token — returns both tokens or null on failure.
 */
export async function refreshBackendAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const { accessToken, refreshToken: newRefreshToken } = await res.json()
    if (!accessToken) return null
    return { accessToken, refreshToken: newRefreshToken ?? refreshToken }
  } catch {
    return null
  }
}

/**
 * Calls the backend to invalidate the refresh token (logout).
 */
export async function revokeBackendRefreshToken(
  refreshToken: string
): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    // Best-effort — si falla no bloqueamos el logout del dashboard
  }
}
