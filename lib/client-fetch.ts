"use client"

/**
 * Drop-in replacement for fetch() in dashboard Client Components.
 * On 401, attempts session cleanup and redirects to login.
 * Only use in authenticated dashboard context — never for public web fetches.
 */
export async function guardedFetch(
  url: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(url, init)

  if (res.status === 401) {
    try {
      await fetch("/api/auth", { method: "DELETE" })
    } catch {
      // best-effort logout
    }
    const from = encodeURIComponent(window.location.pathname)
    window.location.href = `/dashboard/login?from=${from}`
  }

  return res
}
