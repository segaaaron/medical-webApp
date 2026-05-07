"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"

const NAV_CONTENT: { label: string; href: string; icon: typeof Home; exact?: boolean }[] = [
  { label: "Inicio", href: "/dashboard", icon: Home, exact: true },
]

const NAV_SERVICES = [
  { label: "Blog", href: "/dashboard/blog", icon: Newspaper },
  { label: "Contacto", href: "/dashboard/contacto", icon: Phone },
  { label: "Acerca de", href: "/dashboard/acerca-de", icon: Users },
  { label: "Footer", href: "/dashboard/footer", icon: PanelBottom },
  { label: "Promociones", href: "/dashboard/promociones", icon: Megaphone },
]

const NAV_TRATAMIENTOS = [
  { label: "Categorías", href: "/dashboard/tratamientos", icon: Tag, exact: true },
  { label: "Info", href: "/dashboard/tratamientos/info", icon: Info },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" })
    window.location.href = "/dashboard/login"
  }

  function navLink(href: string, label: string, Icon: typeof Home, exact?: boolean) {
    const active = exact ? pathname === href : pathname.startsWith(href)
    return (
      <li key={href}>
        <Link
          href={href}
          onClick={onClose}
          aria-current={active ? "page" : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: active ? "rgba(184,151,59,0.12)" : "transparent",
            color: active ? "#B8973B" : "rgba(255,255,255,0.55)",
            borderLeft: active ? "2px solid #B8973B" : "2px solid transparent",
          }}
        >
          <Icon size={16} aria-hidden="true" />
          {label}
        </Link>
      </li>
    )
  }

  return (
    <aside className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "#1a0510" }} aria-label="Panel de administración">
      {/* Brand */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(184,151,59,0.15)" }}>
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard size={18} style={{ color: "#B8973B" }} aria-hidden="true" />
          <span className="font-bold text-sm" style={{ color: "#B8973B" }}>Dashboard</span>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Dra. Yasmin Medrano Avila</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-5" aria-label="Navegación del dashboard">
        <div role="group" aria-labelledby="nav-content-label">
          <p id="nav-content-label" className="text-xs uppercase tracking-widest px-3 mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            Contenido Web
          </p>
          <ul className="flex flex-col gap-1" role="list">
            {NAV_CONTENT.map(({ label, href, icon: Icon, exact }) => navLink(href, label, Icon, exact))}
          </ul>
        </div>

        <div role="group" aria-labelledby="nav-services-label">
          <p id="nav-services-label" className="text-xs uppercase tracking-widest px-3 mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            Servicios
          </p>
          <ul className="flex flex-col gap-1" role="list">
            {/* Tratamientos parent */}
            <li>
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{
                  color: pathname.startsWith("/dashboard/tratamientos") ? "#B8973B" : "rgba(255,255,255,0.55)",
                  backgroundColor: pathname.startsWith("/dashboard/tratamientos") ? "rgba(184,151,59,0.12)" : "transparent",
                  borderLeft: pathname.startsWith("/dashboard/tratamientos") ? "2px solid #B8973B" : "2px solid transparent",
                }}
              >
                <Stethoscope size={16} aria-hidden="true" />
                Tratamientos
              </div>
              {/* Sub-items */}
              <ul className="flex flex-col gap-0.5 mt-0.5 ml-4" role="list">
                {NAV_TRATAMIENTOS.map(({ label, href, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href)
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: active ? "rgba(184,151,59,0.1)" : "transparent",
                          color: active ? "#B8973B" : "rgba(255,255,255,0.45)",
                          borderLeft: active ? "2px solid rgba(184,151,59,0.6)" : "2px solid transparent",
                        }}
                      >
                        <Icon size={13} aria-hidden="true" />
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>

            {NAV_SERVICES.map(({ label, href, icon: Icon }) => navLink(href, label, Icon))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 flex flex-col gap-1 border-t pt-4" style={{ borderColor: "rgba(184,151,59,0.15)" }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ver sitio web público (abre en nueva pestaña)"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.45)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#B8973B" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)" }}
        >
          <ExternalLink size={15} aria-hidden="true" />
          Ver Home
        </a>
        <button
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left"
          style={{ color: "#fc5185" }}
        >
          <LogOut size={15} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
