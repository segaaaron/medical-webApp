interface StatCardProps {
  value: string
  label: string
  light?: boolean
}

export function StatCard({ value, label, light = false }: StatCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <span
        className="text-2xl md:text-3xl font-bold"
        style={{ color: light ? "#ffffff" : "oklch(58% 0.16 35)" }}
      >
        {value}
      </span>
      <span
        className="text-xs uppercase tracking-widest mt-1"
        style={{ color: light ? "rgba(255,255,255,0.55)" : "oklch(48% 0.015 60)" }}
      >
        {label}
      </span>
    </div>
  )
}
