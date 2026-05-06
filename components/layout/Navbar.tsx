"use client"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, Phone } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import type { NavLink } from "@/types"
import { WHATSAPP_URL } from "@/lib/constants"

interface NavbarProps {
  links: NavLink[]
}

export function Navbar({ links }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav className="w-full sticky top-0 z-50 shadow-lg" style={{ backgroundColor: "#3a0f20" }}>
      <div className="container-xl flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="/" className="flex items-center shrink-0">
          <Image
            src="/images/logo_ym_transparent.png"
            alt="Dra. Yasmin Medrano Avila — Medicina Estética"
            width={130}
            height={80}
            className="object-contain"
            priority
          />
        </a>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="px-3 py-2 text-sm font-medium block transition-colors relative"
                style={{ color: isActive(link.href) ? "#e8a0b4" : "white" }}
              >
                {link.label}
                {isActive(link.href) && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ backgroundColor: "#e8a0b4" }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={WHATSAPP_URL}
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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden border-t overflow-hidden"
            style={{ backgroundColor: "#3a0f20", borderColor: "#5c1f35" }}
          >
            <ul className="flex flex-col py-4">
              {links.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <a
                    href={link.href}
                    className="block px-6 py-3 font-medium transition-colors"
                    style={{
                      borderBottom: "1px solid #5c1f35",
                      color: isActive(link.href) ? "#e8a0b4" : "white",
                      borderLeft: isActive(link.href) ? "3px solid #e8a0b4" : "3px solid transparent",
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                className="px-6 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: links.length * 0.05 }}
              >
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full text-sm font-bold uppercase tracking-wide"
                  style={{ backgroundColor: "#b5496a", color: "white" }}
                  onClick={() => setMobileOpen(false)}
                >
                  <Phone size={14} />
                  Agendar Cita
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
