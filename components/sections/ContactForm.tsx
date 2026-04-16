"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Send, CheckCircle } from "lucide-react"
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

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    treatment: "",
    message: "",
  })
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

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank"
    )
    setForm({ name: "", phone: "", treatment: "", message: "" })
    setSent(true)
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-10 text-center"
      >
        <CheckCircle size={48} style={{ color: "#4a9e82" }} />
        <p className="text-white font-bold text-lg">¡Mensaje enviado!</p>
        <p className="text-sm" style={{ color: "#e8a0b4" }}>
          Te redirigimos a WhatsApp para continuar la conversación.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-xs underline mt-2"
          style={{ color: "#c9a96e" }}
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
          type="text"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Tu nombre completo"
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#7a6570] outline-none focus:ring-2 focus:ring-[#b5496a] transition"
          style={{ backgroundColor: "#3a0f20", border: "1px solid #5c1f35" }}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "#e8a0b4" }}>
          Teléfono / WhatsApp
        </label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Ej: 70000000"
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#7a6570] outline-none focus:ring-2 focus:ring-[#b5496a] transition"
          style={{ backgroundColor: "#3a0f20", border: "1px solid #5c1f35" }}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest mb-1.5 font-semibold" style={{ color: "#e8a0b4" }}>
          Tratamiento de interés
        </label>
        <select
          name="treatment"
          value={form.treatment}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-[#b5496a] transition"
          style={{ backgroundColor: "#3a0f20", border: "1px solid #5c1f35", color: form.treatment ? "white" : "#7a6570" }}
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
          value={form.message}
          onChange={handleChange}
          rows={3}
          placeholder="Cuéntanos en qué podemos ayudarte..."
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#7a6570] outline-none focus:ring-2 focus:ring-[#b5496a] transition resize-none"
          style={{ backgroundColor: "#3a0f20", border: "1px solid #5c1f35" }}
        />
      </div>

      <button
        type="submit"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-bold uppercase tracking-wide hover:opacity-90 transition-opacity mt-1"
        style={{ backgroundColor: "#b5496a", color: "white" }}
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
