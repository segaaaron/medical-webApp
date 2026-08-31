"use client"

import { createContext, useContext } from "react"
import { WHATSAPP_FALLBACK, type WhatsAppConfig } from "@/lib/whatsapp"

const WhatsAppContext = createContext<WhatsAppConfig>(WHATSAPP_FALLBACK)

/**
 * Reparte el WhatsApp configurado en el panel a los componentes cliente.
 *
 * El valor lo resuelve el layout (Server Component) y baja por contexto: sin
 * prop drilling por Navbar, grids y secciones, y sin que cada uno vuelva a
 * pedirlo al backend.
 */
export function WhatsAppProvider({
  value,
  children,
}: {
  value: WhatsAppConfig
  children: React.ReactNode
}) {
  return <WhatsAppContext.Provider value={value}>{children}</WhatsAppContext.Provider>
}

/** Config de WhatsApp vigente. Fuera del provider devuelve el fallback. */
export function useWhatsApp(): WhatsAppConfig {
  return useContext(WhatsAppContext)
}

/** Enlace con mensaje prellenado. `text` sin codificar. */
export function useWhatsAppLink(text?: string): string {
  const { url } = useWhatsApp()
  return text ? `${url}?text=${encodeURIComponent(text)}` : url
}
