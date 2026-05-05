"use client"
import { useEffect, useState } from "react"
import { Trash2, ChevronDown, X } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"

interface Appointment {
  id: string
  patientName: string
  patientPhone: string
  patientEmail: string | null
  treatmentName: string
  notes: string | null
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  scheduledAt: string | null
  createdAt: string
  treatment: { id: string; name: string; category: string } | null
}

const STATUS_LABELS: Record<Appointment["status"], string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
}

const STATUS_COLORS: Record<Appointment["status"], string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-600",
  COMPLETED: "bg-green-50 text-green-700",
}

const FILTERS: Array<{ label: string; value: string }> = [
  { label: "Todas", value: "" },
  { label: "Pendientes", value: "PENDING" },
  { label: "Confirmadas", value: "CONFIRMED" },
  { label: "Completadas", value: "COMPLETED" },
  { label: "Canceladas", value: "CANCELLED" },
]

export default function CitasDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  async function load(status = filter) {
    setLoading(true)
    const url = status ? `/api/appointments?status=${status}` : "/api/appointments"
    const res = await fetch(url)
    if (res.ok) setAppointments(await res.json())
    else setError("No se pudo cargar las citas.")
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFilter(value: string) {
    setFilter(value)
    await load(value)
  }

  async function handleStatus(id: string, status: Appointment["status"]) {
    setUpdating(id)
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) await load()
    else setError("No se pudo actualizar el estado.")
    setUpdating(null)
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta cita?")) return
    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" })
    if (!res.ok) {
      setError("No se pudo eliminar la cita. Intenta de nuevo.")
      return
    }
    await load()
  }

  return (
    <>
      <PageHeader
        title="Citas"
        description="Gestiona las solicitudes de cita del consultorio."
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors"
            style={{
              backgroundColor: filter === f.value ? "#b5496a" : "white",
              color: filter === f.value ? "white" : "#6b7280",
              borderColor: filter === f.value ? "#b5496a" : "#e5e7eb",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No hay citas con este filtro.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{a.patientName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status]}`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500">
                    <span>📞 {a.patientPhone}</span>
                    {a.patientEmail && <span>✉️ {a.patientEmail}</span>}
                    <span>💉 {a.treatmentName}</span>
                    {a.scheduledAt && (
                      <span>📅 {new Date(a.scheduledAt).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    )}
                  </div>
                  {a.notes && <p className="text-xs text-gray-400 mt-2 italic">"{a.notes}"</p>}
                  <p className="text-xs text-gray-300 mt-1">Solicitada: {new Date(a.createdAt).toLocaleDateString("es-BO")}</p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {/* Status selector */}
                  <div className="relative">
                    <select
                      value={a.status}
                      disabled={updating === a.id}
                      onChange={e => handleStatus(a.id, e.target.value as Appointment["status"])}
                      className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white cursor-pointer focus:outline-none focus:border-purple-400 disabled:opacity-50"
                    >
                      {(Object.keys(STATUS_LABELS) as Appointment["status"][]).map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors self-end"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
