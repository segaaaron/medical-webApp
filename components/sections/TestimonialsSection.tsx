"use client"
import { motion } from "framer-motion"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { Star } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "María José R.",
    treatment: "Armonización Facial",
    text: "Quedé encantada con los resultados. La Dra. Yasmin es muy profesional, me explicó todo el procedimiento con detalle y el resultado fue completamente natural. ¡Me siento más segura que nunca!",
    stars: 5,
  },
  {
    name: "Lucía F.",
    treatment: "Toxina Botulínica",
    text: "Llevaba años pensando en hacerme botox y siempre me daba miedo. La doctora me dio toda la confianza necesaria. El resultado es increíble, nadie nota que me hice algo, solo que me veo descansada y fresca.",
    stars: 5,
  },
  {
    name: "Carolina M.",
    treatment: "Mesoterapia Facial",
    text: "Mi piel cambió completamente. Después de tres sesiones noto la diferencia en la hidratación y la luminosidad. El trato es muy personalizado y el consultorio es muy agradable.",
    stars: 5,
  },
  {
    name: "Valentina S.",
    treatment: "Depilación Láser",
    text: "Excelente atención desde el primer día. Resultados visibles desde las primeras sesiones. Muy recomendable si buscas un tratamiento seguro y con resultados reales.",
    stars: 5,
  },
  {
    name: "Andrea P.",
    treatment: "Rellenos con Ácido Hialurónico",
    text: "La Dra. Medrano tiene una mano increíble. Los rellenos quedaron perfectos, muy naturales. Me dio exactamente lo que buscaba sin exagerar. Sin duda volveré.",
    stars: 5,
  },
  {
    name: "Gabriela T.",
    treatment: "Radiofrecuencia Facial",
    text: "Fui por el tratamiento de radiofrecuencia y los resultados superaron mis expectativas. La piel se ve más firme y rejuvenecida. El personal es muy amable y profesional.",
    stars: 5,
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} fill="#c9a96e" style={{ color: "#c9a96e" }} />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: "#1a0510" }}>
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow="Lo que dicen nuestras pacientes"
            title="Resultados que Hablan por Sí Solos"
            subtitle={`Más de <span style="color:#c9a96e;font-weight:700;">5,000 pacientes satisfechas</span> avalan nuestro trabajo. La confianza de cada una es nuestra mayor motivación.`}
            light
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl p-6 flex flex-col"
              style={{ backgroundColor: "#3a0f20" }}
            >
              <StarRating count={t.stars} />
              <p className="text-sm leading-relaxed flex-1 mb-5 italic" style={{ color: "#fce4ec" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="border-t pt-4 flex items-center gap-3" style={{ borderColor: "#5c1f35" }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: "#b5496a", color: "white" }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs" style={{ color: "#e8a0b4" }}>{t.treatment}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Google rating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mt-12"
        >
          <div
            className="flex items-center gap-4 px-8 py-4 rounded-2xl"
            style={{ backgroundColor: "#3a0f20" }}
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} fill="#c9a96e" style={{ color: "#c9a96e" }} />
              ))}
            </div>
            <div>
              <p className="text-white font-bold text-lg">5.0</p>
              <p className="text-xs" style={{ color: "#e8a0b4" }}>Calificación de nuestras pacientes</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
