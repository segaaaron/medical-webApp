"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useConfirm, LOGOUT_CONFIRM } from "./ConfirmDialog"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Stethoscope,
  Newspaper,
  Phone,
  Home,
  Tag,
  Info,
  Users,
  PanelBottom,
  Megaphone,
  Star,
  Inbox,
  Gauge,
} from "lucide-react"

type Icon = typeof Home

interface NavItem {
  label: string
  href: string
  icon: Icon
  exact?: boolean
  /** Clave del contador de pendientes que se pinta sobre el icono. */
  badge?: "reviews"
  children?: NavItem[]
}

/**
 * Navegación agrupada por trabajo, no por tabla de la base de datos.
 *
 * Antes había dos grupos ("Contenido Web" con un solo item y "Servicios" con
 * todo lo demás), y Citas no aparecía en ningún sitio pese a existir la página:
 * solo se llegaba escribiendo la URL.
 */
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Consultorio",
    items: [
      { label: "Resumen", href: "/dashboard", icon: Gauge, exact: true },
      { label: "Reseñas", href: "/dashboard/resenas", icon: Star, badge: "reviews" },
      { label: "Contactos", href: "/dashboard/contactos", icon: Inbox },
    ],
  },
  {
    label: "Catálogo",
    items: [
      {
        label: "Tratamientos",
        href: "/dashboard/tratamientos",
        icon: Stethoscope,
        children: [
          { label: "Categorías", href: "/dashboard/tratamientos", icon: Tag, exact: true },
          { label: "Info", href: "/dashboard/tratamientos/info", icon: Info },
        ],
      },
      { label: "Blog", href: "/dashboard/blog", icon: Newspaper },
      { label: "Promociones", href: "/dashboard/promociones", icon: Megaphone },
    ],
  },
  {
    label: "Sitio web",
    items: [
      { label: "Página de inicio", href: "/dashboard/inicio", icon: Home },
      { label: "Acerca de", href: "/dashboard/acerca-de", icon: Users },
      { label: "Contacto", href: "/dashboard/contacto", icon: Phone },
      { label: "Footer", href: "/dashboard/footer", icon: PanelBottom },
    ],
  },
]

/** Cuenta los elementos pendientes de un endpoint que devuelve una lista. */
async function countPending(url: string, filter?: (item: Record<string, unknown>) => boolean) {
  const res = await fetch(url)
  if (!res.ok) return 0
  const data: unknown = await res.json()
  if (!Array.isArray(data)) return 0
  return filter ? data.filter((d) => filter(d as Record<string, unknown>)).length : data.length
}

function PendingBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null
  return (
    <span
      aria-label={label}
      className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full font-bold leading-none tabular-nums"
      style={{
        backgroundColor: "var(--vintage-gold)",
        color: "#1a0510",
        fontSize: "9px",
        minWidth: "14px",
        height: "14px",
        padding: "0 3px",
        boxShadow: "0 0 0 1.5px #1a0510",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const [counts, setCounts] = useState({ reviews: 0 })
  const confirm = useConfirm()

  useEffect(() => {
    let cancelled = false
    countPending("/api/reviews?status=pending")
      .catch(() => 0)
      .then((reviews) => {
        if (!cancelled) setCounts({ reviews })
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    if (!(await confirm(LOGOUT_CONFIRM))) return
    await fetch("/api/auth", { method: "DELETE" })
    window.location.href = "/dashboard/login"
  }

  function isActive(item: NavItem) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href)
  }

  function NavLink({ item, nested = false }: { item: NavItem; nested?: boolean }) {
    const active = isActive(item)
    const Icon = item.icon
    const count = item.badge ? counts[item.badge] : 0
    return (
      <Link
        href={item.href}
        onClick={onClose}
        aria-current={active ? "page" : undefined}
        className={`dash-nav-link flex items-center rounded-lg font-medium ${
          nested ? "gap-2.5 px-3 py-2 text-xs" : "gap-3 px-3 py-2.5 text-sm"
        }`}
        data-active={active ? "true" : "false"}
      >
        <span className="relative shrink-0 flex">
          <Icon size={nested ? 13 : 16} aria-hidden="true" />
          <PendingBadge count={count} label={`${count} pendientes`} />
        </span>
        {item.label}
      </Link>
    )
  }

  return (
    <aside className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "#1a0510" }} aria-label="Panel de administración">
      {/* Brand */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(184,151,59,0.15)" }}>
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard size={18} style={{ color: "var(--vintage-gold)" }} aria-hidden="true" />
          <span className="font-bold text-sm" style={{ color: "var(--vintage-gold)" }}>Dashboard</span>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Dra. Yasmin Medrano Avila</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-5" aria-label="Navegación del dashboard">
        {NAV_GROUPS.map((group) => {
          const id = `nav-${group.label.toLowerCase().replace(/\s+/g, "-")}`
          return (
            <div key={group.label} role="group" aria-labelledby={id}>
              <p id={id} className="prem-eyebrow prem-eyebrow--inline px-3 mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                {group.label}
              </p>
              <ul className="flex flex-col gap-1" role="list">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <NavLink item={item} />
                    {item.children && (
                      <ul className="flex flex-col gap-0.5 mt-0.5 ml-4" role="list">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <NavLink item={child} nested />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 flex flex-col gap-1 border-t pt-4" style={{ borderColor: "rgba(184,151,59,0.15)" }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="dash-nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
          data-active="false"
        >
          <ExternalLink size={16} aria-hidden="true" />
          Ver Home
        </a>
        <button
          onClick={handleLogout}
          className="dash-nav-link dash-nav-link--danger flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left"
          data-active="false"
        >
          <LogOut size={16} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
