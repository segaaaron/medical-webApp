"use client"
import { guardedFetch } from "@/lib/client-fetch"
import { useEffect, useRef, useState } from "react"
import { Star, Check, X, Clock, Trash2, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { InviteManager } from "@/components/dashboard/InviteManager"

interface Review {
  id: string
  patient_name: string
  patient_lastname: string | null
  treatment: string | null
  body: string
  rating: number
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

const FILTERS: { label: string; value: string }[] = [
  { label: "Todas", value: "" },
  { label: "Pendientes", value: "pending" },
  { label: "Aprobadas", value: "approved" },
  { label: "Rechazadas", value: "rejected" },
]

const STATUS_CONFIG = {
  pending: { label: "Pendiente", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  approved: { label: "Aprobada", cls: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Rechazada", cls: "bg-red-50 text-red-600 border-red-200" },
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          fill={s <= rating ? "var(--vintage-gold)" : "none"}
          style={{ color: s <= rating ? "var(--vintage-gold)" : "#d1d5db" }}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function ResenasDashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("")
  const [actionId, setActionId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function load(status = filter) {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)
    setError("")
    const url = status ? `/api/reviews?status=${status}` : "/api/reviews"
    try {
      const res = await guardedFetch(url, { signal: ctrl.signal })
      if (res.ok) {
        const data = await res.json()
        setReviews(Array.isArray(data) ? data : data?.data ?? [])
      } else {
        setError("No se pudieron cargar las reseñas.")
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return
      setError("Error de conexión.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta reseña permanentemente?")) return
    setActionId(id)
    setError("")
    try {
      const res = await guardedFetch(`/api/reviews/${id}`, { method: "DELETE" })
      if (!res.ok) setError("No se pudo eliminar la reseña.")
      else setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch {
      setError("Error de conexión al eliminar.")
    } finally {
      setActionId(null)
    }
  }

  const pending = reviews.filter((r) => r.status === "pending").length

  return (
    <>
      <PageHeader
        title="Reseñas"
        description={
          pending > 0
            ? `${pending} reseña${pending > 1 ? "s" : ""} pendiente${pending > 1 ? "s" : ""} de revisión`
            : "Gestiona las reseñas de pacientes"
        }
      />

      <div className="flex flex-col gap-4">
        <InviteManager />

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => { setFilter(value); load(value) }}
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

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            <X size={14} />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 py-12 justify-center text-sm text-gray-400">
            <RefreshCw size={15} className="animate-spin" />
            Cargando reseñas...
          </div>
        )}

        {/* Empty */}
        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Star size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay reseñas{filter ? " con este filtro" : ""}.</p>
          </div>
        )}

        {/* List */}
        {!loading && reviews.length > 0 && (
          <div className="flex flex-col gap-3">
            {reviews.map((review) => {
              const cfg = STATUS_CONFIG[review.status]
              const busy = actionId === review.id
              return (
                <div
                  key={review.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-gray-800">
                          {review.patient_name}{review.patient_lastname ? ` ${review.patient_lastname}` : ""}
                        </span>
                        <StarDisplay rating={review.rating} />
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                        {review.treatment && (
                          <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                            {review.treatment}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {review.status !== "approved" && (
                        <button
                          onClick={() => handleStatus(review.id, "approved")}
                          disabled={busy}
                          title="Aprobar"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50"
                        >
                          <Check size={13} />
                          Aprobar
                        </button>
                      )}
                      {review.status !== "rejected" && (
                        <button
                          onClick={() => handleStatus(review.id, "rejected")}
                          disabled={busy}
                          title="Rechazar"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                        >
                          <X size={13} />
                          Rechazar
                        </button>
                      )}
                      {review.status === "approved" && (
                        <button
                          onClick={() => handleStatus(review.id, "pending")}
                          disabled={busy}
                          title="Mover a pendiente"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 transition-colors disabled:opacity-50"
                        >
                          <Clock size={13} />
                          Pendiente
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={busy}
                        aria-label={`Eliminar reseña de ${review.patient_name}`}
                        className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <p className="text-sm text-gray-600 leading-relaxed border-l-2 pl-3" style={{ borderColor: "var(--vintage-gold)" }}>
                    {review.body}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
