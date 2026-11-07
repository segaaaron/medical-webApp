import type { FaqItem } from "@/lib/seo/faq"

const GOLD = "var(--vintage-gold)"

interface TreatmentFaqProps {
  faqs: FaqItem[]
  /** Nombre visible del tratamiento, para el encabezado de la sección. */
  treatmentName: string
}

/**
 * Preguntas frecuentes visibles de la ficha de tratamiento.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ `<details>` Y NO EL ACORDEÓN DEL HOME
 *
 * `FAQSection` (el del home) monta la respuesta solo cuando el panel está
 * abierto: `AnimatePresence` la desmonta al cerrarse. Para el usuario está
 * bien y Google acepta contenido tras un acordeón, pero en el HTML que sirve
 * el servidor la respuesta NO está. Y lo que no está en el HTML no lo puede
 * citar un motor de respuestas, que es justamente para quien se escriben estas
 * respuestas: la que contesta «¿cuánto cuesta el bótox en Cochabamba?» lleva el
 * teléfono dentro.
 *
 * `<details>` es la solución del propio navegador: colapsa igual, mantiene el
 * contenido en el DOM, es accesible por teclado sin escribir nada y no necesita
 * JavaScript ni hidratación. Un componente de servidor, cero kB de cliente.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ LAS PREGUNTAS SON `<h3>`
 *
 * Medido sobre las 19 fichas: 8 no tenían NINGUNA pregunta como encabezado,
 * y dos de ellas (perfilado de mandíbula, tratamiento de ojeras) servían 36 y
 * 26 preguntas respectivamente como párrafos sueltos. Sin jerarquía de
 * encabezados no hay pasajes que extraer, y la extracción por pasajes es como
 * se construye una cita en IA y un fragmento destacado en Google.
 *
 * Un solo `<h2>` para la sección y un `<h3>` por pregunta: así el esquema de la
 * página se lee como un índice en vez de como ruido.
 */
export function TreatmentFaq({ faqs, treatmentName }: TreatmentFaqProps) {
  if (faqs.length === 0) return null

  return (
    <section
      aria-labelledby="faq-tratamiento"
      style={{ padding: "clamp(48px, 7vw, 80px) 0" }}
    >
      <h2
        id="faq-tratamiento"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(24px, 3.2vw, 34px)",
          fontWeight: 500,
          lineHeight: 1.2,
          color: "var(--primary-darkest)",
          marginBottom: "8px",
        }}
      >
        Preguntas frecuentes sobre {treatmentName}
      </h2>
      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.7,
          color: "oklch(42% 0.018 55)",
          marginBottom: "28px",
          maxWidth: "62ch",
        }}
      >
        Lo que más nos consultan en el consultorio. Si tu duda no está aquí,
        escríbenos por WhatsApp y la respondemos antes de que agendes.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {faqs.map((faq) => (
          <details
            key={faq.question}
            style={{
              borderRadius: "10px",
              border: "1px solid rgba(184,151,59,0.18)",
              background: "#FEFCF9",
              boxShadow: "0 1px 4px rgba(58,15,32,0.04)",
              overflow: "hidden",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                listStyle: "none",
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "15px",
                  fontWeight: 600,
                  lineHeight: 1.45,
                  color: "var(--primary-darkest)",
                  margin: 0,
                }}
              >
                {faq.question}
              </h3>
              {/* Marcador propio: `list-style: none` quita el triángulo nativo,
                  que en Safari e iOS no se puede estilar. */}
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: "18px",
                  height: "18px",
                  position: "relative",
                  color: GOLD,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    inset: "8px 0 auto 0",
                    height: "1.5px",
                    background: "currentColor",
                  }}
                />
                <span
                  className="faq-plus-v"
                  style={{
                    position: "absolute",
                    inset: "0 8px auto auto",
                    width: "1.5px",
                    height: "18px",
                    background: "currentColor",
                  }}
                />
              </span>
            </summary>
            <div
              style={{
                padding: "0 22px 20px",
                borderTop: "1px solid rgba(184,151,59,0.18)",
                paddingTop: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.75,
                  color: "oklch(35% 0.018 55)",
                  margin: 0,
                  maxWidth: "68ch",
                }}
              >
                {faq.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
