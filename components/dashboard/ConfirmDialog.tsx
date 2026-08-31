"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"
import { AlertTriangle, LogOut, Trash2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export type ConfirmTone = "danger" | "neutral"

export interface ConfirmOptions {
  title: string
  description: string
  /** Texto del botón que ejecuta la acción. */
  confirmLabel: string
  cancelLabel?: string
  tone?: ConfirmTone
  icon?: LucideIcon
}

const TONES: Record<ConfirmTone, { media: string; icon: string; button: string; hover: string }> = {
  danger: {
    media: "rgba(224,90,122,0.12)",
    icon: "#b03f5c",
    button: "#b03f5c",
    hover: "#94304a",
  },
  neutral: {
    media: "rgba(184,151,59,0.14)",
    icon: "var(--vintage-gold-dark)",
    button: "var(--vintage-gold)",
    hover: "var(--vintage-gold-dark)",
  },
}

type Resolver = (confirmed: boolean) => void

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null)

/**
 * Confirmación del panel, en un solo sitio.
 *
 * Antes convivían tres formas de preguntar lo mismo: `window.confirm()` del
 * navegador (feo, ajeno a la marca y sin traducir el botón), y dos diálogos
 * calcados uno del otro para blog y tratamientos. Ahora se pide por promesa:
 *
 * ```tsx
 * const confirm = useConfirm()
 * if (!(await confirm({ title: "…", description: "…", confirmLabel: "Eliminar" }))) return
 * ```
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<Resolver | null>(null)

  const confirm = useCallback((next: ConfirmOptions) => {
    setOptions(next)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  function close(confirmed: boolean) {
    resolverRef.current?.(confirmed)
    resolverRef.current = null
    setOptions(null)
  }

  const tone = TONES[options?.tone ?? "danger"]
  const Icon = options?.icon ?? (options?.tone === "neutral" ? AlertTriangle : Trash2)

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AlertDialog
        open={options !== null}
        onOpenChange={(open) => {
          // Cerrar con Esc, clic fuera o el botón cancelar cuenta como "no".
          if (!open) close(false)
        }}
      >
        {options && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia style={{ backgroundColor: tone.media }}>
                <Icon className="size-5" style={{ color: tone.icon }} aria-hidden="true" />
              </AlertDialogMedia>
              <AlertDialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                {options.title}
              </AlertDialogTitle>
              <AlertDialogDescription>{options.description}</AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>{options.cancelLabel ?? "Cancelar"}</AlertDialogCancel>
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className="dash-btn dash-confirm-btn"
                style={{ backgroundColor: tone.button, color: "#fff" }}
                data-hover={tone.hover}
              >
                {options.confirmLabel}
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

/** Pide confirmación y resuelve a `true` solo si la persona acepta. */
export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>")
  return confirm
}

/** Opciones listas para el cierre de sesión, usadas desde el sidebar. */
export const LOGOUT_CONFIRM: ConfirmOptions = {
  title: "¿Cerrar sesión?",
  description: "Se cerrará tu sesión en este dispositivo. Los cambios que no hayas guardado se perderán.",
  confirmLabel: "Cerrar sesión",
  cancelLabel: "Seguir en el panel",
  tone: "neutral",
  icon: LogOut,
}
