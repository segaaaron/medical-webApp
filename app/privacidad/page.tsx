import { readContent } from "@/lib/store/content-store"
import { getFooterData } from "@/lib/data/footer"
import { safeJsonLd } from "@/lib/seo-utils"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PageHero } from "@/components/ui/PageHero"
import { ShieldCheck, MessageCircle } from "lucide-react"
import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

// Última actualización del documento. Cambiar al editar el contenido legal.
const LAST_UPDATED = "15 de junio de 2026"

export const metadata: Metadata = {
  title: "Política de Privacidad — Dra. Yasmin Medrano Avila | Medicina Estética Cochabamba",
  description:
    "Política de privacidad del consultorio de la Dra. Yasmin Medrano Avila. Cómo recopilamos, usamos y protegemos tus datos personales al usar nuestro sitio web y la atención por WhatsApp.",
  alternates: {
    canonical: `${BASE_URL}/privacidad`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Política de Privacidad — Dra. Yasmin Medrano Avila",
    description:
      "Cómo protegemos tus datos personales en el sitio web y la atención por WhatsApp del consultorio de la Dra. Yasmin Medrano Avila.",
    url: `${BASE_URL}/privacidad`,
    type: "website",
    locale: "es_BO",
  },
}

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Política de Privacidad", item: `${BASE_URL}/privacidad` },
  ],
}

export default async function PrivacidadPage() {
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
          eyebrow="Tu privacidad importa"
          title="Política de Privacidad"
          subtitle="Cómo recopilamos, usamos y protegemos tu información personal en nuestro sitio web y en la atención por WhatsApp."
        />

        <section className="py-16 px-6" style={{ backgroundColor: "var(--primary-darkest)" }}>
          <div className="container-xl max-w-3xl">
            <div
              className="flex items-center gap-3 p-5 rounded-2xl mb-10"
              style={{ backgroundColor: "var(--primary-darker)" }}
            >
              <ShieldCheck size={22} style={{ color: "var(--vintage-gold)" }} />
              <p className="text-sm" style={{ color: "#fce4ec" }}>
                Última actualización: <strong style={{ color: "var(--vintage-gold)" }}>{LAST_UPDATED}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-10">
              <Block title="1. Responsable del tratamiento de datos">
                <P>
                  El responsable del tratamiento de tus datos personales es el <strong>consultorio de la Dra. Yasmin
                  Medrano Avila</strong>, especialista en medicina estética, con atención en Ciudad Cochabamba, Bolivia
                  (en adelante, “el Consultorio”, “nosotros”).
                </P>
                <P>
                  Esta política explica qué datos recopilamos, con qué fin, con quién los compartimos y qué derechos
                  tienes sobre ellos, tanto cuando visitas <strong>{BASE_URL.replace(/^https?:\/\//, "") || "nuestro sitio web"}</strong> como
                  cuando te comunicas con nosotros por WhatsApp.
                </P>
              </Block>

              <Block title="2. Qué datos recopilamos">
                <P>Recopilamos únicamente los datos necesarios para atenderte:</P>
                <List
                  items={[
                    "Datos de contacto: nombre, número de teléfono (WhatsApp) y, si los proporcionas, correo electrónico y redes sociales.",
                    "Mensajes de la conversación: el contenido de los mensajes que intercambias con nuestro asistente virtual o con nuestro equipo por WhatsApp.",
                    "Datos de tus citas: tratamiento de interés, fecha y hora de la cita agendada.",
                    "Comprobantes de pago: cuando realizas un pago y nos envías el comprobante de la transferencia.",
                    "Datos de salud relacionados con la estética: solo aquella información que tú decides compartir voluntariamente sobre tu interés o necesidad de un tratamiento, para poder orientarte y agendar tu valoración.",
                    "Datos de navegación: información técnica básica del sitio web (páginas visitadas, dispositivo) con fines de medición y mejora.",
                  ]}
                />
                <P>
                  No solicitamos información de salud sensible más allá de la estrictamente necesaria para coordinar tu
                  consulta. La evaluación médica detallada se realiza únicamente de forma presencial con la doctora.
                </P>
              </Block>

              <Block title="3. Cómo usamos tus datos">
                <P>Usamos tu información para las siguientes finalidades:</P>
                <List
                  items={[
                    "Responder tus consultas y brindarte atención por WhatsApp mediante nuestro asistente virtual.",
                    "Informarte sobre tratamientos, precios y promociones disponibles.",
                    "Agendar, reagendar o cancelar tus citas de valoración o tratamiento.",
                    "Enviarte los datos de pago (código QR) y registrar tu comprobante.",
                    "Enviarte recordatorios de cita y mensajes de seguimiento posterior al tratamiento.",
                    "Mejorar la calidad de nuestra atención y de nuestro sitio web.",
                  ]}
                />
              </Block>

              <Block title="4. Atención por WhatsApp">
                <P>
                  La comunicación por WhatsApp se realiza a través de la <strong>API de WhatsApp Business</strong>,
                  proporcionada por Meta Platforms, Inc. Al escribirnos por WhatsApp, aceptas que tus mensajes sean
                  procesados para atenderte. El uso de WhatsApp también se rige por la propia política de privacidad de
                  WhatsApp/Meta.
                </P>
                <P>
                  Parte de las respuestas son generadas por un asistente virtual automatizado (“Loreley”). En cualquier
                  momento puedes solicitar hablar con una persona del equipo.
                </P>
              </Block>

              <Block title="5. Con quién compartimos tus datos">
                <P>
                  No vendemos tus datos personales. Solo los compartimos con proveedores tecnológicos que nos ayudan a
                  operar, y únicamente para los fines descritos en esta política:
                </P>
                <List
                  items={[
                    "Meta Platforms, Inc. (WhatsApp Business): para enviar y recibir los mensajes.",
                    "Google (Google Calendar): para gestionar la agenda de citas.",
                    "Proveedores de inteligencia artificial: para generar las respuestas del asistente virtual a partir de tu mensaje.",
                    "Entidad bancaria: cuando realizas un pago mediante el código QR proporcionado.",
                  ]}
                />
                <P>
                  Estos proveedores tratan los datos conforme a sus propias políticas de privacidad y a las medidas de
                  seguridad aplicables. También podríamos divulgar información si la ley lo exige.
                </P>
              </Block>

              <Block title="6. Conservación de los datos">
                <P>
                  Conservamos tus datos durante el tiempo necesario para atenderte y cumplir con obligaciones legales o
                  contables. Cuando dejan de ser necesarios, los eliminamos o anonimizamos de forma segura. Puedes
                  solicitar la eliminación de tus datos en cualquier momento.
                </P>
              </Block>

              <Block title="7. Seguridad">
                <P>
                  Aplicamos medidas razonables, técnicas y organizativas, para proteger tu información frente a accesos
                  no autorizados, pérdida o uso indebido. Ningún sistema es completamente infalible, pero trabajamos para
                  mantener tus datos resguardados.
                </P>
              </Block>

              <Block title="8. Tus derechos">
                <P>Tienes derecho a:</P>
                <List
                  items={[
                    "Acceder a los datos personales que tenemos sobre ti.",
                    "Solicitar la corrección de datos inexactos o desactualizados.",
                    "Solicitar la eliminación de tus datos.",
                    "Oponerte o retirar tu consentimiento al tratamiento de tus datos, incluyendo dejar de recibir mensajes de seguimiento.",
                  ]}
                />
                <P>
                  Para ejercer cualquiera de estos derechos, escríbenos por WhatsApp y atenderemos tu solicitud.
                </P>
              </Block>

              <Block title="9. Menores de edad">
                <P>
                  Nuestros servicios están dirigidos a personas mayores de edad. Los tratamientos en menores de edad
                  requieren la autorización y acompañamiento de su padre, madre o tutor legal.
                </P>
              </Block>

              <Block title="10. Cambios en esta política">
                <P>
                  Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas o por
                  motivos legales. Publicaremos la versión vigente en esta misma página, indicando la fecha de última
                  actualización.
                </P>
              </Block>

              <Block title="11. Contacto">
                <P>
                  Si tienes preguntas sobre esta política o sobre el tratamiento de tus datos personales, contáctanos:
                </P>
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
