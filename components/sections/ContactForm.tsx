"use client"

import { useState } from "react"
import { m } from "framer-motion"
import { Send } from "lucide-react"
import Link from "next/link"
import { useWhatsApp } from "@/components/providers/WhatsAppProvider"
import { trackLead, trackWhatsAppClick } from "@/lib/analytics"

/**
 * Opción final del desplegable, siempre presente: cubre a quien no sabe qué
 * tratamiento necesita, que es la mayoría en una primera consulta.
 */
const OPCION_GENERAL = "Otro / Consulta general"

/**
 * Respaldo mínimo si el backend no responde. Solo tratamientos que el
 * consultorio presta de verdad: la lista anterior ofrecía «Armonización
 * Facial» y «Depilación Láser», así que un paciente podía pedir cita para algo
 * que no existe.
 */
const TREATMENTS_FALLBACK = [OPCION_GENERAL]

const GOLD = "var(--vintage-gold)"

function focusRing(e: React.FocusEvent<HTMLElement>) {
  (e.target as HTMLElement).style.boxShadow = "0 0 0 2px rgba(184,151,59,0.45)"
}
function blurRing(e: React.FocusEvent<HTMLElement>) {
  (e.target as HTMLElement).style.boxShadow = "none"
}

export function ContactForm({ treatments }: { treatments?: string[] }) {
  // Del panel cuando hay datos; si no, solo la consulta general.
  const TREATMENTS =
    treatments && treatments.length > 0
      ? [...treatments, OPCION_GENERAL]
      : TREATMENTS_FALLBACK

  // WhatsApp del panel (Dashboard → Contacto), no la constante de respaldo.
  const { url: whatsappUrl } = useWhatsApp()
  const [form, setForm] = useState({ name: "", phone: "", treatment: "", message: "", preferredDate: "", website: "" })
  const [sent, setSent] = useState(false)
  /**
   * El POST del lead falló.
   *
   * No se puede esperar (`await`) a esa respuesta antes de `window.open`: el
   * navegador bloquea la ventana emergente si la apertura no es síncrona con
   * el clic, y eso rompería el canal principal del consultorio. Esa decisión
   * es correcta y se queda.
   *
   * Lo que estaba mal era otra cosa: `setSent(true)` se ejecutaba pase lo que
   * pase, así que si el lead no llegaba a guardarse la paciente leía
   * «¡Mensaje enviado!» igualmente y el consultorio nunca se enteraba de esa
   * consulta. Ahora el resultado se recoge cuando llega y, si falló, la
   * pantalla de confirmación lo dice y ofrece el enlace directo.
   */
  const [leadFallo, setLeadFallo] = useState(false)
  const [acepta, setAcepta] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = [
      `Hola, mi nombre es *${form.name}*.`,
      form.treatment ? `Me interesa el tratamiento de *${form.treatment}*.` : "",
      form.phone ? `Mi número de contacto es: ${form.phone}.` : "",
      form.preferredDate ? `Quisiera una cita el ${form.preferredDate}.` : "",
      form.message ? `Mensaje: ${form.message}` : "",
    ]
      .filter(Boolean)
      .join(" ")

    // Persist the lead before redirecting — fire-and-forget with keepalive so
    // the request survives the navigation. window.open must stay synchronous
    // (awaiting here would trigger popup blockers).
    // Sigue siendo «dispara y olvida» respecto a `window.open`, que no se puede
    // demorar. Pero el resultado YA no se descarta: cuando llega, si falló, se
    // refleja en pantalla.
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, source: "contact-form" }),
      keepalive: true,
    })
      .then((r) => {
        if (!r.ok) setLeadFallo(true)
      })
      .catch(() => setLeadFallo(true))

    trackLead({ treatment: form.treatment, source: "contact-form" })
    trackWhatsAppClick("contact-form")

    window.open(`${whatsappUrl}?text=${encodeURIComponent(text)}`, "_blank")
    setForm({ name: "", phone: "", treatment: "", message: "", preferredDate: "", website: "" })
    setSent(true)
  }

  if (sent) {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center gap-5 py-10 text-center"
      >
        {/* Drawn-circle check animation */}
        <div className="relative w-16 h-16" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <m.circle
              cx="32" cy="32" r="22"
              stroke={GOLD} strokeWidth="2"
              fill="rgba(184,151,59,0.08)"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "32px 32px", rotate: "-90deg" } as React.CSSProperties}
            />
            <m.path
              d="M21 32 L28 39 L43 25"
              stroke={GOLD} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
        </div>
        {/* `role="status"`: un lector de pantalla anuncia el cambio sin que la
            paciente tenga que ir a buscarlo. */}
        <div role="status" aria-live="polite">
          {leadFallo ? (
            <>
              <p className="text-white font-bold text-lg mb-1">
                Continúa por WhatsApp
              </p>
              <p className="text-sm" style={{ color: "var(--meteorite)" }}>
                No pudimos guardar tus datos en el consultorio, así que
                escríbenos directamente por WhatsApp para que no se pierda tu
                consulta.
              </p>
            </>
          ) : (
            <>
              <p className="text-white font-bold text-lg mb-1">¡Mensaje enviado!</p>
              <p className="text-sm" style={{ color: "var(--meteorite)" }}>
                Te redirigimos a WhatsApp para continuar la conversación.
              </p>
            </>
          )}
        </div>

        {/* Enlace visible SIEMPRE, no solo cuando algo falla.
            `window.open` puede quedar bloqueado por el navegador, y entonces la
            paciente veía la confirmación sin que WhatsApp se hubiera abierto:
            creía haber contactado al consultorio y no lo había hecho. Un <a>
            real es la salida que no depende de ninguna ventana emergente. */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:brightness-110"
          style={{ backgroundColor: GOLD, color: "var(--primary-darkest)" }}
        >
          <Send size={15} aria-hidden="true" />
          Abrir WhatsApp
        </a>
        <button
          onClick={() => {
            // Reiniciar TAMBIÉN el fallo: sin esto, si el primer envío no se
            // guardó y el segundo sí, la paciente seguía viendo el mensaje de
            // error sobre un envío que esta vez sí llegó.
            setLeadFallo(false)
            setSent(false)
          }}
          className="text-xs underline mt-1 hover:opacity-70 transition-opacity"
          style={{ color: GOLD }}
        >
          Enviar otro mensaje
        </button>
      </m.div>
    )
  }

  return (
    <m.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4"
    >
      {/* Honeypot anti-spam: hidden from real users, bots fill it */}
      <input
        type="text" name="website" tabIndex={-1} autoComplete="off"
        value={form.website} onChange={handleChange}
        className="absolute opacity-0 pointer-events-none h-0 w-0"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="campo-nombre" className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "var(--meteorite)" }}>
          Nombre *
        </label>
        <input
          id="campo-nombre" type="text" name="name" required autoComplete="name" aria-required="true"
          value={form.name} onChange={handleChange}
          placeholder="Tu nombre completo"
          className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[var(--gray-mid)] outline-none transition"
          style={{ backgroundColor: "var(--primary-darkest)", border: "1px solid var(--primary-darker)" }}
          onFocus={focusRing} onBlur={blurRing}
        />
      </div>

      <div>
        <label htmlFor="campo-telefono" className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "var(--meteorite)" }}>
          Teléfono / WhatsApp
        </label>
        <input
          id="campo-telefono" type="tel" name="phone" autoComplete="tel" inputMode="tel"
          value={form.phone} onChange={handleChange}
          placeholder="Ej: 70000000"
          className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[var(--gray-mid)] outline-none transition"
          style={{ backgroundColor: "var(--primary-darkest)", border: "1px solid var(--primary-darker)" }}
          onFocus={focusRing} onBlur={blurRing}
        />
      </div>

      <div>
        <label htmlFor="campo-tratamiento" className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "var(--meteorite)" }}>
          Tratamiento de interés
        </label>
        <select
          id="campo-tratamiento" name="treatment"
          value={form.treatment} onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl text-base outline-none transition"
          style={{ backgroundColor: "var(--primary-darkest)", border: "1px solid var(--primary-darker)", color: form.treatment ? "white" : "var(--gray-mid)" }}
          onFocus={focusRing} onBlur={blurRing}
        >
          <option value="" style={{ color: "var(--gray-mid)" }}>Selecciona un tratamiento</option>
          {TREATMENTS.map((t) => (
            <option key={t} value={t} style={{ color: "white", backgroundColor: "var(--primary-darkest)" }}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="campo-fecha" className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "var(--meteorite)" }}>
          Fecha preferida para tu cita (opcional)
        </label>
        <input
          id="campo-fecha" type="date" name="preferredDate"
          value={form.preferredDate} onChange={handleChange}
          min={new Date().toISOString().slice(0, 10)}
          className="w-full px-4 py-3 rounded-xl text-base outline-none transition [color-scheme:dark]"
          style={{ backgroundColor: "var(--primary-darkest)", border: "1px solid var(--primary-darker)", color: form.preferredDate ? "white" : "var(--gray-mid)" }}
          onFocus={focusRing} onBlur={blurRing}
        />
      </div>

      <div>
        <label htmlFor="campo-mensaje" className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "var(--meteorite)" }}>
          Mensaje (opcional)
        </label>
        <textarea
          id="campo-mensaje" name="message"
          value={form.message} onChange={handleChange}
          rows={3} placeholder="Cuéntanos en qué podemos ayudarte..."
          className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[var(--gray-mid)] outline-none transition resize-none"
          style={{ backgroundColor: "var(--primary-darkest)", border: "1px solid var(--primary-darker)" }}
          onFocus={focusRing} onBlur={blurRing}
        />
      </div>

      {/* Consentimiento en el punto donde se recogen los datos.
          El formulario pide nombre, teléfono, tratamiento de interés y fecha —
          en un consultorio médico, el tratamiento de interés es un dato de
          salud—. La política de privacidad existía pero no se enlazaba desde
          aquí, que es el único momento en que la paciente decide. */}
      <div className="flex items-start gap-3 mt-1">
        <input
          id="campo-consentimiento"
          type="checkbox"
          name="consent"
          required
          aria-required="true"
          checked={acepta}
          onChange={(e) => setAcepta(e.target.checked)}
          className="consent-check mt-0.5 h-5 w-5 shrink-0 cursor-pointer"
        />
        {/* La etiqueta está asociada por `htmlFor`, así que TODO su texto es
            área de toque: la casilla mide 20px pero el objetivo real es la
            frase entera, que supera de sobra los 44px. */}
        <label
          htmlFor="campo-consentimiento"
          className="py-1 text-xs leading-relaxed cursor-pointer"
          style={{ color: "var(--gray-mid)" }}
        >
          Acepto que el consultorio use mis datos para responder a esta
          consulta, según la{" "}
          <Link
            href="/privacidad"
            className="underline hover:opacity-80"
            style={{ color: GOLD }}
          >
            política de privacidad
          </Link>
          .
        </label>
      </div>

      <button
        type="submit"
        disabled={!acepta}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-all mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
        style={{ backgroundColor: GOLD, color: "white" }}
      >
        <Send size={16} />
        Enviar por WhatsApp
      </button>

      <p className="text-xs text-center" style={{ color: "var(--gray-mid)" }}>
        Al enviar serás redirigida a WhatsApp para completar tu consulta.
      </p>
    </m.form>
  )
}
