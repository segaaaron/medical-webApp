"use client"

/**
 * Estado de la sesión del panel en el cliente.
 *
 * Store de módulo (como `lib/global-loading.ts`) para que código sin hooks
 * —`guardedFetch`, el pre-flight de los formularios— pueda marcar la sesión
 * como expirada, y `SessionKeeper` pinte el aviso. Nunca se redirige solo al
 * login: la persona decide cuándo ir, con su trabajo todavía en pantalla.
 */

export interface SessionSnapshot {
  /** Ms epoch; null hasta la primera consulta. */
  readonly idleExpiresAt: number | null
  readonly absoluteExpiresAt: number | null
  readonly expired: boolean
}

type Listener = () => void

const listeners = new Set<Listener>()
const INITIAL: SessionSnapshot = { idleExpiresAt: null, absoluteExpiresAt: null, expired: false }
let snapshot: SessionSnapshot = INITIAL
/** Tras un logout manual: ni renovar (re-crearía la cookie) ni avisar «expiró». */
let ended = false
let inflight: Promise<boolean> = Promise.resolve(true)

function set(next: Partial<SessionSnapshot>): void {
  snapshot = { ...snapshot, ...next }
  for (const listener of listeners) listener()
}

export function markSessionExpired(): void {
  if (!snapshot.expired) set({ expired: true })
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSessionSnapshot(): SessionSnapshot {
  return snapshot
}

export function getServerSessionSnapshot(): SessionSnapshot {
  return INITIAL
}

/**
 * Consulta (GET) o renueva (POST) la sesión en `/api/auth/session`.
 * Devuelve false solo si el servidor confirma que expiró (401); un fallo de
 * red devuelve true para no bloquear: la petición real informará del error.
 */
function sync(method: "GET" | "POST"): Promise<boolean> {
  if (ended) return Promise.resolve(true)
  inflight = request(method)
  return inflight
}

async function request(method: "GET" | "POST"): Promise<boolean> {
  let res: Response
  try {
    res = await fetch("/api/auth/session", { method, cache: "no-store" })
  } catch {
    return true
  }
  if (ended) return true
  if (res.status === 401) {
    markSessionExpired()
    return false
  }
  if (!res.ok) return true
  try {
    const data: { idleExpiresAt: number; absoluteExpiresAt: number; now: number } = await res.json()
    // Los plazos vienen en hora del servidor: se pasan al reloj de este equipo
    // (si va adelantado/atrasado, el aviso saldría a destiempo).
    const skew = Number.isFinite(data.now) ? Date.now() - data.now : 0
    set({
      idleExpiresAt: data.idleExpiresAt + skew,
      absoluteExpiresAt: data.absoluteExpiresAt + skew,
      expired: false,
    })
  } catch {
    // respuesta inesperada: se conserva el estado anterior
  }
  return true
}

export const checkSession = () => sync("GET")
export const renewSession = () => sync("POST")

/**
 * Pre-flight antes de acciones largas (guardar un artículo, subir imágenes):
 * renueva la ventana de inactividad y, si la sesión ya expiró, abre el aviso
 * AL INSTANTE en vez de subir durante minutos para recibir un 401 al final.
 */
export const ensureSession = renewSession

/**
 * Logout manual: corta las renovaciones y espera la que esté en vuelo, para que
 * su respuesta no vuelva a poner la cookie después del DELETE.
 */
export async function endSession(): Promise<void> {
  ended = true
  await inflight
}
