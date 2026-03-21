"use client"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import type { NavLink } from "@/types"

interface NavbarProps {
  links: NavLink[]
}

export function Navbar({ links }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="w-full sticky top-0 z-50 shadow-lg" style={{ backgroundColor: "#1F1346" }}>
      <div className="container-xl flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="/" className="flex items-center shrink-0">
          <span className="text-white font-bold text-lg md:text-2xl tracking-tight leading-tight">
            Clínica Estética
            <br />
            <span className="text-sm md:text-base font-normal italic" style={{ color: "#8c85ff" }}>
              Medicina Estética Avanzada
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="px-3 py-2 text-sm text-white hover:text-yellow-300 transition-colors font-medium block"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden text-white hover:text-yellow-300 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-purple-800 py-4" style={{ backgroundColor: "#1F1346" }}>
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="block px-6 py-3 text-white hover:bg-purple-900 transition-colors font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
