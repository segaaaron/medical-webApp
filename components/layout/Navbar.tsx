"use client"
import { useState } from "react"
import { ShoppingCart, Menu, X, ChevronDown } from "lucide-react"
import type { NavLink } from "@/types"

interface NavbarProps {
  links: NavLink[]
}

export function Navbar({ links }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <nav className="w-full sticky top-0 z-50 shadow-lg" style={{ backgroundColor: "#1F1346" }}>
      <div className="container-xl flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="/" className="flex items-center shrink-0">
          <span className="text-white font-bold text-lg md:text-2xl tracking-tight leading-tight">
            James Nader
            <br />
            <span className="text-sm md:text-base font-normal italic" style={{ color: "#8c85ff" }}>
              Photography Academy
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
          {links.map((link) =>
            link.children ? (
              <li
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-sm text-white hover:text-yellow-300 transition-colors font-medium">
                  {link.label}
                  <ChevronDown size={14} />
                </button>
                {openDropdown === link.label && (
                  <ul
                    className="absolute top-full left-0 mt-1 w-52 rounded shadow-xl py-1 z-50"
                    style={{ backgroundColor: "#2f1c6a" }}
                  >
                    {link.children.map((child) => (
                      <li key={child.label}>
                        <a
                          href={child.href}
                          className="block px-4 py-2 text-sm text-white hover:bg-purple-800 transition-colors"
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="px-3 py-2 text-sm text-white hover:text-yellow-300 transition-colors font-medium block"
                >
                  {link.label}
                </a>
              </li>
            )
          )}
        </ul>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <button className="text-white hover:text-yellow-300 transition-colors" aria-label="Cart">
            <ShoppingCart size={22} />
          </button>
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
                {link.children && (
                  <ul className="pl-4 border-l border-purple-700 ml-6 mb-1">
                    {link.children.map((child) => (
                      <li key={child.label}>
                        <a
                          href={child.href}
                          className="block px-4 py-2 text-sm text-purple-200 hover:text-white transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
