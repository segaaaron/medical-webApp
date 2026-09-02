"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  m,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Star, CheckCircle, XCircle } from "lucide-react";
import { INVITE_REASON_COPY } from "@/lib/invite-copy";
import {
  MIN_REVIEW_BODY,
  MAX_REVIEW_BODY,
  SWEET_REVIEW_BODY,
} from "@/lib/review-limits";

const GOLD = "var(--vintage-gold)";
const GOLD_DARK = "var(--vintage-gold-dark)";

/** Contraste legible sobre --prem-dark-surf (los tokens muted quedaban bajo AA). */
const LABEL_FG = "rgba(255,255,255,0.82)";
const HELP_FG = "rgba(255,255,255,0.72)";

const MAX_BODY = MAX_REVIEW_BODY;
const MIN_BODY = MIN_REVIEW_BODY;

function focusRing(e: React.FocusEvent<HTMLElement>) {
  (e.target as HTMLElement).style.boxShadow = "0 0 0 2px rgba(184,151,59,0.45)";
  (e.target as HTMLElement).style.borderColor = "rgba(184,151,59,0.6)";
}
function blurRing(e: React.FocusEvent<HTMLElement>) {
  (e.target as HTMLElement).style.boxShadow = "none";
  (e.target as HTMLElement).style.borderColor = "rgba(184,151,59,0.28)";
}

// ── Rating microcopy ─────────────────────────────────────────────────────────
const RATING_COPY: Record<number, string> = {
  1: "Lamentamos que tu experiencia no fuera la esperada.",
  2: "Lamentamos que tu experiencia no fuera la esperada.",
  3: "Gracias por tu honestidad.",
  4: "¡Nos alegra que te haya gustado!",
  5: "¡Excelente! ✨",
};

// ── Toast notification ───────────────────────────────────────────────────────
type ToastType = "success" | "error";
interface ToastState {
  type: ToastType;
  message: string;
  /** Explicación concreta de por qué falló. */
  detail?: string;
  /** Código técnico (HTTP o interno) para soporte. */
  code?: string;
}

/**
 * Traduce cualquier fallo del submit a un mensaje exacto para la paciente.
 * `message` = qué pasó · `detail` = qué hacer · `code` = qué reportar.
 */
function describeSubmitError(
  status: number,
  data: Record<string, unknown>,
): { message: string; detail: string; code: string } {
  const backendMsg = typeof data?.error === "string" ? data.error : null;

  switch (status) {
    case 400:
      return {
        message: backendMsg ?? "Los datos de la reseña no son válidos.",
        detail: `Revisa que hayas elegido una calificación y que tu texto tenga entre ${MIN_REVIEW_BODY} y ${MAX_REVIEW_BODY} caracteres.`,
        code: "400",
      };
    case 403:
      return {
        message: "La solicitud fue bloqueada por seguridad.",
        detail:
          "Recarga la página desde el enlace original que te enviamos y vuelve a intentarlo.",
        code: "403 CSRF",
      };
    case 404:
      return {
        message: "No encontramos esta invitación.",
        detail: "Verifica que el enlace esté completo, sin cortes al copiarlo.",
        code: "404",
      };
    case 429:
      return {
        message: backendMsg ?? "Demasiados intentos seguidos.",
        detail: "Espera un minuto y vuelve a enviar tu reseña.",
        code: "429",
      };
    case 413:
      return {
        message: "Tu reseña es demasiado larga.",
        detail: `El máximo son ${MAX_REVIEW_BODY} caracteres.`,
        code: "413",
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        message: "Nuestro servidor no pudo procesar tu reseña.",
        detail:
          "No es culpa tuya — tu texto no se perdió. Espera unos minutos e intenta de nuevo.",
        code: `${status}`,
      };
    default:
      return {
        message:
          backendMsg ?? "Ocurrió un error inesperado al enviar tu reseña.",
        detail: "Intenta de nuevo. Si persiste, avísale a la Dra. Medrano.",
        code: `${status}`,
      };
  }
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastState;
  onDismiss: () => void;
}) {
  const isSuccess = toast.type === "success";
  return (
    <m.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      role="alert"
      aria-live="assertive"
      className="fixed top-5 left-1/2 z-50 flex items-start gap-3 px-5 py-3.5 rounded-2xl shadow-xl"
      style={{
        transform: "translateX(-50%)",
        backgroundColor: isSuccess ? "#052e16" : "#2d0a0a",
        border: `1px solid ${isSuccess ? "#16a34a" : "#ef4444"}`,
        minWidth: "260px",
        maxWidth: "min(92vw, 30rem)",
      }}
    >
      {isSuccess ? (
        <CheckCircle
          size={18}
          style={{ color: "#4ade80", flexShrink: 0, marginTop: 2 }}
        />
      ) : (
        <XCircle
          size={18}
          style={{ color: "#f87171", flexShrink: 0, marginTop: 2 }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{ color: isSuccess ? "#86efac" : "#fca5a5" }}
        >
          {toast.message}
        </p>
        {toast.detail && (
          <p
            className="text-xs mt-1 leading-relaxed"
            style={{
              color: isSuccess
                ? "rgba(134,239,172,0.8)"
                : "rgba(252,165,165,0.85)",
            }}
          >
            {toast.detail}
          </p>
        )}
        {toast.code && (
          <p
            className="text-[10px] mt-1.5 font-mono"
            style={{ color: "rgba(252,165,165,0.55)" }}
          >
            código {toast.code}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="shrink-0 text-lg leading-none px-1"
        style={{
          color: isSuccess ? "rgba(134,239,172,0.7)" : "rgba(252,165,165,0.7)",
        }}
      >
        ×
      </button>
    </m.div>
  );
}

// ── Interactive star rating (size 42, spring scale + glow) ────────────────────
function StarPicker({
  value,
  onChange,
  reduced,
}: {
  value: number;
  onChange: (v: number) => void;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered > 0 ? hovered : value;

  return (
    <div
      className="flex gap-2.5"
      role="radiogroup"
      aria-required="true"
      aria-label="Calificación (obligatorio)"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= active;
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
            style={{
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <m.span
              animate={reduced ? {} : { scale: isActive ? 1.15 : 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 16 }}
              style={{ display: "inline-flex" }}
            >
              <Star
                size={42}
                fill={isActive ? GOLD : "rgba(255,255,255,0.08)"}
                style={{
                  color: isActive ? GOLD : "#ffffff",
                  transition: "color 140ms, fill 140ms, filter 140ms",
                  filter: isActive
                    ? "drop-shadow(0 0 7px rgba(184,151,59,0.55))"
                    : "drop-shadow(0 0 2px rgba(0,0,0,0.5))",
                }}
                strokeWidth={2}
              />
            </m.span>
          </button>
        );
      })}
    </div>
  );
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
            style={{
              background:
                "radial-gradient(circle, rgba(184,151,59,0.25) 0%, transparent 70%)",
            }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.4, opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}
        <svg
          width="80"
          height="80"
          viewBox="0 0 64 64"
          fill="none"
          className="relative"
        >
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
            style={
              {
                transformOrigin: "32px 32px",
                rotate: "-90deg",
              } as React.CSSProperties
            }
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
          style={{
            color: "var(--prem-dark-fg)",
            fontFamily: "var(--font-heading)",
          }}
        >
          ¡Gracias, {name}! 💛
        </p>
        <p
          className="text-sm leading-relaxed max-w-xs mx-auto"
          style={{ color: LABEL_FG }}
        >
          La Dra. Medrano revisará tu reseña. Tu opinión ayuda a otras pacientes
          a confiar en el proceso.
        </p>
      </div>
    </m.div>
  );
}

// ── Inline error state (full screen, for dead-link after submit) ──────────────
function InlineErrorState({ reason }: { reason: string }) {
  const copy = INVITE_REASON_COPY[reason] ?? INVITE_REASON_COPY.not_found;
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
        style={{
          color: "var(--prem-dark-fg)",
          fontFamily: "var(--font-heading)",
        }}
      >
        {copy.title}
      </h2>
      <p
        className="text-sm leading-relaxed max-w-sm"
        style={{ color: LABEL_FG }}
      >
        {copy.message}
      </p>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
interface InviteReviewFormProps {
  token: string;
  patientName: string;
  treatments: string[];
}

export function InviteReviewForm({
  token,
  patientName,
  treatments,
}: InviteReviewFormProps) {
  const reduced = useReducedMotion() ?? false;

  const [rating, setRating] = useState(0);
  const [treatment, setTreatment] = useState("");
  const [customTreatment, setCustomTreatment] = useState("");
  const [body, setBody] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deadReason, setDeadReason] = useState<string | null>(null);
  const [error, setError] = useState<{
    message: string;
    detail?: string;
    code?: string;
  } | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(
    type: ToastType,
    message: string,
    detail?: string,
    code?: string,
  ) {
    setToast({ type, message, detail, code });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    // Los errores necesitan tiempo de lectura; el éxito no.
    toastTimer.current = setTimeout(
      () => setToast(null),
      type === "error" ? 9000 : 4000,
    );
  }

  function fail(message: string, detail?: string, code?: string) {
    setError({ message, detail, code });
    showToast("error", message, detail, code);
  }

  const isOther = treatment === "__other__";
  const charsLeft = MAX_BODY - body.length;
  const effectiveTreatment = isOther
    ? customTreatment.trim() || null
    : treatment || null;
  const bodyLen = body.trim().length;
  const canSubmit = rating > 0 && bodyLen >= MIN_BODY;
  const missing: string[] = [];
  if (rating === 0) missing.push("elige una calificación");
  if (bodyLen < MIN_BODY)
    missing.push(`escribe ${MIN_BODY - bodyLen} caracteres más`);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      fail(
        "Falta tu calificación.",
        "Toca una de las 5 estrellas antes de enviar.",
      );
      return;
    }
    if (bodyLen < MIN_BODY) {
      fail(
        `Tu reseña es muy corta: ${bodyLen} de ${MIN_BODY} caracteres mínimos.`,
        `Escribe ${MIN_BODY - bodyLen} caracteres más para poder enviarla.`,
      );
      return;
    }
    if (body.length > MAX_BODY) {
      fail(
        `Tu reseña excede el máximo: ${body.length} de ${MAX_BODY} caracteres.`,
        `Recorta ${body.length - MAX_BODY} caracteres.`,
      );
      return;
    }
    if (isOther && !customTreatment.trim()) {
      fail(
        "Falta especificar el tratamiento.",
        'Elegiste "Otros" — escribe cuál tratamiento recibiste o cambia la selección.',
      );
      return;
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      fail(
        "No tienes conexión a internet.",
        "Reconéctate y vuelve a enviar. Tu texto sigue aquí.",
        "OFFLINE",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/reviews/invites/public/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          treatment: effectiveTreatment,
          body: body.trim(),
        }),
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        const reason = (data?.reason as string) ?? "used";
        const copy = INVITE_REASON_COPY[reason] ?? INVITE_REASON_COPY.not_found;
        showToast("error", copy.title, copy.message, `409 ${reason}`);
        setDeadReason(reason);
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        const { message, detail, code } = describeSubmitError(res.status, data);
        fail(message, detail, code);
        return;
      }

      showToast("success", "Reseña enviada");
      setSubmitted(true);
    } catch (err) {
      // fetch() solo rechaza por red/CORS/abort — nunca por status HTTP.
      const reason = err instanceof Error ? err.message : String(err);
      fail(
        "No pudimos conectar con el servidor.",
        "Revisa tu conexión a internet y vuelve a intentarlo. Tu reseña no se perdió.",
        `NETWORK: ${reason.slice(0, 80)}`,
      );
    } finally {
      setLoading(false);
    }
  }

  const EASE = [0.16, 1, 0.3, 1] as const;
  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  };
  const stagger = reduced
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: containerVariants,
      };
  const item = reduced ? {} : { variants: itemVariants };

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
            <p
              className="prem-eyebrow"
              style={{ color: "var(--vintage-gold-light)" }}
            >
              INVITACIÓN PERSONAL · DRA. YASMIN MEDRANO
            </p>
            <h1
              className="text-4xl xl:text-5xl font-bold leading-tight mb-4"
              style={{ color: "#fff", fontFamily: "var(--font-heading)" }}
            >
              Hola, {patientName} <span style={{ color: GOLD }}>✦</span>
            </h1>
            <p
              className="text-base leading-relaxed max-w-sm mb-6"
              style={{ color: "rgba(255,255,255,0.82)" }}
            >
              Tu opinión vale oro. Cuéntanos cómo te fue — nos tomará menos de
              un minuto.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    fill={GOLD}
                    style={{ color: GOLD }}
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--vintage-gold-light)" }}
              >
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
              <p
                className="prem-eyebrow"
                style={{ color: "var(--vintage-gold-light)" }}
              >
                INVITACIÓN PERSONAL
              </p>
              <h1
                className="text-3xl font-bold leading-tight"
                style={{
                  color: "var(--prem-dark-fg)",
                  fontFamily: "var(--font-heading)",
                }}
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
                boxShadow:
                  "0 20px 60px -20px rgba(184,151,59,0.18), 0 0 0 1px rgba(0,0,0,0.2)",
              }}
            >
              {deadReason ? (
                <InlineErrorState reason={deadReason} />
              ) : submitted ? (
                <SuccessState name={patientName} reduced={reduced} />
              ) : (
                <m.form
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-7"
                  {...stagger}
                >
                  {/* Rating */}
                  <m.div {...item}>
                    <div className="flex items-center justify-between mb-3">
                      <label
                        className="block text-xs uppercase tracking-widest font-semibold"
                        style={{
                          color:
                            rating === 0 ? "var(--prem-dark-fg)" : LABEL_FG,
                        }}
                      >
                        <span style={{ color: GOLD }}>✦</span> Calificación{" "}
                        <span aria-hidden="true" style={{ color: GOLD }}>
                          *
                        </span>
                      </label>
                      {rating === 0 && (
                        <span
                          className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5"
                          style={{
                            color: "var(--vintage-gold-light)",
                            border: "1px solid rgba(184,151,59,0.45)",
                            borderRadius: "2px",
                          }}
                        >
                          Obligatorio
                        </span>
                      )}
                    </div>
                    <StarPicker
                      value={rating}
                      reduced={reduced}
                      onChange={(v) => {
                        setRating(v);
                        if (error) setError(null);
                      }}
                    />
                    {/* Un solo <p> con key para el fade: dentro de un padre con variants,
                        AnimatePresence dejaba la opacidad a medio camino. */}
                    <p
                      key={rating}
                      className={`text-sm mt-3 ${rating === 0 ? "" : "font-medium"}`}
                      style={{
                        color:
                          rating === 0
                            ? "var(--prem-dark-fg)"
                            : "var(--vintage-gold-light)",
                      }}
                    >
                      {rating === 0
                        ? "Toca las estrellas para calificar tu experiencia."
                        : RATING_COPY[rating]}
                    </p>
                  </m.div>

                  {/* Treatment select */}
                  <m.div {...item}>
                    <label
                      htmlFor="treatment"
                      className="block text-xs uppercase tracking-widest mb-2 font-semibold"
                      style={{ color: LABEL_FG }}
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
                        border: "1px solid rgba(184,151,59,0.28)",
                        color: treatment ? "white" : "rgba(255,255,255,0.55)",
                        borderRadius: "2px",
                        colorScheme: "dark",
                      }}
                      onFocus={focusRing}
                      onBlur={blurRing}
                    >
                      <option
                        value=""
                        style={{ color: "#c9c2c6", backgroundColor: "#2a0b18" }}
                      >
                        Selecciona un tratamiento (opcional)
                      </option>
                      {treatments.map((t) => (
                        <option
                          key={t}
                          value={t}
                          style={{
                            color: "#ffffff",
                            backgroundColor: "#2a0b18",
                          }}
                        >
                          {t}
                        </option>
                      ))}
                      <option
                        value="__other__"
                        style={{ color: "#ffffff", backgroundColor: "#2a0b18" }}
                      >
                        Otros
                      </option>
                    </select>

                    <AnimatePresence>
                      {isOther && (
                        <m.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                            marginTop: 12,
                          }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{
                            duration: 0.25,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          style={{ overflow: "hidden" }}
                        >
                          <input
                            type="text"
                            maxLength={150}
                            value={customTreatment}
                            onChange={(e) => setCustomTreatment(e.target.value)}
                            placeholder="¿Cuál tratamiento?"
                            className="w-full px-4 py-3 text-base text-white placeholder-[rgba(255,255,255,0.42)] outline-none transition"
                            style={{
                              backgroundColor: "var(--primary-darkest)",
                              border: "1px solid rgba(184,151,59,0.28)",
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
                    <label
                      htmlFor="body"
                      className="block text-xs uppercase tracking-widest font-semibold mb-2"
                      style={{ color: LABEL_FG }}
                    >
                      Tu experiencia{" "}
                      <span aria-hidden="true" style={{ color: GOLD }}>
                        *
                      </span>
                    </label>
                    <textarea
                      id="body"
                      required
                      minLength={MIN_BODY}
                      maxLength={MAX_BODY}
                      rows={5}
                      value={body}
                      onChange={(e) => {
                        setBody(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Cuéntanos cómo fue tu experiencia con la Dra. Medrano..."
                      className="w-full px-4 py-3 text-base text-white placeholder-[rgba(255,255,255,0.42)] outline-none transition resize-none"
                      style={{
                        backgroundColor: "var(--primary-darkest)",
                        border: "1px solid rgba(184,151,59,0.28)",
                        borderRadius: "2px",
                      }}
                      onFocus={focusRing}
                      onBlur={blurRing}
                    />
                    <div className="flex items-start justify-between gap-3 mt-2">
                      <p
                        className="text-xs"
                        style={{
                          color:
                            bodyLen > 0 && bodyLen < MIN_BODY ? GOLD : HELP_FG,
                        }}
                      >
                        {bodyLen === 0
                          ? `Entre ${MIN_BODY} y ${MAX_BODY} caracteres · No incluyas información médica privada.`
                          : bodyLen < MIN_BODY
                            ? `Faltan ${MIN_BODY - bodyLen} caracteres para poder enviar.`
                            : bodyLen < SWEET_REVIEW_BODY
                              ? `Ya puedes enviar. Con ${SWEET_REVIEW_BODY}+ caracteres tu reseña ayuda mucho más a otras pacientes.`
                              : "Perfecto · No incluyas información médica privada."}
                      </p>
                      <span
                        className="text-xs tabular-nums shrink-0"
                        aria-label={`${body.length} de ${MAX_BODY} caracteres`}
                        style={{
                          color:
                            charsLeft < 50
                              ? "#f87171"
                              : bodyLen >= MIN_BODY
                                ? "var(--vintage-gold-light)"
                                : HELP_FG,
                        }}
                      >
                        {body.length}/{MAX_BODY}
                      </span>
                    </div>
                  </m.div>

                  {/* Error */}
                  {error && (
                    <m.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      aria-live="assertive"
                      className="px-4 py-3"
                      style={{
                        backgroundColor: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.35)",
                        borderRadius: "2px",
                      }}
                    >
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#f87171" }}
                      >
                        {error.message}
                      </p>
                      {error.detail && (
                        <p
                          className="text-xs mt-1 leading-relaxed"
                          style={{ color: "rgba(248,113,113,0.85)" }}
                        >
                          {error.detail}
                        </p>
                      )}
                      {error.code && (
                        <p
                          className="text-[10px] mt-1.5 font-mono"
                          style={{ color: "rgba(248,113,113,0.55)" }}
                        >
                          código {error.code}
                        </p>
                      )}
                    </m.div>
                  )}

                  {/* Submit */}
                  <m.div {...item}>
                    <m.div
                      animate={
                        reduced ? {} : { scale: canSubmit ? [1, 1.03, 1] : 1 }
                      }
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <button
                        type="submit"
                        disabled={loading || !canSubmit}
                        aria-describedby="submit-hint"
                        className="invite-submit group relative flex items-center justify-center gap-2 w-full py-4 text-sm font-bold uppercase overflow-hidden transition-all disabled:cursor-not-allowed"
                        style={
                          canSubmit || loading
                            ? {
                                background: `linear-gradient(135deg, var(--vintage-gold-light) 0%, ${GOLD} 45%, ${GOLD_DARK} 100%)`,
                                color: "#2a0b18",
                                letterSpacing: "0.15em",
                                borderRadius: "2px",
                                boxShadow:
                                  "0 0 0 1px rgba(212,180,131,0.6), 0 8px 28px -8px rgba(184,151,59,0.75)",
                              }
                            : {
                                background: "transparent",
                                color: "rgba(255,255,255,0.55)",
                                border: "1px solid rgba(184,151,59,0.35)",
                                letterSpacing: "0.15em",
                                borderRadius: "2px",
                              }
                        }
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
                          <Star
                            size={16}
                            fill={canSubmit ? "#2a0b18" : "none"}
                            style={{
                              color: canSubmit
                                ? "#2a0b18"
                                : "rgba(184,151,59,0.7)",
                            }}
                            className="relative"
                          />
                        )}
                        <span className="relative">
                          {loading ? "Enviando…" : "Enviar mi reseña"}
                        </span>
                      </button>
                    </m.div>
                    <p
                      id="submit-hint"
                      className="text-xs mt-2 text-center"
                      style={{
                        color: canSubmit
                          ? HELP_FG
                          : "var(--vintage-gold-light)",
                      }}
                      aria-live="polite"
                    >
                      {canSubmit
                        ? "Listo para enviar."
                        : `Para activar el botón: ${missing.join(" y ")}.`}
                    </p>
                  </m.div>
                </m.form>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
