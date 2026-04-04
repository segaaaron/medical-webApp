// Node.js only — runs in Server Components and API routes, never in Edge/browser.

import type { ContentStore, ContentOverride } from "@/types/content"
import { getPool } from "@/lib/db"

// Default data (compiled from lib/data/*)
import { promoBanner, heroStats, heroCTAs, valueFeatures, aboutStats, freePDFs } from "@/lib/data/homepage"
import { courseIncluded, courseModules, coursePricing } from "@/lib/data/course"
import { presetCategories } from "@/lib/data/presets"
import { faqs } from "@/lib/data/faqs"
import { navLinks, footerGroups } from "@/lib/data/navigation"

const CONTENT_KEY = "main"

export const DEFAULTS: ContentStore = {
  branding: {
    doctorName: "Dra. Yasmin Medrano Avila",
    specialty: "Medicina Estética Avanzada",
    city: "Ciudad Cochabamba",
    whatsappNumber: "+591 78751894",
    whatsappUrl: "https://wa.me/59178751894",
    heroTagline: "Medicina Estética · Rejuvenecimiento · Tratamientos Corporales",
    heroSubtitle: "Realza tu belleza natural con tratamientos seguros y efectivos diseñados especialmente para ti.",
    heroBackgroundImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80",
    aboutImage: "/images/DraMedrano.jpeg",
    aboutBadgeValue: "10+",
    aboutBadgeLabel: "Años de Experiencia",
    copyrightText: "© {year} Dra. Yasmin Medrano Avila — Medicina Estética Avanzada. Todos los derechos reservados.",
    footerDescription: "Especialista en medicina estética dedicada a realzar tu belleza natural con tratamientos seguros y efectivos.",
  },
  sectionHeaders: {
    value: {
      eyebrow: "¿Por Qué Elegirnos?",
      title: "Tu bienestar y belleza son nuestra prioridad",
      subtitle: "En el consultorio de la Dra. Yasmin Medrano Avila encontrarás un espacio dedicado exclusivamente a realzar tu belleza natural con los más altos estándares médicos.",
    },
    course: {
      eyebrow: "Nuestros Servicios",
      title: "Tratamientos de Medicina Estética",
      subtitle: "Ofrecemos una amplia gama de tratamientos faciales y corporales con tecnología de vanguardia y los más altos estándares de seguridad médica.",
    },
    presets: {
      eyebrow: "Áreas de Especialidad",
      title: "Nuestras Categorías de Tratamiento",
      subtitle: "Desde rejuvenecimiento facial hasta modelado corporal, ofrecemos soluciones estéticas integrales con resultados visibles y duraderos.",
    },
    freeResources: {
      eyebrow: "Recursos Gratuitos",
      title: "Guías de Medicina Estética",
      subtitle: "Descarga nuestras guías gratuitas y prepárate para tu consulta. Información confiable de tu especialista de confianza.",
    },
    faq: {
      eyebrow: "¿Tienes Preguntas?",
      title: "Preguntas Frecuentes",
      subtitle: "",
    },
  },
  promoPopup: {
    emoji: "💉",
    label: "Promoción Especial · MedSkin",
    title: "Biorevitalización con NCTF 135 HA",
    description: "Renueva e hidrata tu piel profundamente con el tratamiento estrella de la medicina estética. ¡Plazas limitadas!",
    location: "Dra. Yasmin Medrano Avila · Ciudad Cochabamba",
    ctaLabel: "💬 Reservar por WhatsApp",
    ctaHref: "https://wa.me/59178751894",
    dismissLabel: "Quizás después",
  },
  freeResourcesForm: {
    heading: "Agenda tu Consulta",
    description: "Ingresa tu correo y te enviaremos las guías gratuitas junto con información para agendar tu consulta de valoración.",
    placeholder: "Tu correo electrónico",
    buttonLabel: "ENVIARME LAS GUÍAS GRATIS",
    privacyText: "🔒 Tu información está protegida. Sin spam, cancela cuando quieras.",
    successHeading: "¡Listo!",
    successMessage: "Revisa tu bandeja de entrada. Enviamos las guías a {email}.",
  },
  promoBanner,
  heroStats,
  heroCTAs,
  valueFeatures,
  courseIncluded,
  courseModules,
  coursePricing,
  presets: presetCategories,
  freePDFs,
  about: {
    bio: [
      "La Dra. Yasmin Medrano Avila es médica especialista en medicina estética con más de 10 años de experiencia dedicados a realzar la belleza natural de sus pacientes. Su formación en instituciones de alto nivel y su constante actualización la posicionan como una referente en el área de medicina estética avanzada.",
      "Especialista en procedimientos faciales mínimamente invasivos como toxina botulínica, rellenos con ácido hialurónico, bioestimulación y rejuvenecimiento facial, la Dra. Yasmin combina técnica depurada con un enfoque artístico que garantiza resultados naturales y armoniosos.",
      "En su consultorio, cada paciente recibe atención personalizada y un plan de tratamiento diseñado específicamente para sus necesidades. La Dra. Yasmin se distingue por crear un ambiente de confianza y bienestar donde la seguridad del paciente siempre es la prioridad.",
    ],
    stats: aboutStats,
  },
  faqs,
  navLinks,
  footerGroups,
}

export async function readContent(): Promise<ContentStore> {
  try {
    const pool = getPool()
    const result = await pool.query(
      "SELECT value FROM site_content WHERE key = $1",
      [CONTENT_KEY]
    )
    if (result.rows.length === 0) return DEFAULTS
    const override: ContentOverride = result.rows[0].value
    return { ...DEFAULTS, ...override } as ContentStore
  } catch {
    return DEFAULTS
  }
}

export async function writeContent(override: ContentOverride): Promise<void> {
  const pool = getPool()

  // Lee el override existente y mergea encima
  let existing: ContentOverride = {}
  try {
    const result = await pool.query(
      "SELECT value FROM site_content WHERE key = $1",
      [CONTENT_KEY]
    )
    if (result.rows.length > 0) existing = result.rows[0].value
  } catch { /* ignore */ }

  const merged = { ...existing, ...override }

  await pool.query(
    `INSERT INTO site_content (key, value, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE
       SET value = $2, updated_at = now()`,
    [CONTENT_KEY, JSON.stringify(merged)]
  )
}
