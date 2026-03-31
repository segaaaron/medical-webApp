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
