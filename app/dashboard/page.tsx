"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Star,
  Link2,
  Newspaper,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { guardedFetch } from "@/lib/client-fetch"
import { PageHeader } from "@/components/dashboard/PageHeader"

interface Metric {
  key: string
  label: string
  value: number
  hint: string
  href: string
  icon: LucideIcon
  /** Requiere una decisión de la doctora, no es solo un dato. */
  actionable: boolean
}

const EMPTY_COUNTS = {
  pendingReviews: 0,
  pendingInvites: 0,
  draftPosts: 0,
  inactiveTreatments: 0,
}

/** Lee una lista del panel y cuenta los que cumplen la condición. */
async function count(url: string, match: (item: Record<string, unknown>) => boolean) {
  const res = await guardedFetch(url)
  if (!res.ok) return 0
  const data: unknown = await res.json()
  const list = Array.isArray(data) ? data : ((data as { data?: unknown[] })?.data ?? [])
  return list.filter((item) => match(item as Record<string, unknown>)).length
}

export default function DashboardOverviewPage() {
  const [counts, setCounts] = useState(EMPTY_COUNTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [pendingReviews, pendingInvites, draftPosts, inactiveTreatments] = await Promise.all([
        count("/api/reviews?status=pending", () => true),
        count("/api/reviews/invites?status=pending", () => true),
        count("/api/admin/blog", (p) => p.published === false),
        count("/api/admin/treatments", (t) => t.active === false),
      ])
      setCounts({ pendingReviews, pendingInvites, draftPosts, inactiveTreatments })
    } catch {
      setError("No se pudo cargar el resumen.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const metrics: Metric[] = [
    {
      key: "reviews",
      label: "Reseñas por revisar",
      value: counts.pendingReviews,
      hint: "esperan publicarse o rechazarse",
      href: "/dashboard/resenas",
      icon: Star,
      actionable: true,
    },
    {
      key: "invites",
      label: "Invitaciones sin usar",
      value: counts.pendingInvites,
      hint: "links enviados aún sin reseña",
      href: "/dashboard/resenas",
      icon: Link2,
      actionable: false,
    },
    {
      key: "drafts",
      label: "Artículos sin publicar",
      value: counts.draftPosts,
      hint: "escritos pero fuera de la web",
      href: "/dashboard/blog",
      icon: Newspaper,
      actionable: false,
    },
    {
      key: "treatments",
      label: "Tratamientos inactivos",
      value: counts.inactiveTreatments,
      hint: "no se muestran en el catálogo",
      href: "/dashboard/tratamientos",
      icon: Stethoscope,
      actionable: false,
    },
  ]

  const pendingTotal = counts.pendingReviews
  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <>
      <PageHeader
        title="Resumen"
        description={today.charAt(0).toUpperCase() + today.slice(1)}
      />

      {error && (
        <p role="alert" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(224,90,122,0.08)", color: "#b03f5c" }}>
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[116px] rounded-2xl img-shimmer" />
          ))}
        </div>
      ) : (
        <>
          {/* Todo al día: el estado vacío también merece diseño. */}
          {pendingTotal === 0 && (
            <div
              className="flex items-center gap-3 rounded-2xl border px-5 py-4 mb-4"
              style={{ backgroundColor: "rgba(31,122,82,0.07)", borderColor: "rgba(31,122,82,0.25)" }}
            >
              <CheckCircle2 size={20} aria-hidden="true" style={{ color: "#1f7a52" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--prem-fg)" }}>
                  Todo al día
                </p>
                <p className="text-xs" style={{ color: "var(--prem-muted)" }}>
                  No hay reseñas esperando tu decisión.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {metrics.map(({ key, label, value, hint, href, icon: Icon, actionable }) => {
              const highlight = actionable && value > 0
              return (
                <Link
                  key={key}
                  href={href}
                  className="dash-metric group flex flex-col gap-2 rounded-2xl border p-5"
                  data-highlight={highlight ? "true" : "false"}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={15} aria-hidden="true" style={{ color: "var(--vintage-gold)" }} />
                    <span className="prem-eyebrow prem-eyebrow--inline" style={{ color: "var(--prem-muted)" }}>
                      {label}
                    </span>
                  </span>

                  <span
                    className="text-3xl leading-none tabular-nums"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: highlight ? "var(--vintage-gold-dark)" : "var(--prem-fg)",
                    }}
                  >
                    {value}
                  </span>

                  <span className="flex items-center justify-between gap-2 text-xs" style={{ color: "var(--prem-muted)" }}>
                    {hint}
                    <ArrowRight
                      size={14}
                      aria-hidden="true"
                      className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
