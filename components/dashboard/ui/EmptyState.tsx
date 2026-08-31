"use client"

import type { LucideIcon } from "lucide-react"

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon
  title: string
  hint?: string
  action?: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl border border-dashed py-14 px-6 text-center"
      style={{ borderColor: "var(--prem-border)", backgroundColor: "var(--prem-surface)" }}
    >
      <Icon size={26} aria-hidden="true" className="mx-auto mb-3" style={{ color: "var(--vintage-gold-light)" }} />
      <p style={{ fontFamily: "var(--font-heading)", color: "var(--prem-fg)" }} className="text-base">
        {title}
      </p>
      {hint && (
        <p className="text-sm mt-1.5 mx-auto max-w-sm" style={{ color: "var(--prem-muted)" }}>
          {hint}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
