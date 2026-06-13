"use client"

import { guardedFetch } from "@/lib/client-fetch"
import { useEffect, useRef, useState } from "react"
import {
  UserPlus,
  Copy,
  CheckCheck,
  RefreshCw,
  X,
  Clock,
  Ban,
  MessageCircle,
  Link2,
} from "lucide-react"

const INPUT_CLS =
  "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 outline-none transition-colors focus:border-[var(--vintage-gold)]"

interface Invite {
  id: string
  token: string | null
  patient_name: string
  patient_lastname: string
  email: string | null
  phone: string | null
  status: "pending" | "used" | "expired" | "revoked"
  created_at: string
  expires_at: string
  used_at: string | null
  review_id: string | null
}

interface CreatedInvite {
  id: string
  token: string
  patient_name: string
  patient_lastname: string
  status: string
  expires_at: string
}

const FILTERS: { label: string; value: string }[] = [
  { label: "Todas", value: "" },
  { label: "Pendientes", value: "pending" },
  { label: "Usadas", value: "used" },
  { label: "Expiradas", value: "expired" },
  { label: "Revocadas", value: "revoked" },
]

const STATUS_CONFIG: Record<Invite["status"], { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  used: { label: "Usada", cls: "bg-green-50 text-green-700 border-green-200" },
  expired: { label: "Expirada", cls: "bg-gray-100 text-gray-500 border-gray-200" },
  revoked: { label: "Revocada", cls: "bg-red-50 text-red-600 border-red-200" },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function expiryCountdown(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return "expirado"
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24))
  if (days === 1) return "expira mañana"
  return `expira en ${days} días`
}

function inviteUrl(token: string) {
  if (typeof window === "undefined") return `/resenas/r/${token}`
  return `${window.location.origin}/resenas/r/${token}`
}

const WHATSAPP_MSG =
  "¡Hola! La Dra. Yasmin Medrano te invita a compartir tu experiencia. Deja tu reseña aquí:"

export function InviteManager() {
  // ── Create form ──────────────────────────────────────────────────────────
  const [name, setName] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [created, setCreated] = useState<CreatedInvite | null>(null)
  const [copiedNew, setCopiedNew] = useState(false)

  // ── List ─────────────────────────────────────────────────────────────────
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState("")
  const [filter, setFilter] = useState("")
  const [actionId, setActionId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function load(status = filter) {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)
    setListError("")
    const url = status ? `/api/reviews/invites?status=${status}` : "/api/reviews/invites"
    try {
      const res = await guardedFetch(url, { signal: ctrl.signal })
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : data?.invites ?? data?.data ?? []
        setInvites(list)
      } else {
        setListError("No se pudieron cargar las invitaciones.")
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return
      setListError("Error de conexión.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")
    if (name.trim().length < 2) {
      setCreateError("Ingresa un nombre válido.")
      return
    }
    if (lastname.trim().length < 2) {
      setCreateError("Ingresa un apellido válido.")
      return
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setCreateError("Correo electrónico inválido.")
      return
    }
    setCreating(true)
    try {
      const res = await guardedFetch("/api/reviews/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: name.trim(),
          patient_lastname: lastname.trim(),
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setCreateError(data?.error ?? "No se pudo crear la invitación.")
        return
      }
      const data: CreatedInvite = await res.json()
      setCreated(data)
      setName("")
      setLastname("")
      setEmail("")
      setPhone("")
      // Reset al filtro "Todas" para que la nueva invitación pending sea visible
      // aunque el filtro activo fuese used/expired/revoked.
      setFilter("")
      await load("")
    } catch {
      setCreateError("Error de conexión al crear la invitación.")
    } finally {
      setCreating(false)
    }
  }

  async function copyToClipboard(text: string, onDone: () => void) {
    try {
      await navigator.clipboard.writeText(text)
      onDone()
    } catch {
      // best-effort
    }
  }

  function handleCopyNew() {
    if (!created) return
    copyToClipboard(inviteUrl(created.token), () => {
      setCopiedNew(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedNew(false), 2500)
    })
  }

  function handleCopyRow(invite: Invite) {
    if (!invite.token) return
    const id = invite.id
    copyToClipboard(inviteUrl(invite.token), () => {
      setCopiedId(id)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedId(null), 2500)
    })
  }

  async function handleRevoke(id: string) {
    if (!confirm("¿Revocar esta invitación? El link dejará de funcionar.")) return
    setActionId(id)
    setListError("")
    try {
      const res = await guardedFetch(`/api/reviews/invites/${id}`, { method: "DELETE" })
      if (!res.ok) {
        setListError("No se pudo revocar la invitación.")
      } else {
        await load()
      }
    } catch {
      setListError("Error de conexión al revocar.")
    } finally {
      setActionId(null)
    }
  }

  const newUrl = created ? inviteUrl(created.token) : ""
  const waHref = created
    ? `https://wa.me/?text=${encodeURIComponent(`${WHATSAPP_MSG} ${newUrl}`)}`
    : "#"

  return (
    <div className="flex flex-col gap-4">
      {/* ── Create card ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus size={15} style={{ color: "var(--vintage-gold)" }} />
          <span className="text-sm font-semibold text-gray-700">Crear invitación</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Genera un link único para que un paciente deje su reseña.
        </p>

        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="inv-name" className="block text-xs font-medium text-gray-500 mb-1">
                Nombre <span style={{ color: "var(--vintage-gold)" }}>*</span>
              </label>
              <input
                id="inv-name"
                type="text"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="María José"
                autoComplete="off"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label htmlFor="inv-lastname" className="block text-xs font-medium text-gray-500 mb-1">
                Apellido <span style={{ color: "var(--vintage-gold)" }}>*</span>
              </label>
              <input
                id="inv-lastname"
                type="text"
                value={lastname}
                maxLength={100}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Rivera"
                autoComplete="off"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label htmlFor="inv-email" className="block text-xs font-medium text-gray-500 mb-1">
                Email
              </label>
              <input
                id="inv-email"
                type="email"
                value={email}
                maxLength={150}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="paciente@email.com"
                autoComplete="off"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label htmlFor="inv-phone" className="block text-xs font-medium text-gray-500 mb-1">
                Teléfono
              </label>
              <input
                id="inv-phone"
                type="tel"
                value={phone}
                maxLength={20}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+591 70000000"
                autoComplete="off"
                className={INPUT_CLS}
              />
            </div>
          </div>

          {createError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
              <X size={13} />
              {createError}
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="self-start flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "var(--vintage-gold)" }}
          >
            {creating ? <RefreshCw size={14} className="animate-spin" /> : <Link2 size={14} />}
            {creating ? "Creando..." : "Crear link"}
          </button>
        </form>

        {/* Created result */}
        {created && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">
              Link para <span className="font-semibold text-gray-700">{created.patient_name} {created.patient_lastname}</span>:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={newUrl}
                aria-label="Enlace de invitación generado"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-600 outline-none select-all"
                onFocus={(e) => e.target.select()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopyNew}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: copiedNew ? "#dcfce7" : "var(--vintage-gold)",
                    color: copiedNew ? "#16a34a" : "white",
                  }}
                >
                  {copiedNew ? <CheckCheck size={14} /> : <Copy size={14} />}
                  {copiedNew ? "Copiado" : "Copiar"}
                </button>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Invites list ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => {
              setFilter(value)
              load(value)
            }}
            aria-pressed={filter === value}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
            style={{
              backgroundColor: filter === value ? "var(--vintage-gold)" : "transparent",
              color: filter === value ? "white" : "#6b7280",
              borderColor: filter === value ? "var(--vintage-gold)" : "#e5e7eb",
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => load()}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-600 transition-colors border border-transparent hover:border-gray-200"
          title="Recargar"
        >
          <RefreshCw size={13} />
          Recargar
        </button>
      </div>

      {listError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          <X size={14} />
          {listError}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-10 justify-center text-sm text-gray-400">
          <RefreshCw size={15} className="animate-spin" />
          Cargando invitaciones...
        </div>
      )}

      {!loading && !listError && invites.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Link2 size={28} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay invitaciones{filter ? " con este filtro" : ""}.</p>
        </div>
      )}

      {!loading && invites.length > 0 && (
        <div className="flex flex-col gap-2">
          {invites.map((invite) => {
            const cfg = STATUS_CONFIG[invite.status]
            const busy = actionId === invite.id
            const isPending = invite.status === "pending"
            return (
              <div
                key={invite.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-3 flex-wrap shadow-sm"
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-800">
                      {invite.patient_name} {invite.patient_lastname}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatDate(invite.created_at)}
                    </span>
                    {isPending && (
                      <span style={{ color: "var(--vintage-gold)" }}>
                        {expiryCountdown(invite.expires_at)}
                      </span>
                    )}
                    {invite.email && (
                      <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                        {invite.email}
                      </span>
                    )}
                    {invite.phone && (
                      <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                        {invite.phone}
                      </span>
                    )}
                  </div>
                </div>

                {isPending && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {invite.token && (
                      <button
                        onClick={() => handleCopyRow(invite)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                        style={{
                          backgroundColor: copiedId === invite.id ? "#dcfce7" : "#f9fafb",
                          color: copiedId === invite.id ? "#16a34a" : "#6b7280",
                          borderColor: copiedId === invite.id ? "#86efac" : "#e5e7eb",
                        }}
                        title="Copiar link"
                      >
                        {copiedId === invite.id ? <CheckCheck size={13} /> : <Copy size={13} />}
                        {copiedId === invite.id ? "Copiado" : "Copiar link"}
                      </button>
                    )}
                    <button
                      onClick={() => handleRevoke(invite.id)}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                      title="Revocar invitación"
                    >
                      <Ban size={13} />
                      Revocar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
