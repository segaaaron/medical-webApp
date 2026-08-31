"use client"

import { Search, X } from "lucide-react"

export function SearchField({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  id: string
}) {
  return (
    <div className="relative flex-1 min-w-[180px] max-w-xs">
      <Search
        size={15}
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--prem-muted)" }}
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-10 pl-9 pr-8 text-sm rounded-xl border outline-none transition-colors focus:border-[var(--vintage-gold)]"
        style={{
          backgroundColor: "var(--prem-surface)",
          borderColor: "var(--prem-border)",
          color: "var(--prem-fg)",
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
          style={{ color: "var(--prem-muted)" }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
