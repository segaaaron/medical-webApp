"use client"

import { startLoading } from "./global-loading"
import { checkSession } from "./session-state"

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
 * On 401, opens the "session expired" dialog (see `SessionKeeper`) and returns
 * the response untouched — never a silent logout/redirect: the page keeps its
 * unsaved state until the user chooses to log in again. Error toasts are
 * muted while that dialog is open, so callers need no special handling.
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

  // Confirms with /api/auth/session before showing the dialog (a 401 forwarded
  // from the backend is not a dashboard-session expiry); if expired, it opens.
  if (res.status === 401) await checkSession()

  return res
}
