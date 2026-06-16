import Link from "next/link"
import { readContent } from "@/lib/store/content-store"
import { getFooterData } from "@/lib/data/footer"
import { safeJsonLd } from "@/lib/seo-utils"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PageHero } from "@/components/ui/PageHero"
import { ScrollText, MessageCircle } from "lucide-react"
import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

// Última actualización del documento. Cambiar al editar el contenido legal.
const LAST_UPDATED = "16 de junio de 2026"

export const metadata: Metadata = {
  title: "Términos y Condiciones — Dra. Yasmin Medrano Avila | Medicina Estética Cochabamba",
  description:
    "Términos y Condiciones de uso del sitio web y de la atención por WhatsApp del consultorio de la Dra. Yasmin Medrano Avila, especialista en medicina estética en Cochabamba, Bolivia.",
  alternates: {
    canonical: `${BASE_URL}/terminos`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Términos y Condiciones — Dra. Yasmin Medrano Avila",
    description:
      "Condiciones de uso del sitio web y de la atención por WhatsApp del consultorio de la Dra. Yasmin Medrano Avila.",
    url: `${BASE_URL}/terminos`,
    type: "website",
    locale: "es_BO",
  },
}

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Términos y Condiciones", item: `${BASE_URL}/terminos` },
  ],
}

export default async function TerminosPage() {
  const [c, footerData] = await Promise.all([readContent(), getFooterData()])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <Navbar links={c.navLinks} />
      <main>
        <PageHero
          eyebrow="Información legal"
          title="Términos y Condiciones"
          subtitle="Condiciones que regulan el uso de nuestro sitio web y de la atención por WhatsApp. Te pedimos leerlas con atención."
        />

        <section className="py-16 px-6" style={{ backgroundColor: "var(--primary-darkest)" }}>
          <div className="container-xl max-w-3xl">
            <div
              className="flex items-center gap-3 p-5 rounded-2xl mb-10"
              style={{ backgroundColor: "var(--primary-darker)" }}
            >
              <ScrollText size={22} style={{ color: "var(--vintage-gold)" }} />
              <p className="text-sm" style={{ color: "#fce4ec" }}>
                Última actualización: <strong style={{ color: "var(--vintage-gold)" }}>{LAST_UPDATED}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-10">
              <Block title="1. Aceptación de los términos">
                <P>
                  Estos Términos y Condiciones (en adelante, los “Términos”) regulan el acceso y uso del sitio web
                  <strong> {BASE_URL.replace(/^https?:\/\//, "") || "nuestro sitio web"}</strong> y de los canales de
                  atención del <strong>consultorio de la Dra. Yasmin Medrano Avila</strong>, especialista en medicina
                  estética en Ciudad Cochabamba, Bolivia (en adelante, “el Consultorio”, “nosotros”).
                </P>
                <P>
                  Al acceder al sitio web, escribirnos por WhatsApp o interactuar con nuestro asistente virtual, declaras
                  haber leído, entendido y aceptado estos Términos en su totalidad. Si no estás de acuerdo, te pedimos no
                  utilizar estos servicios.
                </P>
              </Block>

              <Block title="2. Objeto y descripción del servicio">
                <P>
                  El sitio web y nuestros canales de atención tienen como finalidad brindar información sobre los
                  tratamientos de medicina estética que ofrece el Consultorio, así como facilitar el contacto, la
                  resolución de consultas y el agendamiento de citas de valoración.
                </P>
                <P>
                  Parte de la atención por WhatsApp se realiza mediante un asistente virtual automatizado (“Loreley”),
                  que puede orientarte, informarte y ayudarte a agendar una cita. Puedes solicitar en cualquier momento
                  ser atendido por una persona del equipo.
                </P>
              </Block>

              <Block title="3. Carácter informativo · No sustituye una consulta médica">
                <P>
                  Toda la información publicada en el sitio web y la proporcionada por el asistente virtual tiene
                  <strong> carácter exclusivamente informativo y orientativo</strong>. No constituye un diagnóstico,
                  prescripción ni recomendación médica, y <strong>no sustituye en ningún caso una consulta o valoración
                  médica presencial</strong>.
                </P>
                <P>
                  La indicación de cualquier tratamiento depende de una evaluación clínica individual realizada por la
                  doctora de forma presencial. La interacción con el sitio web o con el asistente virtual no crea, por sí
                  sola, una relación médico-paciente.
                </P>
                <P>
                  Esta información no debe utilizarse para situaciones de emergencia. Ante una urgencia médica, acude de
                  inmediato al servicio de emergencias más cercano.
                </P>
              </Block>

              <Block title="4. Valoración y resultados de los tratamientos">
                <P>
                  Los tratamientos de medicina estética requieren una valoración previa para determinar su idoneidad,
                  considerando el estado de salud, antecedentes y características de cada persona.
                </P>
                <P>
                  Los resultados de los procedimientos estéticos <strong>varían de una persona a otra</strong> y dependen
                  de múltiples factores individuales, incluido el seguimiento de las indicaciones posteriores. Cualquier
                  imagen, testimonio o ejemplo mostrado tiene fines ilustrativos y <strong>no constituye una garantía de
                  resultados</strong>. La medicina estética no es una ciencia exacta y no es posible asegurar un resultado
                  idéntico para todos los pacientes.
                </P>
              </Block>

              <Block title="5. Agendamiento, reprogramación e inasistencias">
                <P>
                  El agendamiento de citas está <strong>sujeto a disponibilidad</strong>. Una cita se considera confirmada
                  únicamente cuando así te lo comunicamos expresamente.
                </P>
                <List
                  items={[
                    "Te pedimos asistir puntualmente. Una llegada tardía puede implicar la reprogramación de la cita.",
                    "Si no puedes asistir, agradecemos avisar con la mayor anticipación posible para reasignar el horario.",
                    "Las condiciones específicas de anticipos, reprogramaciones e inasistencias se te informan al momento de agendar y forman parte de estos Términos.",
                    "Nos reservamos el derecho de reprogramar una cita por causas de fuerza mayor o motivos médicos, comunicándolo con la mayor anticipación posible.",
                  ]}
                />
              </Block>

              <Block title="6. Precios y pagos">
                <P>
                  Los precios mostrados en el sitio web o informados por el asistente virtual son
                  <strong> referenciales y pueden variar sin previo aviso</strong>. El precio final de cada tratamiento se
                  confirma tras la valoración correspondiente.
                </P>
                <P>
                  Los pagos pueden realizarse mediante los medios habilitados por el Consultorio, incluido el código QR
                  bancario que se te proporcione. Al realizar un pago, te solicitamos enviar el comprobante de la
                  transferencia para su registro y confirmación. Cualquier condición sobre anticipos o señas se te informa
                  antes de efectuar el pago.
                </P>
              </Block>

              <Block title="7. Obligaciones del usuario">
                <P>Al utilizar nuestros servicios, te comprometes a:</P>
                <List
                  items={[
                    "Proporcionar información veraz, completa y actualizada, especialmente la relativa a tu salud, antecedentes, alergias y medicación.",
                    "Ser mayor de edad. El acceso a tratamientos por parte de menores de edad requiere la autorización y el acompañamiento de su padre, madre o tutor legal.",
                    "Seguir las indicaciones médicas previas y posteriores a cualquier procedimiento.",
                    "No utilizar el sitio web ni los canales de atención con fines ilícitos, fraudulentos o que puedan dañar al Consultorio o a terceros.",
                  ]}
                />
                <P>
                  La omisión o inexactitud de información relevante sobre tu salud puede afectar la seguridad y el
                  resultado del tratamiento, siendo de tu exclusiva responsabilidad.
                </P>
              </Block>

              <Block title="8. Uso del asistente virtual y de WhatsApp">
                <P>
                  El asistente virtual funciona de forma automatizada y, aunque procuramos su exactitud, sus respuestas
                  pueden contener errores u omisiones. La información definitiva sobre tratamientos, precios y citas se
                  confirma siempre por nuestro equipo y en la valoración presencial.
                </P>
                <P>
                  La atención por WhatsApp se realiza a través de la plataforma de WhatsApp/Meta, cuyo uso está sujeto
                  también a los términos y políticas de dicha plataforma. No debe utilizarse para urgencias médicas.
                </P>
              </Block>

              <Block title="9. Propiedad intelectual">
                <P>
                  Todos los contenidos del sitio web —incluyendo textos, imágenes, logotipos, marca, diseño y demás
                  elementos— son propiedad del Consultorio o se utilizan con la debida autorización, y están protegidos
                  por la legislación aplicable. Queda prohibida su reproducción, distribución o uso sin autorización
                  previa y por escrito.
                </P>
              </Block>

              <Block title="10. Enlaces y servicios de terceros">
                <P>
                  El sitio web y la atención pueden integrar servicios de terceros (por ejemplo, WhatsApp/Meta, Google y
                  entidades bancarias). No somos responsables del contenido, las políticas ni el funcionamiento de dichos
                  terceros, que se rigen por sus propios términos y condiciones.
                </P>
              </Block>

              <Block title="11. Limitación de responsabilidad">
                <P>
                  En la máxima medida permitida por la ley aplicable, el Consultorio no será responsable por daños
                  indirectos, incidentales o derivados del uso del sitio web o del asistente virtual, ni por decisiones
                  tomadas únicamente con base en la información de carácter informativo allí contenida sin una valoración
                  médica presencial previa.
                </P>
                <P>
                  El sitio web se ofrece “tal cual” y, si bien procuramos su correcto funcionamiento y la veracidad de su
                  contenido, no garantizamos su disponibilidad ininterrumpida ni la ausencia total de errores. Nada en
                  estos Términos excluye o limita la responsabilidad que, conforme a la ley, no pueda ser excluida o
                  limitada.
                </P>
              </Block>

              <Block title="12. Indemnidad">
                <P>
                  Te comprometes a mantener indemne al Consultorio y a la Dra. Yasmin Medrano Avila frente a reclamaciones
                  de terceros derivadas del uso indebido de los servicios o del incumplimiento de estos Términos por tu
                  parte.
                </P>
              </Block>

              <Block title="13. Protección de datos personales">
                <P>
                  El tratamiento de tus datos personales se rige por nuestra{" "}
                  <Link href="/privacidad" className="underline font-semibold" style={{ color: "var(--vintage-gold)" }}>
                    Política de Privacidad
                  </Link>
                  , que forma parte integral de estos Términos.
                </P>
              </Block>

              <Block title="14. Modificaciones">
                <P>
                  Podemos modificar estos Términos en cualquier momento para adaptarlos a cambios en nuestros servicios o
                  a requisitos legales. La versión vigente será siempre la publicada en esta página, con su fecha de
                  última actualización. El uso continuado de los servicios tras una modificación implica su aceptación.
                </P>
              </Block>

              <Block title="15. Ley aplicable y jurisdicción">
                <P>
                  Estos Términos se rigen por la legislación vigente en el Estado Plurinacional de Bolivia. Cualquier
                  controversia se someterá a los tribunales competentes de Cochabamba, Bolivia, sin perjuicio de los
                  derechos que la normativa de protección al consumidor reconozca a tu favor.
                </P>
              </Block>

              <Block title="16. Contacto">
                <P>Para cualquier consulta relacionada con estos Términos, puedes contactarnos:</P>
                <List
                  items={[
                    "Dra. Yasmin Medrano Avila — Medicina Estética, Ciudad Cochabamba, Bolivia.",
                    "WhatsApp: +591 78751894",
                    "Instagram: @dra_yasmin.medrano",
                  ]}
                />
              </Block>
            </div>

            <a
              href="https://wa.me/59178751894"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full mt-12 py-4 rounded-full text-base font-bold uppercase tracking-wide hover:brightness-110 transition-all"
              style={{ backgroundColor: "var(--vintage-gold)", color: "white" }}
            >
              <MessageCircle size={18} />
              Escríbenos por WhatsApp
            </a>
          </div>
        </section>
      </main>
      <Footer data={footerData} />
    </>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm md:text-base leading-relaxed" style={{ color: "#fce4ec" }}>
      {children}
    </p>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm md:text-base leading-relaxed" style={{ color: "#fce4ec" }}>
          <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "var(--vintage-gold)" }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
