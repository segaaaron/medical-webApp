"use client"

import Image from "next/image"

/** Same ECG motif as `EcgHero`, trimmed to one heartbeat cycle. */
const ECG_PATH =
  "M0,30 L60,30 Q70,30 75,26 Q80,22 85,26 Q90,30 95,30 L140,30 L150,6 L160,54 L170,26 L180,30 L240,30 Q250,30 255,24 Q260,18 265,24 Q270,30 275,30 L340,30"

/**
 * Full-screen loading overlay for the admin dashboard.
 *
 * Visibility (show delay, minimum visible time, scroll lock, `inert` on the
 * page behind) is owned by `GlobalLoadingProvider`; this component only paints.
 */
export function GlobalLoadingOverlay({ message }: { message: string | null }) {
  const label = message ?? "Procesando"

  return (
    <div className="gl-overlay" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
      <div className="gl-overlay__stage">
        <div className="gl-overlay__mark" aria-hidden="true">
          <span className="gl-overlay__halo" />
          <Image
            src="/images/logo_ym_transparent.png"
            alt=""
            width={116}
            height={116}
            priority
            className="gl-overlay__logo"
          />
        </div>

        <svg
          className="gl-overlay__ecg"
          viewBox="0 0 340 60"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path className="gl-overlay__ecg-track" d={ECG_PATH} />
          <path className="gl-overlay__ecg-pulse" d={ECG_PATH} />
        </svg>

        <span className="prem-eyebrow prem-eyebrow--inline gl-overlay__label">{label}</span>
      </div>
    </div>
  )
}
