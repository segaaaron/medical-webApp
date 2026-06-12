"use client"

import { useState } from "react"
import { m } from "framer-motion"
import { Send } from "lucide-react"
import { WHATSAPP_NUMBER } from "@/lib/constants"
import { trackLead, trackWhatsAppClick } from "@/lib/analytics"

const TREATMENTS = [
  "Toxina Botulínica (Botox)",
  "Rellenos con Ácido Hialurónico",
  "Armonización Facial",
  "Depilación Láser",
  "Mesoterapia Facial",
  "Radiofrecuencia Facial",
  "Bioestimulación",
  "Peeling Químico",
  "Tratamiento Corporal",
  "Otro / Consulta general",
]

const GOLD = "var(--vintage-gold)"

function focusRing(e: React.FocusEvent<HTMLElement>) {
  (e.target as HTMLElement).style.boxShadow = "0 0 0 2px rgba(184,151,59,0.45)"
}
function blurRing(e: React.FocusEvent<HTMLElement>) {
  (e.target as HTMLElement).style.boxShadow = "none"
}

export function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", treatment: "", message: "", preferredDate: "", website: "" })
  const [sent, setSent] = useState(false)

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
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, source: "contact-form" }),
      keepalive: true,
    }).catch(() => {})

    trackLead({ treatment: form.treatment, source: "contact-form" })
    trackWhatsAppClick("contact-form")

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
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
        <div>
          <p className="text-white font-bold text-lg mb-1">¡Mensaje enviado!</p>
          <p className="text-sm" style={{ color: "var(--meteorite)" }}>
            Te redirigimos a WhatsApp para continuar la conversación.
          </p>
        </div>
        <button
          onClick={() => setSent(false)}
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
        <label className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "var(--meteorite)" }}>
          Nombre *
        </label>
        <input
          type="text" name="name" required
          value={form.name} onChange={handleChange}
          placeholder="Tu nombre completo"
          className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[var(--gray-mid)] outline-none transition"
          style={{ backgroundColor: "var(--primary-darkest)", border: "1px solid var(--primary-darker)" }}
          onFocus={focusRing} onBlur={blurRing}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "var(--meteorite)" }}>
          Teléfono / WhatsApp
        </label>
        <input
          type="tel" name="phone"
          value={form.phone} onChange={handleChange}
          placeholder="Ej: 70000000"
          className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[var(--gray-mid)] outline-none transition"
          style={{ backgroundColor: "var(--primary-darkest)", border: "1px solid var(--primary-darker)" }}
          onFocus={focusRing} onBlur={blurRing}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "var(--meteorite)" }}>
          Tratamiento de interés
        </label>
        <select
          name="treatment"
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
        <label className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "var(--meteorite)" }}>
          Fecha preferida para tu cita (opcional)
        </label>
        <input
          type="date" name="preferredDate"
          value={form.preferredDate} onChange={handleChange}
          min={new Date().toISOString().slice(0, 10)}
          className="w-full px-4 py-3 rounded-xl text-base outline-none transition [color-scheme:dark]"
          style={{ backgroundColor: "var(--primary-darkest)", border: "1px solid var(--primary-darker)", color: form.preferredDate ? "white" : "var(--gray-mid)" }}
          onFocus={focusRing} onBlur={blurRing}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "var(--meteorite)" }}>
          Mensaje (opcional)
        </label>
        <textarea
          name="message"
          value={form.message} onChange={handleChange}
          rows={3} placeholder="Cuéntanos en qué podemos ayudarte..."
          className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[var(--gray-mid)] outline-none transition resize-none"
          style={{ backgroundColor: "var(--primary-darkest)", border: "1px solid var(--primary-darker)" }}
          onFocus={focusRing} onBlur={blurRing}
        />
      </div>

      <button
        type="submit"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-all mt-1"
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
