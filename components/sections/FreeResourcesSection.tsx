"use client"
import { motion } from "framer-motion"
import { Mail, Download } from "lucide-react"
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
    <section id="free" className="py-20 px-6" style={{ backgroundColor: "#f2f3f6" }}>
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            eyebrow="Free Resources"
            title="Free Starter Kit"
            subtitle={`Get instant access to 3 powerful PDF guides — completely free.<br/><span style="color:#673de6;font-weight:700;">Grab the Free Starter Kit Before It&apos;s Gone.</span>`}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* PDF list */}
          <motion.div
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
                  style={{ backgroundColor: "#ebe4ff" }}
                >
                  {pdf.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ color: "#1F1346" }}>
                    {pdf.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#727586" }}>
                    {pdf.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Email form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="rounded-2xl p-8 shadow-xl text-white" style={{ backgroundColor: "#1F1346" }}>
              {!submitted ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <Download size={28} style={{ color: "#ffcd35" }} />
                    <h3 className="text-2xl font-bold">Get Your Free PDFs</h3>
                  </div>
                  <p className="text-sm mb-8 leading-relaxed" style={{ color: "#8c85ff" }}>
                    Enter your email below and we&apos;ll send you the complete Free Starter Kit
                    instantly. No spam, unsubscribe anytime.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      leftIcon={<Mail size={18} />}
                    />
                    <Button type="submit" variant="warning" className="w-full py-4">
                      SEND ME THE FREE STARTER KIT
                    </Button>
                  </form>
                  <p className="text-xs mt-4 text-center" style={{ color: "#727586" }}>
                    🔒 Your privacy is protected. Unsubscribe at any time.
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold mb-3">You&apos;re in!</h3>
                  <p style={{ color: "#8c85ff" }}>
                    Check your inbox — your Free Starter Kit is on its way to{" "}
                    <strong className="text-white">{email}</strong>.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
