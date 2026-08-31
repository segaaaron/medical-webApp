"use client"

/**
 * Global loading store for the admin dashboard.
 *
 * Module-level external store (React `useSyncExternalStore`) instead of a plain
 * Context state, so that non-React code — e.g. `guardedFetch` in
 * `lib/client-fetch.ts` — can start/stop the overlay without hooks.
 *
 * Tracks a COUNTER of in-flight operations (not a boolean) so concurrent
 * requests never turn the overlay off while another one is still running.
 */

export interface LoadingSnapshot {
  /** True while at least one operation is in flight. */
  readonly active: boolean
  /** Number of operations currently in flight. */
  readonly count: number
  /** Message of the most recently started operation that provided one. */
  readonly message: string | null
}

interface LoadingEntry {
  id: number
  message: string | null
}

type Listener = () => void

const listeners = new Set<Listener>()

let entries: LoadingEntry[] = []
let sequence = 0

const IDLE_SNAPSHOT: LoadingSnapshot = { active: false, count: 0, message: null }
let snapshot: LoadingSnapshot = IDLE_SNAPSHOT

function recompute(): void {
  if (entries.length === 0) {
    snapshot = IDLE_SNAPSHOT
  } else {
    let message: string | null = null
    for (let i = entries.length - 1; i >= 0; i--) {
      const candidate = entries[i].message
      if (candidate) {
        message = candidate
        break
      }
    }
    snapshot = { active: true, count: entries.length, message }
  }
  for (const listener of listeners) listener()
}

/**
 * Registers one in-flight operation and returns its `stop` function.
 * The returned function is idempotent — calling it twice is a no-op.
 */
export function startLoading(message?: string): () => void {
  const id = ++sequence
  entries.push({ id, message: message ?? null })
  recompute()

  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    entries = entries.filter((entry) => entry.id !== id)
    recompute()
  }
}

/** Emergency reset — clears every in-flight entry (e.g. on hard navigation). */
export function resetLoading(): void {
  if (entries.length === 0) return
  entries = []
  recompute()
}

export function subscribeLoading(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getLoadingSnapshot(): LoadingSnapshot {
  return snapshot
}

export function getServerLoadingSnapshot(): LoadingSnapshot {
  return IDLE_SNAPSHOT
}
