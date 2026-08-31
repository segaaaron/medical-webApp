"use client"

/** Deterministic warm tint so the same patient always gets the same avatar. */
const TINTS = [
  { bg: "rgba(184,151,59,0.16)", fg: "#8a6a12" },
  { bg: "rgba(143,52,82,0.14)", fg: "#8f3452" },
  { bg: "rgba(74,158,130,0.14)", fg: "#2f7563" },
  { bg: "rgba(92,31,53,0.12)", fg: "#5c1f35" },
]

function initials(name: string, lastname?: string | null): string {
  const a = name.trim()[0] ?? "?"
  const b = lastname?.trim()[0] ?? name.trim().split(/\s+/)[1]?.[0] ?? ""
  return (a + b).toUpperCase()
}

export function InitialsAvatar({
  name,
  lastname,
  size = 36,
}: {
  name: string
  lastname?: string | null
  size?: number
}) {
  const key = `${name}${lastname ?? ""}`
  const tint = TINTS[[...key].reduce((acc, c) => acc + c.charCodeAt(0), 0) % TINTS.length]
  return (
    <span
      aria-hidden="true"
      className="flex-shrink-0 grid place-items-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: tint.bg,
        color: tint.fg,
        fontSize: size * 0.34,
        fontFamily: "var(--font-heading)",
      }}
    >
      {initials(name, lastname)}
    </span>
  )
}
