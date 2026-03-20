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
      "James Nader is an internationally recognised photographer and educator with over three decades of experience in fashion, advertising, and commercial photography. His work has graced the pages of leading publications and the campaigns of global brands and celebrities.",
      "A specialist in the Zone System and the creator of the proprietary TRIOME™ method, James has developed a unique approach to monochrome photography that goes beyond technique — it's a philosophy of visual storytelling.",
      "Through the James Nader Photography Academy, he shares the systems, methods, and mindset shifts that have defined his career — with photographers at every level, worldwide.",
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
