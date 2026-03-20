import type { LucideIcon } from "lucide-react"

// Icon name strings (used when data crosses server→client boundary)
export type ValueFeatureIcon = "Eye" | "Zap" | "Award" | "TrendingUp"
export type CourseItemIcon = "Play" | "FileText" | "Download" | "CheckCircle"

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavChild {
  label: string
  href: string
}

export interface NavLink {
  label: string
  href: string
  external?: boolean
  children?: NavChild[]
}

export interface FooterLink {
  label: string
  href: string
  external?: boolean
}

export interface FooterGroup {
  title: string
  links: FooterLink[]
}

export interface SocialLink {
  icon: LucideIcon
  href: string
  label: string
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export interface HeroStat {
  value: string
  label: string
}

export interface HeroCTA {
  label: string
  href: string
  variant: "primary" | "warning"
}

// ─── Value Proposition ────────────────────────────────────────────────────────

export interface ValueFeature {
  iconName: ValueFeatureIcon
  title: string
  description: string
}

// ─── Course ───────────────────────────────────────────────────────────────────

export interface CourseIncluded {
  iconName: CourseItemIcon
  text: string
}

export interface CourseModule {
  title: string
}

export interface CoursePricing {
  earlyBird: number
  regular: number
  currency: string
  savings: number
}

// ─── Presets ──────────────────────────────────────────────────────────────────

export interface PresetCategory {
  name: string
  description: string
  tag: string
  tagColor: string
}

// ─── Free Resources ───────────────────────────────────────────────────────────

export interface FreePDF {
  title: string
  description: string
  icon: string
}

// ─── About ────────────────────────────────────────────────────────────────────

export interface AboutStat {
  value: string
  label: string
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export interface FAQ {
  question: string
  answer: string
}

// ─── Promo Banner ─────────────────────────────────────────────────────────────

export interface PromoBannerData {
  text: string
  ctaLabel: string
  ctaHref: string
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "warning" | "outline"

export interface SectionHeaderProps {
  eyebrow: string
  title: string
  subtitle?: string
  light?: boolean   // true = texto blanco (sobre fondos oscuros)
}
