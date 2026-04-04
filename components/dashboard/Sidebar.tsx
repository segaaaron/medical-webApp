"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Stethoscope,
  Newspaper,
  CalendarCheck,
  Home,
} from "lucide-react"

const NAV_CONTENT: { label: string; href: string; icon: typeof Home; exact?: boolean }[] = [
  { label: "Inicio", href: "/dashboard", icon: Home, exact: true },
]

const NAV_SERVICES = [
  { label: "Tratamientos", href: "/dashboard/tratamientos", icon: Stethoscope },
  { label: "Blog", href: "/dashboard/blog", icon: Newspaper },
  { label: "Citas", href: "/dashboard/citas", icon: CalendarCheck },
]

export function Sidebar() {
  const pathname = usePathname()

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" })
    window.location.href = "/dashboard/login"
  }

  return (
    <aside className="h-full flex flex-col" style={{ backgroundColor: "#1F1346" }}>
      {/* Brand */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "#2f1c6a" }}>
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard size={18} style={{ color: "#8c85ff" }} />
          <span className="text-white font-bold text-sm">Dashboard</span>
        </div>
        <p className="text-xs" style={{ color: "#727586" }}>Dra. Yasmin Medrano Avila</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-5">
        <div>
          <p className="text-xs uppercase tracking-widest px-3 mb-3" style={{ color: "#727586" }}>
            Contenido Web
          </p>
          <ul className="flex flex-col gap-1">
            {NAV_CONTENT.map(({ label, href, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: active ? "#2f1c6a" : "transparent",
                      color: active ? "white" : "#8c85ff",
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest px-3 mb-3" style={{ color: "#727586" }}>
            Servicios
          </p>
          <ul className="flex flex-col gap-1">
            {NAV_SERVICES.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: active ? "#2f1c6a" : "transparent",
                      color: active ? "white" : "#8c85ff",
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 flex flex-col gap-1 border-t pt-4" style={{ borderColor: "#2f1c6a" }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-purple-900"
          style={{ color: "#8c85ff" }}
        >
          <ExternalLink size={15} />
          Ver Home
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-purple-900 w-full text-left"
          style={{ color: "#fc5185" }}
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
