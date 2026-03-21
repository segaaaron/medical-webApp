"use client"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  ImageIcon,
  HelpCircle,
  User,
  Navigation,
  LogOut,
  ExternalLink,
} from "lucide-react"

const NAV = [
  { label: "Hero", href: "/dashboard/hero", icon: Sparkles },
  { label: "Curso", href: "/dashboard/course", icon: BookOpen },
  { label: "Presets", href: "/dashboard/presets", icon: ImageIcon },
  { label: "FAQs", href: "/dashboard/faqs", icon: HelpCircle },
  { label: "About", href: "/dashboard/about", icon: User },
  { label: "Navegación", href: "/dashboard/navigation", icon: Navigation },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" })
    router.push("/dashboard/login")
  }

  return (
    <aside className="h-full flex flex-col" style={{ backgroundColor: "#1F1346" }}>
      {/* Brand */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "#2f1c6a" }}>
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard size={18} style={{ color: "#8c85ff" }} />
          <span className="text-white font-bold text-sm">Dashboard</span>
        </div>
        <p className="text-xs" style={{ color: "#727586" }}>James Nader Academy</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-xs uppercase tracking-widest px-3 mb-3" style={{ color: "#727586" }}>
          Secciones
        </p>
        <ul className="flex flex-col gap-1">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <li key={href}>
                <a
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: active ? "#2f1c6a" : "transparent",
                    color: active ? "white" : "#8c85ff",
                  }}
                >
                  <Icon size={16} />
                  {label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 flex flex-col gap-1 border-t pt-4" style={{ borderColor: "#2f1c6a" }}>
        <a
          href="/"
          target="_blank"
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
