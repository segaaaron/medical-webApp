---
name: frontend-design
description: UI/UX design intelligence for the Dra. Yasmin Medrano medical aesthetics web app. Stack: Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui. Knows the project's premium vintage design system, color tokens, typography scale, animation tokens, and component library. Use when reviewing, building, fixing, or improving UI components, pages, layouts, or design consistency in this project.
---

# Frontend Design — Dra. Yasmin Medrano Web App

## Stack

- **Framework**: Next.js 16 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui + CVA (`class-variance-authority`) + `tailwind-merge`
- **Animation**: Framer Motion (`LazyMotion` + `domAnimation`) + custom CSS keyframes
- **Scroll**: Lenis smooth scroll (via `SmoothScrollProvider`)
- **Icons**: `lucide-react`
- **Forms**: Formik + Yup
- **Rich text**: Tiptap
- **DnD**: dnd-kit

## Design System Tokens (`globals.css`)

### Color Palette
```
/* Brand — deep burgundy/wine */
--primary:           oklch(0.205 0 0)   /* near-black */
--primary-dark:      #8f3452
--primary-darker:    #5c1f35
--primary-darkest:   #3a0f20
--primary-light:     #fde8ef
--meteorite:         #e8a0b4
--meteorite-light:   #fce4ec

/* Vintage warm */
--vintage-cream:     #F8F0E3
--vintage-cream-dark:#EDE5D5
--vintage-gold:      #B8973B
--vintage-gold-light:#D4B483
--vintage-gold-dark: #9A7C2E
--vintage-parchment: #FAF6EE

/* Premium surface layer (oklch) */
--prem-accent:       oklch(58% 0.16 35)   /* warm terracotta */
--prem-bg:           #F8F0E3
--prem-surface:      #FDF8F2
--prem-fg:           oklch(20% 0.02 60)
--prem-muted:        oklch(48% 0.015 60)
--prem-border:       oklch(89% 0.012 80)
--prem-dark:         oklch(13% 0.01 55)
--prem-dark-surf:    oklch(17% 0.01 55)
--prem-dark-fg:      oklch(93% 0.008 75)
--prem-dark-muted:   oklch(55% 0.01 65)
--prem-dark-border:  oklch(24% 0.01 55)

/* Status */
--success: #4a9e82
--warning: #B8973B
--danger:  #e05a7a
```

### Typography
| Token | Font | Use |
|-------|------|-----|
| `--font-sans` | Source Serif 4 | Body text |
| `--font-heading` | Playfair Display | h1–h4 (default via `@theme`) |
| `--font-display` | Cormorant Garamond | Hero/display/blockquotes |
| `--font-mono` | JetBrains Mono | Eyebrow labels, `.prem-eyebrow`, code |

Classes: `font-heading`, `.prem-eyebrow` (mono, 10.5px, 0.22em tracking, uppercase)

### Border Radius
```
--radius: 0.625rem
--radius-sm  → calc(radius * 0.6)
--radius-md  → calc(radius * 0.8)
--radius-lg  → radius
--radius-xl  → calc(radius * 1.4)
--radius-2xl → calc(radius * 1.8)
--radius-3xl → calc(radius * 2.2)
--radius-4xl → calc(radius * 2.6)
```

### Animation Tokens
```
--ease-out-expo:      cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out-quart:  cubic-bezier(0.76, 0, 0.24, 1)
--ease-spring:        cubic-bezier(0.34, 1.56, 0.64, 1)
--duration-fast:      150ms
--duration-normal:    300ms
--duration-slow:      600ms
--duration-enter:     700ms
--duration-exit:      400ms
```

Always use `@media (prefers-reduced-motion: reduce)` guards on animations.

## Component Library

### Custom (`/components/ui/`)
- `Button` — CVA variants, use for all CTAs
- `Input`, `Textarea`, `FormField` — form primitives
- `Badge` — labels/tags
- `SectionHeader` — page section titles with gold accent line
- `PageHero` / `EcgHero` — hero sections (dark bg, cinematic)
- `TiltCard` / `StatCard` — interactive cards
- `AnimatedTitle` — Framer Motion staggered heading reveal
- `CustomCursor` / `CustomCursorLoader` — desktop-only custom cursor
- `DialogAlert` / `alert-dialog` — shadcn-based
- `ImageWithFallback` — Next.js Image + fallback
- `ReadingProgressBar`, `SkipNav` — utility

### Section Components (`/components/sections/`)
### Layout Components (`/components/layout/`)
### Blog (`/components/blog/`)
### Dashboard (`/components/dashboard/`)

## Utility Classes
```
.btn-primary / .btn-warning         — CTA buttons
.section-dark / .section-purple     — dark bg sections
.section-vintage / .section-cream   — light bg sections
.gradient-hero / .gradient-vintage  — gradient bgs
.accent-line / .accent-line-center  — 60px gold decorative line
.prem-divider / .prem-divider--dark — ornament section divider
.prem-eyebrow                       — mono eyebrow label
.bg-vintage-cream/parchment/cream-dark
.text-vintage-gold/gold-light
.border-vintage-gold
.container-xl                       — max-w-[1200px] centered
```

## Aesthetic Rules

1. **Premium vintage medical** — not clinical white. Warm creams, deep burgundy, gold accents.
2. Dark hero sections use `--primary-darkest` (`#3a0f20`) bg with grain overlay (built-in via `body::after`).
3. Gold (`--vintage-gold` / `--prem-accent`) = accent only — never overuse.
4. Headings: always Playfair Display via `.font-heading` or `font-family: var(--font-heading)`.
5. Eyebrow labels above headings: `.prem-eyebrow` class.
6. Decorative dividers between sections: `.prem-divider`.
7. Focus states: 2px solid `#B8973B` outline (already global in `:focus-visible`).
8. Custom cursor active on desktop — never set `cursor: pointer` manually, let CSS handle it.
9. Smooth scroll via Lenis — never use `scroll-behavior: smooth` in CSS.
10. All animations need `prefers-reduced-motion` guard.

## Page Structure
```
/             — Landing (home)
/tratamientos — Medical treatments catalog
/nosotros     — About the doctor
/blog         — Blog (Tiptap-backed)
/contacto     — Contact form (Formik + Yup)
/dashboard    — Admin (protected)
```

## Workflows

### New section/component
1. Check existing components first — prefer extending `SectionHeader`, `TiltCard`, etc.
2. Dark bg → use `--prem-dark-*` tokens. Light bg → `--vintage-*` or `--prem-*` tokens.
3. Add Framer Motion entrance: `initial={{ opacity:0, y:20 }}` with `--ease-out-expo` + `--duration-enter`.
4. Mobile-first. Test at 375px, 768px, 1200px+.
5. Add `prefers-reduced-motion` guard if animated.

### Design review checklist
- [ ] Colors from token system (no hardcoded hex outside globals.css)
- [ ] Font families via CSS vars, not direct font-family strings
- [ ] Gold used sparingly as accent only
- [ ] Heading uses Playfair (`.font-heading`)
- [ ] Animated elements have reduced-motion guard
- [ ] Focus states visible (WCAG AA — gold outline already global)
- [ ] Touch/hover states differentiated (`@media (hover: none)`)
- [ ] Custom cursor not broken (no conflicting cursor CSS on desktop)
