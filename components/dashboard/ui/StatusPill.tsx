"use client"

/**
 * Status chip for reviews and invites.
 * Colour is paired with a dot AND a text label so meaning never relies on
 * hue alone (WCAG 1.4.1).
 */
export type StatusTone = "pending" | "success" | "danger" | "neutral"

const TONES: Record<StatusTone, { fg: string; bg: string; border: string }> = {
  pending: { fg: "#8a6a12", bg: "rgba(184,151,59,0.12)", border: "rgba(184,151,59,0.32)" },
  success: { fg: "#2f7563", bg: "rgba(74,158,130,0.12)", border: "rgba(74,158,130,0.32)" },
  danger: { fg: "#b03f5c", bg: "rgba(224,90,122,0.10)", border: "rgba(224,90,122,0.30)" },
  neutral: { fg: "var(--prem-muted)", bg: "rgba(20,10,15,0.04)", border: "var(--prem-border)" },
}

export function StatusPill({ tone, label }: { tone: StatusTone; label: string }) {
  const t = TONES[tone]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border whitespace-nowrap"
      style={{ color: t.fg, backgroundColor: t.bg, borderColor: t.border }}
    >
      <span
        aria-hidden="true"
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: "currentColor" }}
      />
      {label}
    </span>
  )
}
