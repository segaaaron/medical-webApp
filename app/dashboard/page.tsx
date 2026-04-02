"use client"
import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  Stethoscope,
  Newspaper,
  CalendarCheck,
  Users,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react"

interface Treatment {
  id: string
  name: string
  category: string
  price: number
  active: boolean
}

interface BlogPost {
  id: string
  title: string
  slug: string
  published: boolean
  publishedAt: string | null
  createdAt: string
}

interface Appointment {
  id: string
  patientName: string
  patientPhone: string
  treatmentName: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  scheduledAt: string | null
  createdAt: string
}

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface ServiceData<T> {
  items: T[]
  loading: boolean
  error: string | null
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "#fef3c7", text: "#92400e" },
  CONFIRMED: { bg: "#d1fae5", text: "#065f46" },
  CANCELLED: { bg: "#fee2e2", text: "#991b1b" },
  COMPLETED: { bg: "#dbeafe", text: "#1e40af" },
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function DashboardHomePage() {
  const [treatments, setTreatments] = useState<ServiceData<Treatment>>({
    items: [],
    loading: true,
    error: null,
  })
  const [blog, setBlog] = useState<ServiceData<BlogPost>>({
    items: [],
    loading: true,
    error: null,
  })
  const [appointments, setAppointments] = useState<ServiceData<Appointment>>({
    items: [],
    loading: true,
    error: null,
  })
  const [users, setUsers] = useState<ServiceData<User>>({
    items: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    fetchService<Treatment[]>("/api/treatments", setTreatments)
    fetchService<BlogPost[]>("/api/blog", setBlog)
    fetchService<Appointment[]>("/api/appointments", setAppointments)
    fetchService<User[]>("/api/users", setUsers)
  }, [])

  return (
    <>
      <PageHeader
        title="Panel de servicios"
        description="Resumen de los servicios conectados al backend."
      />

      <div className="flex flex-col gap-8">
        {/* Treatments */}
        <ServiceCard
          title="Tratamientos"
          icon={<Stethoscope size={18} />}
          href="/dashboard/tratamientos"
          count={treatments.items.length}
          loading={treatments.loading}
          error={treatments.error}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Nombre</th>
                <th className="pb-2 font-medium">Categoría</th>
                <th className="pb-2 font-medium text-right">Precio</th>
                <th className="pb-2 font-medium text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {treatments.items.slice(0, 5).map((t) => (
                <tr key={t.id} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-800 font-medium">{t.name}</td>
                  <td className="py-2.5 text-gray-500">{t.category}</td>
                  <td className="py-2.5 text-gray-800 text-right">${t.price.toLocaleString("es-MX")}</td>
                  <td className="py-2.5 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: t.active ? "#d1fae5" : "#fee2e2",
                        color: t.active ? "#065f46" : "#991b1b",
                      }}
                    >
                      {t.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ServiceCard>

        {/* Blog */}
        <ServiceCard
          title="Blog"
          icon={<Newspaper size={18} />}
          href="/dashboard/blog"
          count={blog.items.length}
          loading={blog.loading}
          error={blog.error}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Título</th>
                <th className="pb-2 font-medium text-center">Estado</th>
                <th className="pb-2 font-medium text-right">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {blog.items.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-800 font-medium">{p.title}</td>
                  <td className="py-2.5 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: p.published ? "#d1fae5" : "#fef3c7",
                        color: p.published ? "#065f46" : "#92400e",
                      }}
                    >
                      {p.published ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-500 text-right">
                    {formatDate(p.publishedAt ?? p.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ServiceCard>

        {/* Appointments */}
        <ServiceCard
          title="Citas"
          icon={<CalendarCheck size={18} />}
          href="/dashboard/citas"
          count={appointments.items.length}
          loading={appointments.loading}
          error={appointments.error}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Paciente</th>
                <th className="pb-2 font-medium">Tratamiento</th>
                <th className="pb-2 font-medium text-center">Estado</th>
                <th className="pb-2 font-medium text-right">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {appointments.items.slice(0, 5).map((a) => {
                const sc = STATUS_COLORS[a.status] ?? STATUS_COLORS.PENDING
                return (
                  <tr key={a.id} className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-800 font-medium">{a.patientName}</td>
                    <td className="py-2.5 text-gray-500">{a.treatmentName}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        {STATUS_LABELS[a.status] ?? a.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-500 text-right">
                      {formatDate(a.scheduledAt ?? a.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </ServiceCard>

        {/* Users */}
        <ServiceCard
          title="Usuarios"
          icon={<Users size={18} />}
          count={users.items.length}
          loading={users.loading}
          error={users.error}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Nombre</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium text-right">Registrado</th>
              </tr>
            </thead>
            <tbody>
              {users.items.map((u) => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-800 font-medium">{u.name}</td>
                  <td className="py-2.5 text-gray-500">{u.email}</td>
                  <td className="py-2.5 text-gray-500 text-right">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ServiceCard>
      </div>
    </>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchService<T>(
  url: string,
  setter: React.Dispatch<React.SetStateAction<ServiceData<T extends (infer U)[] ? U : never>>>
) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error("Error al obtener datos")
    const data: T = await res.json()
    setter({ items: data as never, loading: false, error: null })
  } catch {
    setter({ items: [], loading: false, error: "No se pudo conectar al servicio" })
  }
}

function ServiceCard({
  title,
  icon,
  href,
  count,
  loading,
  error,
  children,
}: {
  title: string
  icon: React.ReactNode
  href?: string
  count: number
  loading: boolean
  error: string | null
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#ede9fe", color: "#673de6" }}
          >
            {icon}
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {!loading && !error && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {href && (
          <a
            href={href}
            className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: "#673de6" }}
          >
            Ver todo <ArrowRight size={12} />
          </a>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Cargando...
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 py-4 text-sm text-amber-700 bg-amber-50 rounded-lg px-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {!loading && !error && count === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">Sin registros</p>
        )}
        {!loading && !error && count > 0 && children}
      </div>
    </div>
  )
}
