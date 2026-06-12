"use client"

import { useState } from "react"
import { m, AnimatePresence } from "framer-motion"
import { Star } from "lucide-react"

const GOLD = "var(--vintage-gold)"

function focusRing(e: React.FocusEvent<HTMLElement>) {
  ;(e.target as HTMLElement).style.boxShadow = "0 0 0 2px rgba(184,151,59,0.45)"
}
function blurRing(e: React.FocusEvent<HTMLElement>) {
  ;(e.target as HTMLElement).style.boxShadow = "none"
}

// ── Interactive star rating ────────────────────────────────────────────────

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const active = hovered > 0 ? hovered : value

  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform cursor-pointer"
          style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Star
            size={32}
            fill={star <= active ? GOLD : "none"}
            style={{
              color: star <= active ? GOLD : "var(--prem-dark-border)",
              transition: "color 120ms, fill 120ms",
              transform: star <= active ? "scale(1.08)" : "scale(1)",
            }}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

// ── Success state ──────────────────────────────────────────────────────────

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center gap-5 py-12 text-center"
    >
      <div className="relative w-16 h-16" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <m.circle
            cx="32"
            cy="32"
            r="22"
            stroke={GOLD}
            strokeWidth="2"
            fill="rgba(184,151,59,0.08)"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "32px 32px", rotate: "-90deg" } as React.CSSProperties}
          />
          <m.path
            d="M21 32 L28 39 L43 25"
            stroke={GOLD}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
      </div>
      <div>
        <p className="font-bold text-xl mb-2" style={{ color: "var(--prem-dark-fg)", fontFamily: "var(--font-heading)" }}>
          ¡Gracias por tu reseña!
        </p>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--meteorite)" }}>
          La Dra. Medrano la revisará pronto. Tu opinión ayuda a otras pacientes a tomar la decisión correcta.
        </p>
      </div>
      <button
        onClick={onReset}
        className="text-xs underline mt-1 transition-opacity hover:opacity-70"
        style={{ color: GOLD }}
      >
        Dejar otra reseña
      </button>
    </m.div>
  )
}

// ── Main form ──────────────────────────────────────────────────────────────

interface ReviewFormProps {
  treatments: string[]
}

interface FormState {
  rating: number
  patient_name: string
  treatment: string
  custom_treatment: string
  body: string
  website: string // honeypot
}

const EMPTY: FormState = {
  rating: 0,
  patient_name: "",
  treatment: "",
  custom_treatment: "",
  body: "",
  website: "",
}

const MAX_BODY = 800

export function ReviewForm({ treatments }: ReviewFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOther = form.treatment === "__other__"
  const charsLeft = MAX_BODY - form.body.length
  const effectiveTreatment = isOther ? form.custom_treatment.trim() || null : form.treatment || null

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.rating === 0) {
      setError("Selecciona una calificación.")
      return
    }
    if (!form.patient_name.trim()) {
      setError("Ingresa tu nombre o alias.")
      return
    }
    if (form.body.trim().length < 20) {
      setError("La reseña debe tener al menos 20 caracteres.")
      return
    }

    // Honeypot: silently succeed without posting
    if (form.website) {
      setSubmitted(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: form.patient_name.trim(),
          treatment: effectiveTreatment,
          body: form.body.trim(),
          rating: form.rating,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? "Ocurrió un error. Intenta de nuevo.")
        return
      }

      setSubmitted(true)
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <SuccessState
        onReset={() => {
          setForm(EMPTY)
          setSubmitted(false)
        }}
      />
    )
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-10 h-px mx-auto mb-4" style={{ backgroundColor: GOLD }} />
        <h1
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ color: "var(--prem-dark-fg)", fontFamily: "var(--font-heading)" }}
        >
          Comparte tu experiencia
        </h1>
        <p className="text-sm" style={{ color: "var(--meteorite)" }}>
          Tu reseña ayuda a otras pacientes a confiar en el proceso.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
          className="absolute opacity-0 pointer-events-none h-0 w-0"
          aria-hidden="true"
        />

        {/* Rating */}
        <div>
          <label
            className="block text-xs uppercase tracking-widest mb-3 font-semibold"
            style={{ color: "var(--meteorite)" }}
          >
            Calificación <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <StarPicker value={form.rating} onChange={(v) => { setForm((p) => ({ ...p, rating: v })); if (error) setError(null) }} />
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="patient_name"
            className="block text-xs uppercase tracking-widest mb-1.5 font-semibold"
            style={{ color: "var(--meteorite)" }}
          >
            Nombre o alias <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <input
            id="patient_name"
            type="text"
            name="patient_name"
            required
            maxLength={100}
            value={form.patient_name}
            onChange={handleChange}
            placeholder="Tu nombre o alias"
            autoComplete="name"
            className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[var(--gray-mid)] outline-none transition"
            style={{
              backgroundColor: "var(--primary-darkest)",
              border: "1px solid var(--primary-darker)",
            }}
            onFocus={focusRing}
            onBlur={blurRing}
          />
        </div>

        {/* Treatment select */}
        <div>
          <label
            htmlFor="treatment"
            className="block text-xs uppercase tracking-widest mb-1.5 font-semibold"
            style={{ color: "var(--meteorite)" }}
          >
            Tratamiento recibido
          </label>
          <select
            id="treatment"
            name="treatment"
            value={form.treatment}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl text-base outline-none transition cursor-pointer"
            style={{
              backgroundColor: "var(--primary-darkest)",
              border: "1px solid var(--primary-darker)",
              color: form.treatment ? "white" : "var(--gray-mid)",
            }}
            onFocus={focusRing}
            onBlur={blurRing}
          >
            <option value="" style={{ color: "var(--gray-mid)" }}>
              Selecciona un tratamiento (opcional)
            </option>
            {treatments.map((t) => (
              <option
                key={t}
                value={t}
                style={{ color: "white", backgroundColor: "var(--primary-darkest)" }}
              >
                {t}
              </option>
            ))}
            <option
              value="__other__"
              style={{ color: "white", backgroundColor: "var(--primary-darkest)" }}
            >
              Otro tratamiento
            </option>
          </select>
        </div>

        {/* Custom treatment — revealed when "Otro" selected */}
        <AnimatePresence>
          {isOther && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <label
                htmlFor="custom_treatment"
                className="block text-xs uppercase tracking-widest mb-1.5 font-semibold"
                style={{ color: "var(--meteorite)" }}
              >
                ¿Cuál tratamiento?
              </label>
              <input
                id="custom_treatment"
                type="text"
                name="custom_treatment"
                maxLength={150}
                value={form.custom_treatment}
                onChange={handleChange}
                placeholder="Ej: Limpieza facial profunda"
                className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[var(--gray-mid)] outline-none transition"
                style={{
                  backgroundColor: "var(--primary-darkest)",
                  border: "1px solid var(--primary-darker)",
                }}
                onFocus={focusRing}
                onBlur={blurRing}
              />
            </m.div>
          )}
        </AnimatePresence>

        {/* Review body */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="body"
              className="block text-xs uppercase tracking-widest font-semibold"
              style={{ color: "var(--meteorite)" }}
            >
              Tu reseña <span aria-hidden="true" style={{ color: GOLD }}>*</span>
            </label>
            <span
              className="text-xs tabular-nums"
              style={{ color: charsLeft < 50 ? GOLD : "var(--gray-mid)" }}
            >
              {charsLeft}
            </span>
          </div>
          <textarea
            id="body"
            name="body"
            required
            minLength={20}
            maxLength={MAX_BODY}
            rows={4}
            value={form.body}
            onChange={handleChange}
            placeholder="Cuéntanos cómo fue tu experiencia con la Dra. Medrano..."
            className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[var(--gray-mid)] outline-none transition resize-none"
            style={{
              backgroundColor: "var(--primary-darkest)",
              border: "1px solid var(--primary-darker)",
            }}
            onFocus={focusRing}
            onBlur={blurRing}
          />
          <p className="text-xs mt-1" style={{ color: "var(--gray-mid)" }}>
            Mínimo 20 caracteres · No incluyas información médica privada
          </p>
        </div>

        {/* Error */}
        {error && (
          <m.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="text-sm font-medium"
            style={{ color: "#f87171" }}
          >
            {error}
          </m.p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-bold uppercase tracking-wide transition-all mt-1 disabled:opacity-60"
          style={{ backgroundColor: GOLD, color: "white" }}
        >
          {loading ? (
            <svg
              className="animate-spin"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <Star size={16} fill="white" style={{ color: "white" }} />
          )}
          {loading ? "Enviando..." : "Enviar mi reseña"}
        </button>
      </form>
    </m.div>
  )
}
