"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error"

interface ToastItem {
  id: number
  variant: ToastVariant
  message: string
}

interface ToastContextValue {
  showToast: (variant: ToastVariant, message: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = ++counter.current
      setToasts((prev) => [...prev, { id, variant, message }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — fixed top-center */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 pointer-events-none items-center"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Single toast card ────────────────────────────────────────────────────────

const STYLES: Record<ToastVariant, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-green-50",
    border: "border border-green-700",
    text: "text-green-900",
    icon: <CheckCircle2 size={18} className="text-green-700 shrink-0" aria-hidden="true" />,
  },
  error: {
    bg: "bg-red-100",
    border: "border border-red-700",
    text: "text-red-900",
    icon: <XCircle size={18} className="text-red-700 shrink-0" aria-hidden="true" />,
  },
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const s = STYLES[toast.variant]
  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[260px] max-w-sm animate-toast-in ${s.bg} ${s.border}`}
    >
      {s.icon}
      <p className={`text-sm font-medium flex-1 leading-snug ${s.text}`}>{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
        className={`p-0.5 rounded-md hover:bg-black/10 transition-colors ${s.text}`}
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx.showToast
}
