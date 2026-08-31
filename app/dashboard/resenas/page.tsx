"use client"
import { guardedFetch } from "@/lib/client-fetch"
import { useEffect, useMemo, useRef, useState } from "react"
import { Star, Check, X, EyeOff, MessageSquareQuote, ChevronDown, Link2 } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { InviteManager } from "@/components/dashboard/InviteManager"
import { StatusPill, type StatusTone } from "@/components/dashboard/ui/StatusPill"
import { InitialsAvatar } from "@/components/dashboard/ui/InitialsAvatar"
import { StatTile } from "@/components/dashboard/ui/StatTile"
import { FilterTabs, type FilterOption } from "@/components/dashboard/ui/FilterTabs"
import { SearchField } from "@/components/dashboard/ui/SearchField"
import { EmptyState } from "@/components/dashboard/ui/EmptyState"
import { useConfirm } from "@/components/dashboard/ConfirmDialog"

interface Review {
  id: string
  patient_name: string
  patient_lastname: string | null
  treatment: string | null
  body: string
  rating: number
  status: "pending" | "approved" | "deleted"
  created_at: string
}

/** Rows rendered before the "ver más" cut — keeps the page scannable. */
const PAGE_SIZE = 6

const STATUS_CONFIG: Record<Review["status"], { label: string; tone: StatusTone }> = {
  pending: { label: "Pendiente", tone: "pending" },
  approved: { label: "Aprobada", tone: "success" },
  deleted: { label: "Oculta", tone: "danger" },
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 align-middle" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          aria-hidden="true"
          fill={s <= rating ? "var(--vintage-gold)" : "none"}
          style={{ color: s <= rating ? "var(--vintage-gold)" : "var(--prem-border)" }}
          strokeWidth={1.5}
        />
      ))}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

type Tab = "reviews" | "invites"

export default function ResenasDashboardPage() {
  const [tab, setTab] = useState<Tab>("reviews")
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("")
  const [query, setQuery] = useState("")
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [actionId, setActionId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const confirm = useConfirm()

  /**
   * Loads every review once so status filtering and search can run client-side
   * with live counts. Two requests: the unfiltered list omits rejected reviews
   * server-side (backend defaults to pending + approved), so `deleted` is
   * fetched explicitly and merged — otherwise the "Rechazadas" tab is empty.
   */
  async function load() {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)
    setError("")
    try {
      const [res, resDeleted] = await Promise.all([
        guardedFetch("/api/reviews", { signal: ctrl.signal }),
        guardedFetch("/api/reviews?status=deleted", { signal: ctrl.signal }),
      ])
      if (abortRef.current !== ctrl) return
      if (res.ok) {
        const toList = (data: unknown): Review[] =>
          Array.isArray(data) ? (data as Review[]) : ((data as { data?: Review[] })?.data ?? [])
        const active = toList(await res.json())
        const deleted = resDeleted.ok ? toList(await resDeleted.json()) : []
        const byId = new Map(active.map((r) => [r.id, r]))
        for (const r of deleted) byId.set(r.id, r)
        setReviews([...byId.values()])
      } else {
        setError("No se pudieron cargar las reseñas.")
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return
      setError("Error de conexión.")
    } finally {
      if (abortRef.current === ctrl) setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleStatus(id: string, status: Review["status"]) {
    setActionId(id)
    setError("")
    try {
      const res = await guardedFetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) setError("No se pudo actualizar la reseña.")
      else await load()
    } catch {
      setError("Error de conexión al actualizar.")
    } finally {
      setActionId(null)
    }
  }

  /**
   * Oculta una reseña (soft delete en el backend). El texto de confirmación
   * depende del estado de origen: rechazar algo que nunca se publicó no es lo
   * mismo que bajar de la web algo que los pacientes ya están viendo.
   */
  async function handleHide(id: string, from: "pending" | "approved", name: string) {
    const approved = from === "approved"
    const ok = await confirm({
      title: approved ? "¿Retirar de la web?" : "¿Rechazar reseña?",
      description: approved
        ? `La reseña de ${name} dejará de mostrarse en el sitio. Podrás verla después en el filtro "Ocultas".`
        : `La reseña de ${name} no se publicará. Podrás verla después en el filtro "Ocultas".`,
      confirmLabel: approved ? "Retirar de la web" : "Rechazar",
    })
    if (!ok) return
    setActionId(id)
    setError("")
    try {
      const res = await guardedFetch(`/api/reviews/${id}`, { method: "DELETE" })
      // Reload instead of dropping the row: rejection is a soft delete, so the
      // review must reappear under the "Rechazadas" filter.
      if (!res.ok) setError("No se pudo eliminar la reseña.")
      else await load()
    } catch {
      setError("Error de conexión al eliminar.")
    } finally {
      setActionId(null)
    }
  }

  const counts = useMemo(() => {
    const acc = { pending: 0, approved: 0, deleted: 0 }
    for (const r of reviews) acc[r.status] += 1
    return acc
  }, [reviews])

  const average = useMemo(() => {
    const rated = reviews.filter((r) => r.status === "approved")
    if (!rated.length) return "—"
    return (rated.reduce((sum, r) => sum + r.rating, 0) / rated.length).toFixed(1)
  }, [reviews])

  const filters: FilterOption[] = [
    { label: "Todas", value: "", count: reviews.length },
    { label: "Pendientes", value: "pending", count: counts.pending },
    { label: "Aprobadas", value: "approved", count: counts.approved },
    { label: "Ocultas", value: "deleted", count: counts.deleted },
  ]

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reviews.filter((r) => {
      if (filter && r.status !== filter) return false
      if (!q) return true
      return [r.patient_name, r.patient_lastname, r.treatment, r.body]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    })
  }, [reviews, filter, query])

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "reviews", label: "Reseñas", badge: counts.pending },
    { id: "invites", label: "Invitaciones" },
  ]

  return (
    <>
      <PageHeader
        title="Reseñas"
        description={
          counts.pending > 0
            ? `${counts.pending} reseña${counts.pending > 1 ? "s" : ""} pendiente${counts.pending > 1 ? "s" : ""} de revisión`
            : "Modera reseñas e invita a pacientes a dejar la suya"
        }
      />

      {/* ── Section switch: the two domains no longer stack on one scroll ── */}
      <div
        role="tablist"
        aria-label="Secciones de reseñas"
        className="flex gap-6 border-b mb-6"
        style={{ borderColor: "var(--prem-border)" }}
      >
        {tabs.map(({ id, label, badge }, index) => {
          const selected = tab === id
          return (
            <button
              key={id}
              role="tab"
              id={`tab-${id}`}
              aria-selected={selected}
              aria-controls={`panel-${id}`}
              // Roving tabindex + arrow keys: the WAI-ARIA tabs pattern the
              // tablist role promises to assistive tech.
              tabIndex={selected ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
                e.preventDefault()
                const next = tabs[(index + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]
                setTab(next.id)
                document.getElementById(`tab-${next.id}`)?.focus()
              }}
              onClick={() => setTab(id)}
              className="relative flex items-center gap-2 pb-3 text-sm font-semibold transition-colors"
              style={{ color: selected ? "var(--prem-fg)" : "var(--prem-muted)" }}
            >
              {label}
              {badge !== undefined && badge > 0 && (
                <span
                  className="tabular-nums text-[11px] px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(184,151,59,0.16)", color: "var(--vintage-gold-dark)" }}
                >
                  {badge}
                </span>
              )}
              {selected && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full"
                  style={{ backgroundColor: "var(--vintage-gold)" }}
                />
              )}
            </button>
          )
        })}
      </div>

      {tab === "invites" && (
        <div role="tabpanel" id="panel-invites" aria-labelledby="tab-invites">
          <InviteManager />
        </div>
      )}

      {tab === "reviews" && (
        <div role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews" className="flex flex-col gap-4">
          {/* Metrics */}
          <div className="flex flex-wrap gap-3">
            <StatTile label="Por revisar" value={counts.pending} hint="esperan tu decisión" accent={counts.pending > 0} />
            <StatTile label="Publicadas" value={counts.approved} hint="visibles en la web" />
            <StatTile label="Promedio" value={average} hint="de reseñas publicadas" />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <FilterTabs
              options={filters}
              value={filter}
              onChange={(v) => { setFilter(v); setLimit(PAGE_SIZE) }}
              ariaLabel="Filtrar reseñas"
            />
            <SearchField
              id="review-search"
              value={query}
              onChange={(v) => { setQuery(v); setLimit(PAGE_SIZE) }}
              placeholder="Buscar paciente o texto…"
            />
          </div>

          {error && (
            <p role="alert" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(224,90,122,0.08)", color: "#b03f5c" }}>
              <X size={14} aria-hidden="true" />
              {error}
            </p>
          )}

          {loading && (
            <div className="flex flex-col gap-3" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[132px] rounded-2xl img-shimmer" />
              ))}
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <EmptyState
              icon={MessageSquareQuote}
              title={reviews.length === 0 ? "Todavía no hay reseñas" : "Sin resultados"}
              hint={
                reviews.length === 0
                  ? "Envía una invitación a tus pacientes para recibir la primera."
                  : "Prueba con otro filtro o cambia el término de búsqueda."
              }
              action={
                reviews.length === 0 ? (
                  <button
                    onClick={() => setTab("invites")}
                    className="flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "var(--vintage-gold)" }}
                  >
                    <Link2 size={15} aria-hidden="true" />
                    Crear invitación
                  </button>
                ) : undefined
              }
            />
          )}

          {!loading && visible.length > 0 && (
            <>
              <ul className="flex flex-col gap-3">
                {visible.slice(0, limit).map((review) => {
                  const cfg = STATUS_CONFIG[review.status]
                  const busy = actionId === review.id
                  const fullName = `${review.patient_name}${review.patient_lastname ? ` ${review.patient_lastname}` : ""}`
                  return (
                    <li
                      key={review.id}
                      className="rounded-2xl border p-5"
                      style={{
                        backgroundColor: "var(--prem-surface)",
                        borderColor: review.status === "pending" ? "rgba(184,151,59,0.32)" : "var(--prem-border)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <InitialsAvatar name={review.patient_name} lastname={review.patient_lastname} size={40} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold truncate" style={{ color: "var(--prem-fg)" }}>
                              {fullName}
                            </span>
                            <StarDisplay rating={review.rating} />
                            <StatusPill tone={cfg.tone} label={cfg.label} />
                          </div>
                          <div className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-1 text-xs" style={{ color: "var(--prem-muted)" }}>
                            {review.treatment && (
                              <span className="prem-eyebrow prem-eyebrow--inline leading-none" style={{ color: "var(--vintage-gold-dark)" }}>
                                {review.treatment}
                              </span>
                            )}
                            <span className="tabular-nums">{formatDate(review.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <blockquote
                        className="mt-3 pl-4 text-sm leading-relaxed border-l-2"
                        style={{ borderColor: "var(--vintage-gold)", color: "var(--prem-fg)" }}
                      >
                        {review.body}
                      </blockquote>

                      {review.status !== "deleted" && (
                        <div
                          className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t"
                          style={{ borderColor: "var(--prem-border)" }}
                        >
                          {review.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleStatus(review.id, "approved")}
                                disabled={busy}
                                aria-label={`Publicar reseña de ${fullName}`}
                                className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                // #4a9e82 (--success) sobre blanco da 3.2:1, por
                                // debajo de AA. Mismo verde que el badge "Publicada".
                                style={{ backgroundColor: "#1f7a52" }}
                              >
                                <Check size={15} aria-hidden="true" />
                                Publicar reseña
                              </button>
                              <button
                                onClick={() => handleHide(review.id, "pending", fullName)}
                                disabled={busy}
                                aria-label={`Rechazar reseña de ${fullName}`}
                                className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors disabled:opacity-50"
                                style={{ color: "#b03f5c", borderColor: "rgba(224,90,122,0.30)" }}
                              >
                                <X size={15} aria-hidden="true" />
                                Rechazar
                              </button>
                            </>
                          ) : (
                            /* Ya publicada: moderarla de entrada no aplica. La única
                               acción legítima es retirarla de la web — misma operación
                               en el backend, pero nombrada por lo que hace aquí. */
                            <button
                              onClick={() => handleHide(review.id, "approved", fullName)}
                              disabled={busy}
                              aria-label={`Retirar de la web la reseña de ${fullName}`}
                              className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-medium border transition-colors disabled:opacity-50"
                              style={{ color: "var(--prem-muted)", borderColor: "var(--prem-border)" }}
                            >
                              <EyeOff size={15} aria-hidden="true" />
                              Retirar de la web
                            </button>
                          )}
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
        </div>
      )}
    </>
  )
}
