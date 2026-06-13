"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { m, AnimatePresence, useReducedMotion, type Variants } from "framer-motion"
import { Star, CheckCircle, XCircle } from "lucide-react"
import { INVITE_REASON_COPY } from "@/lib/invite-copy"

const GOLD = "var(--vintage-gold)"
const GOLD_DARK = "var(--vintage-gold-dark)"

const MAX_BODY = 800
const MIN_BODY = 20

function focusRing(e: React.FocusEvent<HTMLElement>) {
  ;(e.target as HTMLElement).style.boxShadow = "0 0 0 2px rgba(184,151,59,0.45)"
  ;(e.target as HTMLElement).style.borderColor = "rgba(184,151,59,0.6)"
}
function blurRing(e: React.FocusEvent<HTMLElement>) {
  ;(e.target as HTMLElement).style.boxShadow = "none"
  ;(e.target as HTMLElement).style.borderColor = "var(--primary-darker)"
}

// ── Rating microcopy ─────────────────────────────────────────────────────────
const RATING_COPY: Record<number, string> = {
  1: "Lamentamos que tu experiencia no fuera la esperada.",
  2: "Lamentamos que tu experiencia no fuera la esperada.",
  3: "Gracias por tu honestidad.",
  4: "¡Nos alegra que te haya gustado!",
  5: "¡Excelente! ✨",
}

// ── Toast notification ───────────────────────────────────────────────────────
type ToastType = "success" | "error"
interface ToastState {
  type: ToastType
  message: string
}

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  const isSuccess = toast.type === "success"
  return (
    <m.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      role="alert"
      aria-live="assertive"
      className="fixed top-5 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl"
      style={{
        transform: "translateX(-50%)",
        backgroundColor: isSuccess ? "#052e16" : "#2d0a0a",
        border: `1px solid ${isSuccess ? "#16a34a" : "#ef4444"}`,
        minWidth: "260px",
        maxWidth: "90vw",
      }}
      onClick={onDismiss}
    >
      {isSuccess ? (
        <CheckCircle size={18} style={{ color: "#4ade80", flexShrink: 0 }} />
      ) : (
        <XCircle size={18} style={{ color: "#f87171", flexShrink: 0 }} />
      )}
      <span className="text-sm font-medium" style={{ color: isSuccess ? "#86efac" : "#fca5a5" }}>
        {toast.message}
      </span>
    </m.div>
  )
}

// ── Interactive star rating (size 42, spring scale + glow) ────────────────────
function StarPicker({
  value,
  onChange,
  reduced,
}: {
  value: number
  onChange: (v: number) => void
  reduced: boolean
}) {
  const [hovered, setHovered] = useState(0)
  const active = hovered > 0 ? hovered : value

  return (
    <div className="flex gap-2.5" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= active
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="cursor-pointer"
            style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <m.span
              animate={reduced ? {} : { scale: isActive ? 1.15 : 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 16 }}
              style={{ display: "inline-flex" }}
            >
              <Star
                size={42}
                fill={isActive ? GOLD : "none"}
                style={{
                  color: isActive ? GOLD : "var(--prem-dark-border)",
                  transition: "color 140ms, fill 140ms, filter 140ms",
                  filter: isActive ? "drop-shadow(0 0 7px rgba(184,151,59,0.55))" : "none",
                }}
                strokeWidth={1.5}
              />
            </m.span>
          </button>
        )
      })}
    </div>
  )
}

// ── Success state ─────────────────────────────────────────────────────────────
function SuccessState({ name, reduced }: { name: string; reduced: boolean }) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center gap-6 py-14 text-center"
    >
      <div className="relative w-20 h-20" aria-hidden="true">
        {!reduced && (
          <m.div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(184,151,59,0.25) 0%, transparent 70%)" }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.4, opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}
        <svg width="80" height="80" viewBox="0 0 64 64" fill="none" className="relative">
          <m.circle
            cx="32"
            cy="32"
            r="26"
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
            d="M20 32 L28 40 L44 24"
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
        <p
          className="font-bold text-2xl mb-3"
          style={{ color: "var(--prem-dark-fg)", fontFamily: "var(--font-heading)" }}
        >
          ¡Gracias, {name}! 💛
        </p>
        <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "var(--prem-dark-muted)" }}>
          La Dra. Medrano revisará tu reseña. Tu opinión ayuda a otras pacientes a confiar en el proceso.
        </p>
      </div>
    </m.div>
  )
}

// ── Inline error state (full screen, for dead-link after submit) ──────────────
function InlineErrorState({ reason }: { reason: string }) {
  const copy = INVITE_REASON_COPY[reason] ?? INVITE_REASON_COPY.not_found
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-14 text-center">
      <Image
        src="/images/logo_dra_yasmin_cursiva.png"
        alt="Dra. Yasmin Medrano"
        width={180}
        height={72}
        className="h-auto w-36 opacity-90"
      />
      <div className="w-10 h-px" style={{ backgroundColor: GOLD }} />
      <h2
        className="text-2xl font-bold"
        style={{ color: "var(--prem-dark-fg)", fontFamily: "var(--font-heading)" }}
      >
        {copy.title}
      </h2>
      <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--prem-dark-muted)" }}>
        {copy.message}
      </p>
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
interface InviteReviewFormProps {
  token: string
  patientName: string
  treatments: string[]
}

export function InviteReviewForm({
  token,
  patientName,
  treatments,
}: InviteReviewFormProps) {
  const reduced = useReducedMotion() ?? false

  const [rating, setRating] = useState(0)
  const [treatment, setTreatment] = useState("")
  const [customTreatment, setCustomTreatment] = useState("")
  const [body, setBody] = useState("")

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [deadReason, setDeadReason] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  function showToast(type: ToastType, message: string) {
    setToast({ type, message })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  const isOther = treatment === "__other__"
  const charsLeft = MAX_BODY - body.length
  const effectiveTreatment = isOther ? customTreatment.trim() || null : treatment || null
  const canSubmit = rating > 0 && body.trim().length >= MIN_BODY

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setError("Selecciona una calificación.")
      return
    }
    if (body.trim().length < MIN_BODY) {
      setError(`Tu reseña debe tener al menos ${MIN_BODY} caracteres.`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/reviews/invites/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          treatment: effectiveTreatment,
          body: body.trim(),
        }),
      })

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}))
        const reason = (data?.reason as string) ?? "used"
        showToast("error", "Este enlace ya no está disponible.")
        setDeadReason(reason)
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data?.error ?? "Ocurrió un error. Intenta de nuevo."
        setError(msg)
        showToast("error", msg)
        return
      }

      showToast("success", "Reseña enviada")
      setSubmitted(true)
    } catch {
      const msg = "Error de conexión. Verifica tu internet e intenta de nuevo."
      setError(msg)
      showToast("error", msg)
    } finally {
      setLoading(false)
    }
  }

  const EASE = [0.16, 1, 0.3, 1] as const
  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  }
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }
  const stagger = reduced
    ? {}
    : { initial: "hidden" as const, animate: "show" as const, variants: containerVariants }
  const item = reduced ? {} : { variants: itemVariants }

  return (
    <>
      <AnimatePresence>
        {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      <main
        className="min-h-dvh w-full lg:grid lg:grid-cols-2"
        style={{ backgroundColor: "var(--prem-dark)" }}
      >
        {/* ── LEFT PANEL — brand (desktop) ─────────────────────────────────── */}
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12">
          {/* Photo + gradient overlay */}
          <div className="absolute inset-0" aria-hidden="true">
            <m.div
              className="absolute inset-0"
              initial={reduced ? false : { scale: 1.08 }}
              animate={reduced ? {} : { scale: 1 }}
              transition={{ duration: 12, ease: "easeOut" }}
            >
              <Image
                src="/images/draMedrano2.jpeg"
                alt=""
                fill
                priority
                sizes="50vw"
                className="object-cover object-top"
              />
            </m.div>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(58,15,32,0.55) 0%, rgba(58,15,32,0.78) 55%, rgba(20,8,12,0.96) 100%)",
              }}
            />
          </div>

          {/* Top — logo */}
          <m.div
            className="relative"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/images/logo_dra_yasmin_cursiva.png"
              alt="Dra. Yasmin Medrano"
              width={220}
              height={88}
              className="h-auto w-44"
            />
          </m.div>

          {/* Bottom — greeting */}
          <m.div
            className="relative"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="prem-eyebrow" style={{ color: "var(--vintage-gold-light)" }}>
              INVITACIÓN PERSONAL · DRA. YASMIN MEDRANO
            </p>
            <h1
              className="text-4xl xl:text-5xl font-bold leading-tight mb-4"
              style={{ color: "#fff", fontFamily: "var(--font-heading)" }}
            >
              Hola, {patientName} <span style={{ color: GOLD }}>✦</span>
            </h1>
            <p className="text-base leading-relaxed max-w-sm mb-6" style={{ color: "rgba(255,255,255,0.82)" }}>
              Tu opinión vale oro. Cuéntanos cómo te fue — nos tomará menos de un minuto.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} fill={GOLD} style={{ color: GOLD }} strokeWidth={0} />
                ))}
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--vintage-gold-light)" }}>
                5.0
              </span>
            </div>
          </m.div>
        </aside>

        {/* ── RIGHT PANEL — form ───────────────────────────────────────────── */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:py-14">
          <div className="w-full max-w-lg">
            {/* Mobile header */}
            <div className="lg:hidden mb-8 text-center">
              <Image
                src="/images/logo_dra_yasmin_cursiva.png"
                alt="Dra. Yasmin Medrano"
                width={180}
                height={72}
                className="h-auto w-36 mx-auto mb-5"
                priority
              />
              <p className="prem-eyebrow" style={{ color: "var(--vintage-gold-light)" }}>
                INVITACIÓN PERSONAL
              </p>
              <h1
                className="text-3xl font-bold leading-tight"
                style={{ color: "var(--prem-dark-fg)", fontFamily: "var(--font-heading)" }}
              >
                Hola, {patientName} <span style={{ color: GOLD }}>✦</span>
              </h1>
            </div>

            {/* Form card */}
            <div
              className="p-6 sm:p-8"
              style={{
                backgroundColor: "var(--prem-dark-surf)",
                border: "1px solid rgba(184,151,59,0.25)",
                borderRadius: "2px",
                boxShadow: "0 20px 60px -20px rgba(184,151,59,0.18), 0 0 0 1px rgba(0,0,0,0.2)",
              }}
            >
              {deadReason ? (
                <InlineErrorState reason={deadReason} />
              ) : submitted ? (
                <SuccessState name={patientName} reduced={reduced} />
              ) : (
                <m.form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7" {...stagger}>
                  {/* Rating */}
                  <m.div {...item}>
                    <label
                      className="block text-xs uppercase tracking-widest mb-3 font-semibold"
                      style={{ color: "var(--prem-dark-muted)" }}
                    >
                      <span style={{ color: GOLD }}>✦</span> Calificación
                    </label>
                    <StarPicker
                      value={rating}
                      reduced={reduced}
                      onChange={(v) => {
                        setRating(v)
                        if (error) setError(null)
                      }}
                    />
                    <AnimatePresence mode="wait">
                      {rating > 0 && (
                        <m.p
                          key={rating}
                          initial={reduced ? false : { opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduced ? undefined : { opacity: 0 }}
                          className="text-sm mt-3 font-medium"
                          style={{ color: "var(--vintage-gold-light)" }}
                        >
                          {RATING_COPY[rating]}
                        </m.p>
                      )}
                    </AnimatePresence>
                  </m.div>

                  {/* Treatment select */}
                  <m.div {...item}>
                    <label
                      htmlFor="treatment"
                      className="block text-xs uppercase tracking-widest mb-2 font-semibold"
                      style={{ color: "var(--prem-dark-muted)" }}
                    >
                      Tratamiento recibido
                    </label>
                    <select
                      id="treatment"
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-base outline-none transition cursor-pointer"
                      style={{
                        backgroundColor: "var(--primary-darkest)",
                        border: "1px solid var(--primary-darker)",
                        color: treatment ? "white" : "var(--gray-mid)",
                        borderRadius: "2px",
                      }}
                      onFocus={focusRing}
                      onBlur={blurRing}
                    >
                      <option value="" style={{ color: "var(--gray-mid)" }}>
                        Selecciona un tratamiento (opcional)
                      </option>
                      {treatments.map((t) => (
                        <option key={t} value={t} style={{ color: "white", backgroundColor: "var(--primary-darkest)" }}>
                          {t}
                        </option>
                      ))}
                      <option value="__other__" style={{ color: "white", backgroundColor: "var(--primary-darkest)" }}>
                        Otros
                      </option>
                    </select>

                    <AnimatePresence>
                      {isOther && (
                        <m.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: "hidden" }}
                        >
                          <input
                            type="text"
                            maxLength={150}
                            value={customTreatment}
                            onChange={(e) => setCustomTreatment(e.target.value)}
                            placeholder="¿Cuál tratamiento?"
                            className="w-full px-4 py-3 text-base text-white placeholder-[var(--gray-mid)] outline-none transition"
                            style={{
                              backgroundColor: "var(--primary-darkest)",
                              border: "1px solid var(--primary-darker)",
                              borderRadius: "2px",
                            }}
                            onFocus={focusRing}
                            onBlur={blurRing}
                          />
                        </m.div>
                      )}
                    </AnimatePresence>
                  </m.div>

                  {/* Comment */}
                  <m.div {...item}>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="body"
                        className="block text-xs uppercase tracking-widest font-semibold"
                        style={{ color: "var(--prem-dark-muted)" }}
                      >
                        Tu experiencia <span aria-hidden="true" style={{ color: GOLD }}>*</span>
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
                      required
                      minLength={MIN_BODY}
                      maxLength={MAX_BODY}
                      rows={5}
                      value={body}
                      onChange={(e) => {
                        setBody(e.target.value)
                        if (error) setError(null)
                      }}
                      placeholder="Cuéntanos cómo fue tu experiencia con la Dra. Medrano..."
                      className="w-full px-4 py-3 text-base text-white placeholder-[var(--gray-mid)] outline-none transition resize-none"
                      style={{
                        backgroundColor: "var(--primary-darkest)",
                        border: "1px solid var(--primary-darker)",
                        borderRadius: "2px",
                      }}
                      onFocus={focusRing}
                      onBlur={blurRing}
                    />
                    <p className="text-xs mt-1.5" style={{ color: "var(--gray-mid)" }}>
                      Mínimo {MIN_BODY} caracteres · No incluyas información médica privada.
                    </p>
                  </m.div>

                  {/* Error */}
                  {error && (
                    <m.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      aria-live="assertive"
                      className="text-sm font-medium"
                      style={{ color: "#f87171" }}
                    >
                      {error}
                    </m.p>
                  )}

                  {/* Submit */}
                  <m.div {...item}>
                    <button
                      type="submit"
                      disabled={loading || !canSubmit}
                      className="invite-submit group relative flex items-center justify-center gap-2 w-full py-4 text-sm font-bold uppercase overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
                        color: "white",
                        letterSpacing: "0.15em",
                        borderRadius: "2px",
                      }}
                    >
                      {!reduced && !loading && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                          }}
                        />
                      )}
                      {loading ? (
                        <svg
                          className="animate-spin relative"
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
                        <Star size={16} fill="white" style={{ color: "white" }} className="relative" />
                      )}
                      <span className="relative">{loading ? "Enviando…" : "Enviar mi reseña"}</span>
                    </button>
                  </m.div>
                </m.form>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
