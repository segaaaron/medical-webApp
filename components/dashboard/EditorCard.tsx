import { type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

interface EditorCardProps {
  title: string
  /** Pista bajo el título: qué controla esta sección. */
  hint?: string
  /** Icono de la sección. Siempre dorado: el acento no cambia por sección. */
  icon?: LucideIcon
  children: ReactNode
}

/**
 * Tarjeta de una sección editable del panel.
 *
 * El icono y su pista viven aquí, no repetidos en cada página: antes cada
 * sección elegía su propio color (`text-purple-500`, `text-green-500`,
 * `text-pink-500`) y una pantalla podía mostrar cuatro acentos compitiendo.
 * Un solo acento — el dorado de la marca — y los grises salen de los tokens.
 */
export function EditorCard({ title, hint, icon: Icon, children }: EditorCardProps) {
  const id = `editor-${title.replace(/\s+/g, "-").toLowerCase()}`
  return (
    <section
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: "var(--prem-surface)", borderColor: "var(--prem-border)" }}
      aria-labelledby={id}
    >
      <div className="px-6 py-4 border-b flex items-center gap-2.5" style={{ borderColor: "var(--prem-border)" }}>
        {Icon && <Icon size={16} aria-hidden="true" style={{ color: "var(--vintage-gold)" }} className="shrink-0" />}
        <div className="min-w-0">
          <h2 id={id} className="text-base font-semibold" style={{ color: "var(--prem-fg)" }}>
            {title}
          </h2>
          {hint && (
            <p className="text-xs mt-0.5" style={{ color: "var(--prem-muted)" }}>
              {hint}
            </p>
          )}
        </div>
      </div>
      <div className="px-6 py-5 flex flex-col gap-5">{children}</div>
    </section>
  )
}
