"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { Clock, LogIn } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "./Toast"
import {
  checkSession,
  getServerSessionSnapshot,
  getSessionSnapshot,
  renewSession,
  subscribeSession,
} from "@/lib/session-state"

/** Renovar como mucho cada 5 min, y solo si hubo actividad desde el último ping. */
const RENEW_EVERY_MS = 5 * 60 * 1000
/** Aviso antes del cierre por inactividad (60 min). */
const IDLE_WARN_MS = 2 * 60 * 1000
/** Aviso antes del límite absoluto (8 h): más margen, porque no se puede extender. */
const ABSOLUTE_WARN_MS = 10 * 60 * 1000
/** Mínimo entre consultas al servidor cerca del vencimiento (otra pestaña pudo renovar). */
const RECHECK_MS = 30 * 1000

const ACTIVITY_EVENTS = ["keydown", "input", "pointerdown", "scroll"] as const

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function loginUrl(): string {
  const from = encodeURIComponent(window.location.pathname + window.location.search)
  return `/dashboard/login?from=${from}&reason=expired`
}

/**
 * Mantiene viva la sesión del panel mientras se trabaja y avisa ANTES de que
 * caduque. Escribir un artículo no hace peticiones, así que la actividad real
 * (teclado, clics, scroll) es la que renueva la sesión en segundo plano.
 *
 * Cuando la sesión expira (por tiempo o por un 401 de `guardedFetch`) muestra
 * un aviso con el botón para volver a entrar: nunca redirige solo, así la
 * página conserva lo que no se ha guardado.
 */
export function SessionKeeper() {
  const { idleExpiresAt, absoluteExpiresAt, expired } = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot
  )
  const showToast = useToast()
  const [now, setNow] = useState(() => Date.now())
  // Límite absoluto cuyo aviso ya se aceptó (uno nuevo tras re-login vuelve a avisar).
  const [acknowledgedAbsolute, setAcknowledgedAbsolute] = useState<number | null>(null)
  const [renewing, setRenewing] = useState(false)
  const lastPingRef = useRef(0)
  const lastCheckRef = useRef(0)
  const activeRef = useRef(false)
  const wasExpiredRef = useRef(false)

  useEffect(() => {
    // lastPingRef arranca en 0: la primera actividad tras cargar renueva ya.
    // Si arrancara en «ahora», al abrir con la ventana casi agotada (p. ej. 58 min
    // inactiva) la sesión caducaba mientras se trabajaba durante los 5 min de espera.
    void checkSession()

    function maybeRenew() {
      if (!activeRef.current || getSessionSnapshot().expired) return
      if (Date.now() - lastPingRef.current < RENEW_EVERY_MS) return
      lastPingRef.current = Date.now()
      activeRef.current = false
      void renewSession() // silenciosa: sin overlay de carga
    }

    function onActivity() {
      activeRef.current = true
      maybeRenew()
    }

    function onVisible() {
      if (document.visibilityState !== "visible") return
      activeRef.current = true
      // Al volver a la pestaña: quizá se inició sesión en otra, o se renovó allí.
      lastCheckRef.current = Date.now()
      void checkSession().then(maybeRenew)
    }

    function tick() {
      const t = Date.now()
      setNow(t)
      maybeRenew()
      const { idleExpiresAt: idle, absoluteExpiresAt: abs, expired: isExpired } = getSessionSnapshot()
      if (isExpired || idle === null || abs === null) return
      // Cerca del vencimiento, confirmar con el servidor antes de avisar/expirar:
      // otra pestaña pudo renovar la cookie compartida.
      const deadline = Math.min(idle, abs)
      const dueCheck = deadline - t <= IDLE_WARN_MS && t - lastCheckRef.current >= RECHECK_MS
      const justExpired = t >= deadline && lastCheckRef.current < deadline
      if (dueCheck || justExpired) {
        lastCheckRef.current = t
        void checkSession()
      }
    }

    const opts = { capture: true, passive: true } as const
    for (const e of ACTIVITY_EVENTS) window.addEventListener(e, onActivity, opts)
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", onVisible)
    const interval = window.setInterval(tick, 1000)
    return () => {
      for (const e of ACTIVITY_EVENTS) window.removeEventListener(e, onActivity, opts)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", onVisible)
      window.clearInterval(interval)
    }
  }, [])

  // Sesión restablecida (p. ej. tras iniciar sesión en otra pestaña).
  useEffect(() => {
    if (wasExpiredRef.current && !expired) {
      showToast("success", "Sesión restablecida. Ya puedes guardar tus cambios.")
    }
    wasExpiredRef.current = expired
  }, [expired, showToast])

  async function keepAlive() {
    setRenewing(true)
    lastPingRef.current = Date.now()
    await renewSession()
    setRenewing(false)
  }

  const idleLeft = idleExpiresAt === null ? Infinity : idleExpiresAt - now
  const absoluteLeft = absoluteExpiresAt === null ? Infinity : absoluteExpiresAt - now
  // Ventana ya topada por el límite absoluto: renovar no sirve, se avisa como absoluto.
  const idleCapped = idleExpiresAt !== null && absoluteExpiresAt !== null && idleExpiresAt >= absoluteExpiresAt

  const mode: "expired" | "idle" | "absolute" | null = expired
    ? "expired"
    : !idleCapped && idleLeft <= IDLE_WARN_MS
      ? "idle"
      : absoluteLeft <= ABSOLUTE_WARN_MS && acknowledgedAbsolute !== absoluteExpiresAt
        ? "absolute"
        : null

  return (
    <AlertDialog
      open={mode !== null}
      onOpenChange={(open) => {
        // Esc: en los avisos cuenta como la acción segura; el de expirada no se cierra.
        if (open) return
        if (mode === "idle") void keepAlive()
        if (mode === "absolute") setAcknowledgedAbsolute(absoluteExpiresAt)
      }}
    >
      {mode && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia style={{ backgroundColor: "rgba(184,151,59,0.14)" }}>
              {mode === "expired" ? (
                <LogIn className="size-5" style={{ color: "var(--vintage-gold-dark)" }} aria-hidden="true" />
              ) : (
                <Clock className="size-5" style={{ color: "var(--vintage-gold-dark)" }} aria-hidden="true" />
              )}
            </AlertDialogMedia>

            {mode === "expired" && (
              <>
                <AlertDialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                  Tu sesión expiró
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Lo que no hayas guardado sigue en esta página. Inicia sesión en otra pestaña
                  para no perderlo: al volver aquí, el aviso se cierra solo y podrás guardar. Si
                  vas al login en esta pestaña, se perderán los cambios sin guardar (del blog
                  se recupera el texto del artículo, no la imagen).
                </AlertDialogDescription>
              </>
            )}

            {mode === "idle" && (
              <>
                <AlertDialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                  Tu sesión está por expirar
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Por seguridad, la sesión se cierra tras 60 minutos sin actividad. Se cerrará en{" "}
                  <strong aria-live="off">{formatRemaining(idleLeft)}</strong>.
                </AlertDialogDescription>
              </>
            )}

            {mode === "absolute" && (
              <>
                <AlertDialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                  Tendrás que iniciar sesión de nuevo pronto
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Por seguridad, cada sesión dura como máximo 8 horas. En{" "}
                  <strong aria-live="off">{formatRemaining(absoluteLeft)}</strong> tendrás que volver
                  a entrar. Guarda tus cambios antes de que se acabe el tiempo. En el blog, el texto
                  del artículo también se guarda solo como borrador en este navegador.
                </AlertDialogDescription>
              </>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-wrap">
            {mode === "expired" && (
              <>
                <button
                  type="button"
                  className="dash-btn dash-btn--ghost"
                  onClick={() => window.location.assign(loginUrl())}
                >
                  Ir al login aquí
                </button>
                <button
                  type="button"
                  autoFocus
                  className="dash-btn dash-btn--primary"
                  onClick={() => window.open(loginUrl(), "_blank", "noopener")}
                >
                  Iniciar sesión en otra pestaña
                </button>
              </>
            )}

            {mode === "idle" && (
              <button
                type="button"
                autoFocus
                disabled={renewing}
                className="dash-btn dash-btn--primary"
                onClick={() => void keepAlive()}
              >
                {renewing ? "Renovando…" : "Seguir conectada"}
              </button>
            )}

            {mode === "absolute" && (
              <button
                type="button"
                autoFocus
                className="dash-btn dash-btn--primary"
                onClick={() => setAcknowledgedAbsolute(absoluteExpiresAt)}
              >
                Entendido
              </button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  )
}
