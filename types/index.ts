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
  variant: "primary" | "warning" | "ghost" | "secondary" | "outline"
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
  treatmentId: string
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

// ─── Branding / Global ───────────────────────────────────────────────────────

export interface BrandingData {
  doctorName: string
  specialty: string
  city: string
  whatsappNumber: string
  whatsappUrl: string
  heroTagline: string
  heroSubtitle: string
  heroBackgroundImage: string
  aboutImage: string
  aboutBadgeValue: string
  aboutBadgeLabel: string
  copyrightText: string
  footerDescription: string
}

// ─── Section Headers ─────────────────────────────────────────────────────────

export interface SectionHeader {
  eyebrow: string
  title: string
  subtitle: string
}

export interface SectionHeaders {
  value: SectionHeader
  course: SectionHeader
  presets: SectionHeader
  freeResources: SectionHeader
  faq: SectionHeader
}

// ─── Promo Popup ─────────────────────────────────────────────────────────────

export interface PromoPopupData {
  emoji: string
  label: string
  title: string
  description: string
  location: string
  ctaLabel: string
  ctaHref: string
  dismissLabel: string
}

// ─── Free Resources Form ─────────────────────────────────────────────────────

export interface FreeResourcesFormData {
  heading: string
  description: string
  placeholder: string
  buttonLabel: string
  privacyText: string
  successHeading: string
  successMessage: string
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "warning" | "outline"

export interface SectionHeaderProps {
  eyebrow: string
  title: string
  subtitle?: string
  light?: boolean   // true = texto blanco (sobre fondos oscuros)
}
