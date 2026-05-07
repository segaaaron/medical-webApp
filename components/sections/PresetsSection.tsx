"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { Badge } from "@/components/ui/Badge"
import { LinkButton } from "@/components/ui/Button"
import { WHATSAPP_URL } from "@/lib/constants"
import type { PresetCategory } from "@/types"

// Images for each treatment category
const TREATMENT_IMAGES = [
  "/images/draMedrano4.jpeg",                                                        // Tratamientos faciales
  "/images/draMedrano3.jpeg",                                                        // Medicina regenerativa
  "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=85",       // Corporales
  "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=85",       // Depilación láser
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=85",       // Hidratación
  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=85",       // Estrías
]

interface PresetsSectionProps {
  presets: PresetCategory[]
}

export function PresetsSection({ presets }: PresetsSectionProps) {

  return (
    <section id="servicios" className="py-20 px-6" style={{ backgroundColor: "#5c1f35" }}>
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow="Áreas de Especialidad"
            title="Nuestras Categorías de Tratamiento"
            subtitle={`Desde rejuvenecimiento facial hasta modelado corporal, ofrecemos soluciones estéticas integrales con <span style="color:#B8973B;font-weight:600;">resultados visibles y duraderos</span>.`}
            light
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {presets.map((preset, i) => (
            <motion.div
              key={preset.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer"
              style={{ backgroundColor: "#3a0f20" }}
            >
              <div className="relative w-full h-44 overflow-hidden">
                <Image
                  src={TREATMENT_IMAGES[i % TREATMENT_IMAGES.length]}
                  alt={`${preset.name} - Tratamiento de medicina estetica con la Dra. Yasmin Medrano Avila`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-base">{preset.name}</h3>
                  <Badge label={preset.tag} color={preset.tagColor} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#e8a0b4" }}>
                  {preset.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <LinkButton href={WHATSAPP_URL} variant="primary" className="px-12">
            CONSULTAR TRATAMIENTO
          </LinkButton>
        </motion.div>
      </div>
    </section>
  )
}
