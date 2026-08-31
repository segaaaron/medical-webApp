"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Inbox, Phone, Stethoscope, MessageCircle, X } from "lucide-react"
import { guardedFetch } from "@/lib/client-fetch"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { InitialsAvatar } from "@/components/dashboard/ui/InitialsAvatar"
import { StatTile } from "@/components/dashboard/ui/StatTile"
import { SearchField } from "@/components/dashboard/ui/SearchField"
import { EmptyState } from "@/components/dashboard/ui/EmptyState"
import { DashboardPagination } from "@/components/dashboard/DashboardPagination"

interface Lead {
  id: string
  name: string
  phone: string | null
  treatment: string | null
  message: string | null
  preferredDate: string | null
  source: string
  createdAt: string
}

const PAGE_SIZE = 10

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" })
}

/** Días transcurridos, para saber de un vistazo qué contacto se está enfriando. */
function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

export default function ContactosDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const abortRef = useRef<AbortController | null>(null)

  async function load() {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)
    setError("")
    try {
      const res = await guardedFetch("/api/leads?limit=500", { signal: ctrl.signal })
      if (abortRef.current !== ctrl) return
      if (res.ok) {
        const data = await res.json()
        setLeads(Array.isArray(data?.leads) ? data.leads : [])
      } else {
        setError("No se pudieron cargar los contactos.")
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return
      setError("Error de conexión.")
    } finally {
      if (abortRef.current === ctrl) setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const thisWeek = useMemo(() => leads.filter((l) => daysAgo(l.createdAt) <= 7).length, [leads])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return leads
    return leads.filter((l) =>
      [l.name, l.phone, l.treatment, l.message]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    )
  }, [leads, query])

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const rows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <>
      <PageHeader
        title="Contactos"
        description={
          thisWeek > 0
            ? `${thisWeek} contacto${thisWeek > 1 ? "s" : ""} en los últimos 7 días`
            : "Formularios enviados desde la web"
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <StatTile label="Últimos 7 días" value={thisWeek} hint="contactos recientes" accent={thisWeek > 0} />
          <StatTile label="Total" value={leads.length} hint="formularios recibidos" />
        </div>

        <SearchField
          id="leads-search"
          value={query}
          onChange={(v) => {
            setQuery(v)
            setPage(1)
          }}
          placeholder="Buscar por nombre, teléfono o tratamiento…"
        />

        {error && (
          <p role="alert" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(224,90,122,0.08)", color: "#b03f5c" }}>
            <X size={14} aria-hidden="true" />
            {error}
          </p>
        )}

        {loading && (
          <div className="flex flex-col gap-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[82px] rounded-2xl img-shimmer" />
            ))}
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <EmptyState
            icon={Inbox}
            title={leads.length === 0 ? "Aún no hay contactos" : "Sin resultados"}
            hint={
              leads.length === 0
                ? "Cuando alguien envíe el formulario de la web, su contacto aparecerá aquí antes de pasar a WhatsApp."
                : "Prueba con otro término de búsqueda."
            }
          />
        )}

        {!loading && rows.length > 0 && (
          <>
            <ul className="flex flex-col gap-2">
              {rows.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-start gap-3 rounded-xl border px-4 py-3"
                  style={{ backgroundColor: "var(--prem-surface)", borderColor: "var(--prem-border)" }}
                >
                  <InitialsAvatar name={lead.name} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold truncate" style={{ color: "var(--prem-fg)" }}>
                        {lead.name}
                      </span>
                      <span className="text-xs tabular-nums" style={{ color: "var(--prem-muted)" }}>
                        {formatDate(lead.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-1 text-xs" style={{ color: "var(--prem-muted)" }}>
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dash-link-action inline-flex items-center gap-1 tabular-nums"
                        >
                          <MessageCircle size={11} aria-hidden="true" />
                          {lead.phone}
                        </a>
                      )}
                      {lead.treatment && (
                        <span className="inline-flex items-center gap-1">
                          <Stethoscope size={11} aria-hidden="true" />
                          {lead.treatment}
                        </span>
                      )}
                      {lead.preferredDate && (
                        <span className="tabular-nums" style={{ color: "var(--vintage-gold-dark)" }}>
                          Prefiere {lead.preferredDate}
                        </span>
                      )}
                      {lead.source !== "contact-form" && (
                        <span className="prem-eyebrow prem-eyebrow--inline">{lead.source}</span>
                      )}
                    </div>

                    {lead.message && (
                      <blockquote
                        className="mt-2 pl-3 text-sm leading-relaxed border-l-2"
                        style={{ borderColor: "var(--vintage-gold)", color: "var(--prem-fg)" }}
                      >
                        {lead.message}
                      </blockquote>
                    )}
                  </div>

                  {lead.phone && (
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Escribir por WhatsApp a ${lead.name}`}
                      title="Escribir por WhatsApp"
                      className="dash-iconbtn grid place-items-center w-11 h-11 sm:w-9 sm:h-9 rounded-lg border shrink-0"
                      style={{ color: "#1fa855", borderColor: "var(--prem-border)" }}
                    >
                      <Phone size={15} aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ul>

            <DashboardPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              label="Paginación de contactos"
            />
          </>
        )}
      </div>
    </>
  )
}
