"use client"
import { m } from "framer-motion"
import { Mail, Phone } from "lucide-react"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useEmailForm } from "@/hooks/useEmailForm"
import type { FreePDF } from "@/types"

interface FreeResourcesSectionProps {
  pdfs: FreePDF[]
}

export function FreeResourcesSection({ pdfs }: FreeResourcesSectionProps) {
  const { email, setEmail, submitted, handleSubmit } = useEmailForm()

  return (
    <section id="recursos" className="py-20 px-6" style={{ backgroundColor: "#F8F0E3" }}>
      <div className="container-xl">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow="Recursos Gratuitos"
            title="Guías de Medicina Estética"
            subtitle={`Descarga nuestras guías gratuitas y prepárate para tu consulta.<br/><span style="color:var(--vintage-gold);font-weight:700;">Información confiable de tu especialista de confianza.</span>`}
          />
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* PDF list */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-5"
          >
            {pdfs.map((pdf) => (
              <div key={pdf.title} className="flex gap-4 bg-white rounded-xl p-6 shadow-sm">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: "rgba(184,151,59,0.1)" }}
                >
                  {pdf.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ color: "var(--primary-darkest)" }}>
                    {pdf.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--gray-mid)" }}>
                    {pdf.description}
                  </p>
                </div>
              </div>
            ))}
          </m.div>

          {/* Contact / email form */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="rounded-2xl p-8 shadow-xl text-white" style={{ backgroundColor: "var(--primary-darkest)" }}>
              {!submitted ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <Phone size={28} style={{ color: "var(--vintage-gold)" }} />
                    <h3 className="text-2xl font-bold">Agenda tu Consulta</h3>
                  </div>
                  <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--meteorite)" }}>
                    Ingresa tu correo y te enviaremos las guías gratuitas junto con información para agendar tu consulta de valoración.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                      type="email"
                      placeholder="Tu correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      leftIcon={<Mail size={18} />}
                    />
                    <Button type="submit" variant="default" className="w-full py-4 bg-[var(--vintage-gold)] text-white hover:brightness-110">
                      ENVIARME LAS GUÍAS GRATIS
                    </Button>
                  </form>
                  <p className="text-xs mt-4 text-center" style={{ color: "var(--gray-mid)" }}>
                    🔒 Tu información está protegida. Sin spam, cancela cuando quieras.
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✨</div>
                  <h3 className="text-2xl font-bold mb-3">¡Listo!</h3>
                  <p style={{ color: "var(--meteorite)" }}>
                    Revisa tu bandeja de entrada. Enviamos las guías a{" "}
                    <strong className="text-white">{email}</strong>.
                  </p>
                </div>
              )}
            </div>
          </m.div>
        </div>
      </div>
    </section>
  )
}
