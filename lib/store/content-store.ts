// Node.js only — runs in Server Components and API routes, never in Edge/browser.

import type { ContentStore, ContentOverride } from "@/types/content"
import { backendFetch } from "@/lib/backend-client"

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
  contact: {
    whatsappNumber: "+591 78751894",
    whatsappUrl: "https://wa.me/59178751894",
    phone: "+591 78751894",
    instagram: "@dra_yasmin.medrano",
    instagramUrl: "https://www.instagram.com/dra_yasmin.medrano",
    facebook: "DraMedranoMedesteticAntiaging",
    facebookUrl: "https://www.facebook.com/DraMedranoMedesteticAntiaging",
    scheduleWeekdays: "9:00 AM – 7:00 PM",
    scheduleSaturday: "9:00 AM – 2:00 PM",
    scheduleSunday: "Cerrado",
    location: "Bolivia — Consulta vía WhatsApp para confirmar dirección exacta del consultorio.",
    latitude: "-17.386471",
    longitude: "-66.152366",
    mapsUrl: "https://www.google.com/maps?q=-17.386471,-66.152366",
  },
}

/**
 * Contenido editable del sitio (FAQs, enlaces de navegación, presets, textos
 * del curso…), leído del backend.
 *
 * Antes esto consultaba Postgres directamente desde el frontend con `pg`:
 *
 *   SELECT value FROM site_content WHERE key = 'main'
 *
 * La tabla que crea Prisma se llama `"SiteContent"` (PascalCase), así que
 * Postgres —que sin comillas busca en minúsculas— respondía
 * `relation "site_content" does not exist`. El error caía en un `catch` vacío
 * y la función devolvía DEFAULTS: el sitio llevaba sirviendo los valores del
 * código e ignorando lo que la doctora había guardado, sin ningún aviso.
 * Encima el contenedor web ni siquiera tiene `DATABASE_URL` (`/api/health`
 * responde `{"db":"error"}`), así que aquella consulta nunca podría funcionar.
 *
 * La base es del backend; el frontend la consume por su API, igual que todo
 * lo demás. Cacheado 60s por `backendFetch`.
 */
async function fetchContent(): Promise<ContentStore> {
  const { data, error } = await backendFetch<{ value?: ContentOverride }>(
    `/site-content/${CONTENT_KEY}`,
    { revalidate: 60 }
  )
  if (error || !data?.value) return DEFAULTS
  return { ...DEFAULTS, ...data.value }
}

export async function readContent(): Promise<ContentStore> {
  return fetchContent()
}
