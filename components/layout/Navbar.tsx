"use client"
import { useState, useEffect } from "react"
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
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    // Reset scroll state on page change
    setScrolled(window.scrollY > 56)
    const onScroll = () => setScrolled(window.scrollY > 56)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
    <div style={{ height: "70px", backgroundColor: isHome ? "transparent" : "rgba(58,15,32,1)" }} aria-hidden="true" />
    <nav
      className="w-full fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: scrolled || !isHome ? "rgba(26,5,16,0.88)" : "transparent",
        backdropFilter: scrolled || !isHome ? "blur(20px) saturate(160%)" : "none",
        WebkitBackdropFilter: scrolled || !isHome ? "blur(20px) saturate(160%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(184,151,59,0.18)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.25)" : "none",
        paddingBottom: scrolled ? "4px" : "0",
        transition: "background-color 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, padding 0.45s",
      }}
    >
      <div className="container-xl flex items-center justify-between" style={{ height: "70px" }}>
        {/* Logo */}
        <a href="/" className="flex items-center shrink-0" onClick={(e) => { if (isHome) e.preventDefault() }}>
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
                className="px-3 py-2 block transition-colors relative uppercase"
                onClick={(e) => { if (isActive(link.href)) e.preventDefault() }}
                style={{
                  fontSize: "12.5px",
                  letterSpacing: "0.09em",
                  color: isActive(link.href) ? "var(--prem-accent)" : "rgba(255,255,255,0.72)",
                }}
              >
                {link.label}
                {isActive(link.href) && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ backgroundColor: "var(--prem-accent)" }}
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
            className="flex items-center gap-2 uppercase transition-all"
            style={{
              border: "1px solid rgba(255,255,255,0.42)",
              color: "white",
              borderRadius: "2px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              padding: "10px 22px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--prem-accent)"
              ;(e.currentTarget as HTMLAnchorElement).style.color = "white"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"
              ;(e.currentTarget as HTMLAnchorElement).style.color = "white"
            }}
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
            style={{ backgroundColor: "oklch(13% 0.01 55)", borderColor: "var(--prem-dark-border)" }}
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
                      borderBottom: "1px solid var(--prem-dark-border)",
                      color: isActive(link.href) ? "var(--prem-accent)" : "rgba(255,255,255,0.72)",
                      borderLeft: isActive(link.href) ? "3px solid var(--prem-accent)" : "3px solid transparent",
                    }}
                    onClick={(e) => { if (isActive(link.href)) e.preventDefault(); setMobileOpen(false) }}
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
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: "var(--prem-accent)",
                    color: "white",
                    borderRadius: "2px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                  }}
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
    </>
  )
}
