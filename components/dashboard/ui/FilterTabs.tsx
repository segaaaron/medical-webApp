"use client"

export interface FilterOption {
  label: string
  value: string
  count?: number
}

/**
 * Segmented filter. A `group` of toggle buttons rather than a radiogroup: the
 * radio role would promise arrow-key navigation this control does not provide.
 */
export function FilterTabs({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 p-1 rounded-xl border"
      style={{ backgroundColor: "var(--prem-surface)", borderColor: "var(--prem-border)" }}
    >
      {options.map(({ label, value: v, count }) => {
        const selected = value === v
        return (
          <button
            key={v || "all"}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(v)}
            // 44px de alto en móvil (mínimo táctil); compacto en escritorio,
            // donde el puntero no necesita ese margen.
            className="flex items-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-0 sm:py-1.5 rounded-lg text-[13px] font-medium transition-colors"
            style={{
              backgroundColor: selected ? "var(--vintage-gold)" : "transparent",
              color: selected ? "#fff" : "var(--prem-muted)",
            }}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span
                className="tabular-nums text-[11px] px-1.5 rounded-full"
                style={{
                  backgroundColor: selected ? "rgba(255,255,255,0.22)" : "rgba(20,10,15,0.06)",
                  color: selected ? "#fff" : "var(--prem-muted)",
                }}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
