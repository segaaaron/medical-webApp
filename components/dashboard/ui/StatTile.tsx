"use client"

/** Compact metric shown above the lists — answers "what needs me now?". */
export function StatTile({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string
  value: string | number
  hint?: string
  accent?: boolean
}) {
  return (
    <div
      className="flex-1 min-w-[128px] rounded-xl border px-4 py-3"
      style={{
        backgroundColor: accent ? "rgba(184,151,59,0.07)" : "var(--prem-surface)",
        borderColor: accent ? "rgba(184,151,59,0.28)" : "var(--prem-border)",
      }}
    >
      <span className="prem-eyebrow prem-eyebrow--inline block" style={{ color: "var(--prem-muted)" }}>
        {label}
      </span>
      <span
        className="block mt-1 text-2xl leading-none tabular-nums"
        style={{ fontFamily: "var(--font-heading)", color: accent ? "var(--vintage-gold-dark)" : "var(--prem-fg)" }}
      >
        {value}
      </span>
      {hint && (
        <span className="block mt-1 text-[11px]" style={{ color: "var(--prem-muted)" }}>
          {hint}
        </span>
      )}
    </div>
  )
}
