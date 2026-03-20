interface BadgeProps {
  label: string
  color: string
}

export function Badge({ label, color }: BadgeProps) {
  return (
    <span
      className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wide text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}
