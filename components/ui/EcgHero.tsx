"use client"

import { m, useReducedMotion } from "framer-motion"

/**
 * Decorative ECG/heartbeat line that draws in on mount.
 * aria-hidden — purely visual.
 */
export function EcgHero() {
  const prefersReduced = useReducedMotion()

  // ECG path: flat → P-wave → flat → QRS spike → flat → T-wave → flat
  const path =
    "M0,30 L80,30 Q90,30 95,26 Q100,22 105,26 Q110,30 115,30 L160,30 L170,5 L180,55 L190,25 L200,30 L280,30 Q290,30 295,24 Q300,18 305,24 Q310,30 315,30 L600,30"

  if (prefersReduced) return null

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none overflow-hidden"
      style={{ bottom: "72px", height: "60px", opacity: 0.18 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 60"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <m.path
          d={path}
          fill="none"
          stroke="#B8973B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 2.2, ease: "easeInOut", delay: 0.3 },
            opacity: { duration: 0.4, delay: 0.3 },
          }}
        />
        {/* Glow dot at the end of the spike — CSS-only, no offsetPath, cross-browser safe */}
        <m.circle
          cx="190" cy="25" r="3"
          fill="#B8973B"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 0.6, delay: 1.8, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 4px #B8973B)" }}
        />
      </svg>
    </div>
  )
}
