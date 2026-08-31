"use client"

import { guardedFetch } from "@/lib/client-fetch"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  UserPlus,
  Copy,
  CheckCheck,
  RefreshCw,
  X,
  Ban,
  MessageCircle,
  Link2,
  ChevronDown,
  Mail,
  Phone,
} from "lucide-react"
import { StatusPill, type StatusTone } from "./ui/StatusPill"
import { InitialsAvatar } from "./ui/InitialsAvatar"
import { StatTile } from "./ui/StatTile"
import { FilterTabs, type FilterOption } from "./ui/FilterTabs"
import { SearchField } from "./ui/SearchField"
import { EmptyState } from "./ui/EmptyState"
import { useConfirm } from "./ConfirmDialog"

const INPUT_CLS =
  "w-full h-11 px-3 text-sm rounded-xl border bg-white outline-none transition-colors focus:border-[var(--vintage-gold)]"

const INPUT_STYLE = { borderColor: "var(--prem-border)", color: "var(--prem-fg)" } as const

/** Rows rendered before the "ver más" cut — keeps the page scannable. */
const PAGE_SIZE = 8

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

const STATUS_CONFIG: Record<Invite["status"], { label: string; tone: StatusTone }> = {
  pending: { label: "Pendiente", tone: "pending" },
  used: { label: "Usada", tone: "success" },
  expired: { label: "Expirada", tone: "neutral" },
  revoked: { label: "Revocada", tone: "danger" },
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

function whatsappHref(url: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${WHATSAPP_MSG} ${url}`)}`
}

export function InviteManager() {
  // ── Create form ──────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false)
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
  const [query, setQuery] = useState("")
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [actionId, setActionId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const confirm = useConfirm()

  /**
   * Loads every invite once. Status filtering and search run client-side so the
   * segmented control can show live counts and respond without a round-trip.
   */
  async function load() {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)
    setListError("")
    try {
      const res = await guardedFetch("/api/reviews/invites", { signal: ctrl.signal })
      // A newer load() superseded this one — drop its result silently.
      if (abortRef.current !== ctrl) return
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : data?.invites ?? data?.data ?? []
        setInvites(list)
        setFormOpen((open) => open || list.length === 0)
      } else {
        setListError("No se pudieron cargar las invitaciones.")
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return
      setListError("Error de conexión.")
    } finally {
      // Only the current in-flight request may clear the spinner; a superseded
      // request must not toggle loading state owned by the newer one.
      if (abortRef.current === ctrl) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

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
      setQuery("")
      await load()
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
    const ok = await confirm({
      title: "¿Revocar invitación?",
      description: "El link dejará de funcionar y la paciente no podrá dejar su reseña con él.",
      confirmLabel: "Revocar invitación",
    })
    if (!ok) return
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

  const counts = useMemo(() => {
    const acc = { pending: 0, used: 0, expired: 0, revoked: 0 }
    for (const i of invites) acc[i.status] += 1
    return acc
  }, [invites])

  const filters: FilterOption[] = [
    { label: "Todas", value: "", count: invites.length },
    { label: "Pendientes", value: "pending", count: counts.pending },
    { label: "Usadas", value: "used", count: counts.used },
    { label: "Expiradas", value: "expired", count: counts.expired },
    { label: "Revocadas", value: "revoked", count: counts.revoked },
  ]

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return invites.filter((i) => {
      if (filter && i.status !== filter) return false
      if (!q) return true
      return [i.patient_name, i.patient_lastname, i.email, i.phone]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    })
  }, [invites, filter, query])

  const conversion = invites.length ? Math.round((counts.used / invites.length) * 100) : 0
  const newUrl = created ? inviteUrl(created.token) : ""

  return (
    <section className="flex flex-col gap-4" aria-label="Invitaciones a reseñar">
      {/* ── Metrics ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <StatTile label="Pendientes" value={counts.pending} hint="links sin usar" accent={counts.pending > 0} />
        <StatTile label="Usadas" value={counts.used} hint="dejaron reseña" />
        <StatTile label="Conversión" value={`${conversion}%`} hint="usadas / enviadas" />
      </div>

      {/* ── Create panel (progressive disclosure) ────────────────────────── */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--prem-surface)", borderColor: "var(--prem-border)" }}
      >
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          aria-expanded={formOpen}
          aria-controls="invite-create-panel"
          className="w-full flex items-center gap-2.5 px-5 py-4 text-left transition-colors"
        >
          <UserPlus size={16} aria-hidden="true" style={{ color: "var(--vintage-gold)" }} />
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold" style={{ color: "var(--prem-fg)" }}>
              Nueva invitación
            </span>
            <span className="block text-xs mt-0.5" style={{ color: "var(--prem-muted)" }}>
              Genera un link único para que un paciente deje su reseña.
            </span>
          </span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className="transition-transform duration-200 flex-shrink-0"
            style={{ color: "var(--prem-muted)", transform: formOpen ? "rotate(180deg)" : "none" }}
          />
        </button>

        {formOpen && (
          <div id="invite-create-panel" className="px-5 pb-5 pt-1">
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="inv-name" className="block text-xs font-medium mb-1.5" style={{ color: "var(--prem-muted)" }}>
                    Nombre <span style={{ color: "var(--vintage-gold)" }}>*</span>
                  </label>
                  <input
                    id="inv-name"
                    type="text"
                    value={name}
                    maxLength={100}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="María José"
                    autoComplete="given-name"
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label htmlFor="inv-lastname" className="block text-xs font-medium mb-1.5" style={{ color: "var(--prem-muted)" }}>
                    Apellido <span style={{ color: "var(--vintage-gold)" }}>*</span>
                  </label>
                  <input
                    id="inv-lastname"
                    type="text"
                    value={lastname}
                    maxLength={100}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="Rivera"
                    autoComplete="family-name"
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label htmlFor="inv-email" className="block text-xs font-medium mb-1.5" style={{ color: "var(--prem-muted)" }}>
                    Email <span style={{ color: "var(--prem-muted)" }}>(opcional)</span>
                  </label>
                  <input
                    id="inv-email"
                    type="email"
                    inputMode="email"
                    value={email}
                    maxLength={150}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="paciente@email.com"
                    autoComplete="email"
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label htmlFor="inv-phone" className="block text-xs font-medium mb-1.5" style={{ color: "var(--prem-muted)" }}>
                    Teléfono <span style={{ color: "var(--prem-muted)" }}>(opcional)</span>
                  </label>
                  <input
                    id="inv-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    maxLength={20}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+591 70000000"
                    autoComplete="tel"
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                  />
                </div>
              </div>

              {createError && (
                <p role="alert" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "rgba(224,90,122,0.08)", color: "#b03f5c" }}>
                  <X size={13} aria-hidden="true" />
                  {createError}
                </p>
              )}

              <button
                type="submit"
                disabled={creating}
                className="self-start flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "var(--vintage-gold)" }}
              >
                {/* Loading feedback lives in the global overlay — the button only locks. */}
                <Link2 size={15} aria-hidden="true" />
                Generar link
              </button>
            </form>

            {/* Created result */}
            {created && (
              <div
                className="mt-4 pt-4 border-t"
                style={{ borderColor: "var(--prem-border)" }}
              >
                <p className="text-xs mb-2" style={{ color: "var(--prem-muted)" }}>
                  Link para{" "}
                  <span className="font-semibold" style={{ color: "var(--prem-fg)" }}>
                    {created.patient_name} {created.patient_lastname}
                  </span>
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    readOnly
                    value={newUrl}
                    aria-label="Enlace de invitación generado"
                    className="flex-1 h-11 px-3 text-sm rounded-xl border outline-none select-all"
                    style={{ backgroundColor: "var(--vintage-parchment)", borderColor: "var(--prem-border)", color: "var(--prem-muted)" }}
                    onFocus={(e) => e.target.select()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyNew}
                      className="flex items-center gap-1.5 h-11 px-4 rounded-xl text-sm font-semibold transition-colors"
                      style={{
                        backgroundColor: copiedNew ? "rgba(74,158,130,0.14)" : "var(--vintage-gold)",
                        color: copiedNew ? "#2f7563" : "white",
                      }}
                    >
                      {copiedNew ? <CheckCheck size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                      {copiedNew ? "Copiado" : "Copiar"}
                    </button>
                    <a
                      href={whatsappHref(newUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 h-11 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      <MessageCircle size={15} aria-hidden="true" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterTabs options={filters} value={filter} onChange={(v) => { setFilter(v); setLimit(PAGE_SIZE) }} ariaLabel="Filtrar invitaciones" />
        <SearchField id="invite-search" value={query} onChange={(v) => { setQuery(v); setLimit(PAGE_SIZE) }} placeholder="Buscar paciente…" />
        <button
          onClick={() => load()}
          aria-label="Recargar invitaciones"
          className="ml-auto flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-medium border transition-colors"
          style={{ color: "var(--prem-muted)", borderColor: "var(--prem-border)", backgroundColor: "var(--prem-surface)" }}
        >
          <RefreshCw size={13} aria-hidden="true" />
          Recargar
        </button>
      </div>

      {listError && (
        <p role="alert" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(224,90,122,0.08)", color: "#b03f5c" }}>
          <X size={14} aria-hidden="true" />
          {listError}
        </p>
      )}

      {loading && (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[68px] rounded-xl img-shimmer" />
          ))}
        </div>
      )}

      {!loading && !listError && visible.length === 0 && (
        <EmptyState
          icon={Link2}
          title={invites.length === 0 ? "Aún no hay invitaciones" : "Sin resultados"}
          hint={
            invites.length === 0
              ? "Genera un link y compártelo por WhatsApp para pedir la primera reseña."
              : "Prueba con otro filtro o cambia el término de búsqueda."
          }
        />
      )}

      {!loading && visible.length > 0 && (
        <>
          <ul className="flex flex-col gap-2">
            {visible.slice(0, limit).map((invite) => {
              const cfg = STATUS_CONFIG[invite.status]
              const busy = actionId === invite.id
              const isPending = invite.status === "pending"
              const fullName = `${invite.patient_name} ${invite.patient_lastname}`.trim()
              return (
                <li
                  key={invite.id}
                  className="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
                  style={{ backgroundColor: "var(--prem-surface)", borderColor: "var(--prem-border)" }}
                >
                  <InitialsAvatar name={invite.patient_name} lastname={invite.patient_lastname} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold truncate" style={{ color: "var(--prem-fg)" }}>
                        {fullName}
                      </span>
                      <StatusPill tone={cfg.tone} label={cfg.label} />
                    </div>
                    <div className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-1 text-xs" style={{ color: "var(--prem-muted)" }}>
                      <span className="tabular-nums">{formatDate(invite.created_at)}</span>
                      {isPending && (
                        <span style={{ color: "var(--vintage-gold-dark)" }}>{expiryCountdown(invite.expires_at)}</span>
                      )}
                      {invite.email && (
                        <span className="inline-flex items-center gap-1 truncate max-w-[220px]">
                          <Mail size={11} aria-hidden="true" />
                          {invite.email}
                        </span>
                      )}
                      {invite.phone && (
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Phone size={11} aria-hidden="true" />
                          {invite.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {isPending && invite.token && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <a
                        href={whatsappHref(inviteUrl(invite.token))}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Enviar link por WhatsApp a ${fullName}`}
                        title="Enviar por WhatsApp"
                        className="dash-iconbtn grid place-items-center w-11 h-11 sm:w-9 sm:h-9 rounded-lg border"
                        style={{ color: "#1fa855", borderColor: "var(--prem-border)" }}
                      >
                        <MessageCircle size={15} aria-hidden="true" />
                      </a>
                      <button
                        onClick={() => handleCopyRow(invite)}
                        aria-label={`Copiar link de ${fullName}`}
                        title={copiedId === invite.id ? "Copiado" : "Copiar link"}
                        className="dash-iconbtn grid place-items-center w-11 h-11 sm:w-9 sm:h-9 rounded-lg border"
                        style={{
                          color: copiedId === invite.id ? "#2f7563" : "var(--prem-muted)",
                          borderColor: copiedId === invite.id ? "rgba(74,158,130,0.32)" : "var(--prem-border)",
                        }}
                      >
                        {copiedId === invite.id ? <CheckCheck size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                      </button>
                      <button
                        onClick={() => handleRevoke(invite.id)}
                        disabled={busy}
                        aria-label={`Revocar invitación de ${fullName}`}
                        title="Revocar invitación"
                        className="dash-iconbtn grid place-items-center w-11 h-11 sm:w-9 sm:h-9 rounded-lg border disabled:opacity-50"
                        style={{ color: "#b03f5c", borderColor: "var(--prem-border)" }}
                      >
                        <Ban size={15} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {visible.length > limit && (
            <button
              onClick={() => setLimit((n) => n + PAGE_SIZE)}
              className="self-center flex items-center gap-1.5 h-10 px-5 rounded-xl text-sm font-medium border transition-colors"
              style={{ color: "var(--prem-muted)", borderColor: "var(--prem-border)", backgroundColor: "var(--prem-surface)" }}
            >
              Ver {Math.min(PAGE_SIZE, visible.length - limit)} más
              <ChevronDown size={15} aria-hidden="true" />
            </button>
          )}
        </>
      )}
    </section>
  )
}
