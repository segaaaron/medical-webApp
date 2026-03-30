"use client"
import { useState } from "react"
import { Menu, X, Phone } from "lucide-react"
import type { NavLink } from "@/types"

interface NavbarProps {
  links: NavLink[]
}

export function Navbar({ links }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="w-full sticky top-0 z-50 shadow-lg" style={{ backgroundColor: "#3a0f20" }}>
      <div className="container-xl flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="/" className="flex items-center shrink-0">
          <span className="text-white font-bold text-lg md:text-xl tracking-tight leading-tight">
            Dra. Yasmin Medrano Avila
            <br />
            <span className="text-xs md:text-sm font-normal italic" style={{ color: "#e8a0b4" }}>
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
                className="px-3 py-2 text-sm text-white hover:text-yellow-200 transition-colors font-medium block"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://wa.me/59178751894"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#b5496a", color: "white" }}
          >
            <Phone size={14} />
            Agendar Cita
          </a>
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden text-white hover:text-yellow-200 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t py-4" style={{ backgroundColor: "#3a0f20", borderColor: "#5c1f35" }}>
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="block px-6 py-3 text-white transition-colors font-medium"
                  style={{ borderBottom: "1px solid #5c1f35" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="px-6 pt-4">
              <a
                href="https://wa.me/59178751894"
            target="_blank"
            rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full text-sm font-bold uppercase tracking-wide"
                style={{ backgroundColor: "#b5496a", color: "white" }}
                onClick={() => setMobileOpen(false)}
              >
                <Phone size={14} />
                Agendar Cita
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
