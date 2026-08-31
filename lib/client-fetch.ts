"use client"

import { startLoading } from "./global-loading"

export interface GuardedFetchOptions {
  /** Skip the global loading overlay (polling / background refreshes). */
  silent?: boolean
  /** Label shown inside the overlay while this request is in flight. */
  message?: string
}

/**
 * Drop-in replacement for fetch() in dashboard Client Components.
 * Drives the global loading overlay (see `lib/global-loading.ts`) so feedback
 * is full-screen instead of living inside each button.
 * On 401, attempts session cleanup and redirects to login.
 * Only use in authenticated dashboard context — never for public web fetches.
 */
export async function guardedFetch(
  url: string | URL | Request,
  init?: RequestInit,
  options?: GuardedFetchOptions
): Promise<Response> {
  const stopLoading = options?.silent ? null : startLoading(options?.message)

  let res: Response
  try {
    res = await fetch(url, init)
  } finally {
    stopLoading?.()
  }

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
