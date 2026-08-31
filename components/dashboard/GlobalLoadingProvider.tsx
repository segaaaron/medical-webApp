"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import {
  getLoadingSnapshot,
  getServerLoadingSnapshot,
  startLoading,
  subscribeLoading,
  type LoadingSnapshot,
} from "@/lib/global-loading"
import { GlobalLoadingOverlay } from "./GlobalLoadingOverlay"

/** Wait before showing — avoids a flash on fast requests. */
const SHOW_DELAY_MS = 250
/** Once shown, stay visible at least this long — avoids flicker. */
const MIN_VISIBLE_MS = 400

interface GlobalLoadingActions {
  /** Registers an in-flight operation. Returns its (idempotent) stop function. */
  start: (message?: string) => () => void
  /** Wraps an async operation so the overlay is always released, even on throw. */
  withLoading: <T>(operation: () => Promise<T>, message?: string) => Promise<T>
}

export interface GlobalLoadingValue extends GlobalLoadingActions {
  isLoading: boolean
  pending: number
  message: string | null
}

const withLoading = async <T,>(operation: () => Promise<T>, message?: string): Promise<T> => {
  const stop = startLoading(message)
  try {
    return await operation()
  } finally {
    stop()
  }
}

const DEFAULT_ACTIONS: GlobalLoadingActions = { start: startLoading, withLoading }

const GlobalLoadingContext = createContext<GlobalLoadingActions>(DEFAULT_ACTIONS)

/** Subscribes a component to the in-flight counter. */
export function useLoadingSnapshot(): LoadingSnapshot {
  return useSyncExternalStore(subscribeLoading, getLoadingSnapshot, getServerLoadingSnapshot)
}

/**
 * Mounts the shared loading state + the full-screen overlay.
 * Intended for the authenticated dashboard only (see `DashboardShell`).
 *
 * While the overlay covers the screen the page content is marked `inert`, so
 * keyboard users cannot tab into controls hidden behind it.
 */
export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const { active, message } = useLoadingSnapshot()
  const [visible, setVisible] = useState(false)
  const shownAtRef = useRef<number | null>(null)
  const value = useMemo<GlobalLoadingActions>(() => DEFAULT_ACTIONS, [])

  useEffect(() => {
    if (active) {
      if (visible) return
      const timer = window.setTimeout(() => {
        shownAtRef.current = Date.now()
        setVisible(true)
      }, SHOW_DELAY_MS)
      return () => window.clearTimeout(timer)
    }

    if (!visible) return
    const elapsed = Date.now() - (shownAtRef.current ?? 0)
    const timer = window.setTimeout(() => {
      shownAtRef.current = null
      setVisible(false)
    }, Math.max(0, MIN_VISIBLE_MS - elapsed))
    return () => window.clearTimeout(timer)
  }, [active, visible])

  // Lock body scroll while the overlay covers the screen.
  useEffect(() => {
    if (!visible) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [visible])

  return (
    <GlobalLoadingContext.Provider value={value}>
      <div inert={visible}>{children}</div>
      {visible && <GlobalLoadingOverlay message={message} />}
    </GlobalLoadingContext.Provider>
  )
}

/**
 * Reads the global loading state and exposes manual triggers for operations
 * that do not go through `guardedFetch` (Server Actions, uploads, etc.).
 *
 * ```tsx
 * const { withLoading } = useGlobalLoading()
 * await withLoading(() => saveSomething(), "Guardando…")
 * ```
 */
export function useGlobalLoading(): GlobalLoadingValue {
  const actions = useContext(GlobalLoadingContext)
  const snapshot = useLoadingSnapshot()

  const start = useCallback((message?: string) => actions.start(message), [actions])

  return {
    isLoading: snapshot.active,
    pending: snapshot.count,
    message: snapshot.message,
    start,
    withLoading: actions.withLoading,
  }
}
