// Node.js only — runs in Server Components and API routes, never in Edge/browser.
// To swap to a DB: replace readContent / writeContent implementations only.

import fs from "fs"
import path from "path"
import type { ContentStore, ContentOverride } from "@/types/content"

// Default data (compiled from lib/data/*)
import { promoBanner, heroStats, heroCTAs, valueFeatures, aboutStats, freePDFs } from "@/lib/data/homepage"
import { courseIncluded, courseModules, coursePricing } from "@/lib/data/course"
import { presetCategories } from "@/lib/data/presets"
import { faqs } from "@/lib/data/faqs"
import { navLinks, footerGroups } from "@/lib/data/navigation"

const CONTENT_FILE = path.join(process.cwd(), "data", "content.json")

const DEFAULTS: ContentStore = {
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

export function readContent(): ContentStore {
  try {
    if (!fs.existsSync(CONTENT_FILE)) return DEFAULTS
    const raw = fs.readFileSync(CONTENT_FILE, "utf-8")
    const override: ContentOverride = JSON.parse(raw)
    // Deep-merge: override wins, defaults fill any missing fields
    return { ...DEFAULTS, ...override } as ContentStore
  } catch {
    return DEFAULTS
  }
}

export function writeContent(override: ContentOverride): void {
  const dir = path.dirname(CONTENT_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  // Read existing override, merge on top
  let existing: ContentOverride = {}
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      existing = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf-8"))
    }
  } catch { /* ignore */ }

  fs.writeFileSync(CONTENT_FILE, JSON.stringify({ ...existing, ...override }, null, 2), "utf-8")
}
