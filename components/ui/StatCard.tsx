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
        style={{ color: "#ffcd35" }}
      >
        {value}
      </span>
      <span
        className="text-xs uppercase tracking-widest mt-1"
        style={{ color: light ? "#8c85ff" : "#727586" }}
      >
        {label}
      </span>
    </div>
  )
}
