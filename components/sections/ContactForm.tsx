"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"
import { WHATSAPP_NUMBER } from "@/lib/constants"

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

const GOLD = "#B8973B"

function focusRing(e: React.FocusEvent<HTMLElement>) {
  (e.target as HTMLElement).style.boxShadow = "0 0 0 2px rgba(184,151,59,0.45)"
}
function blurRing(e: React.FocusEvent<HTMLElement>) {
  (e.target as HTMLElement).style.boxShadow = "none"
}

export function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", treatment: "", message: "" })
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
      form.message ? `Mensaje: ${form.message}` : "",
    ]
      .filter(Boolean)
      .join(" ")

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
    setForm({ name: "", phone: "", treatment: "", message: "" })
    setSent(true)
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center gap-5 py-10 text-center"
      >
        {/* Drawn-circle check animation */}
        <div className="relative w-16 h-16" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <motion.circle
              cx="32" cy="32" r="22"
              stroke={GOLD} strokeWidth="2"
              fill="rgba(184,151,59,0.08)"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "32px 32px", rotate: "-90deg" } as React.CSSProperties}
            />
            <motion.path
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
          <p className="text-sm" style={{ color: "#e8a0b4" }}>
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
      </motion.div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "#e8a0b4" }}>
          Nombre *
        </label>
        <input
          type="text" name="name" required
          value={form.name} onChange={handleChange}
          placeholder="Tu nombre completo"
          className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[#7a6570] outline-none transition"
          style={{ backgroundColor: "#3a0f20", border: "1px solid #5c1f35" }}
          onFocus={focusRing} onBlur={blurRing}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "#e8a0b4" }}>
          Teléfono / WhatsApp
        </label>
        <input
          type="tel" name="phone"
          value={form.phone} onChange={handleChange}
          placeholder="Ej: 70000000"
          className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[#7a6570] outline-none transition"
          style={{ backgroundColor: "#3a0f20", border: "1px solid #5c1f35" }}
          onFocus={focusRing} onBlur={blurRing}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "#e8a0b4" }}>
          Tratamiento de interés
        </label>
        <select
          name="treatment"
          value={form.treatment} onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl text-base outline-none transition"
          style={{ backgroundColor: "#3a0f20", border: "1px solid #5c1f35", color: form.treatment ? "white" : "#7a6570" }}
          onFocus={focusRing} onBlur={blurRing}
        >
          <option value="" style={{ color: "#7a6570" }}>Selecciona un tratamiento</option>
          {TREATMENTS.map((t) => (
            <option key={t} value={t} style={{ color: "white", backgroundColor: "#3a0f20" }}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "#e8a0b4" }}>
          Mensaje (opcional)
        </label>
        <textarea
          name="message"
          value={form.message} onChange={handleChange}
          rows={3} placeholder="Cuéntanos en qué podemos ayudarte..."
          className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-[#7a6570] outline-none transition resize-none"
          style={{ backgroundColor: "#3a0f20", border: "1px solid #5c1f35" }}
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

      <p className="text-xs text-center" style={{ color: "#7a6570" }}>
        Al enviar serás redirigida a WhatsApp para completar tu consulta.
      </p>
    </motion.form>
  )
}
