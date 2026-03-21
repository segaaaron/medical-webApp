import type { HeroStat, HeroCTA, ValueFeature, AboutStat, PromoBannerData, FreePDF } from "@/types"

export const promoBanner: PromoBannerData = {
  text: "🎉 Early-Bird Access: First 100 Photographers Save £300 on the Mono Course —",
  ctaLabel: "Don't Miss Out",
  ctaHref: "#course",
}

export const heroStats: HeroStat[] = [
  { value: "30+", label: "Years Experience" },
  { value: "100+", label: "Video Modules" },
  { value: "50K+", label: "Students Worldwide" },
]

export const heroCTAs: HeroCTA[] = [
  { label: "SEE WHAT'S INSIDE", href: "#course", variant: "primary" },
  { label: "GRAB THE FREE STARTER KIT", href: "#free", variant: "warning" },
]

// iconName is a string — safe to pass across the server→client boundary
export const valueFeatures: ValueFeature[] = [
  {
    iconName: "Eye",
    title: "See in Black & White Before You Shoot",
    description:
      "Develop the vision to pre-visualize your shots in monochrome, transforming how you see and compose.",
  },
  {
    iconName: "Zap",
    title: "Master Tonal Control",
    description:
      "Use the Zone System and proprietary TRIOME™ method to take complete control of your tones.",
  },
  {
    iconName: "Award",
    title: "Professional-Grade Results",
    description:
      "Achieve the timeless, editorial quality seen in international brand and celebrity campaigns.",
  },
  {
    iconName: "TrendingUp",
    title: "Transform Your Photographic Vision",
    description:
      "Move beyond snapshots to create images with depth, emotion, and lasting impact.",
  },
]

export const aboutStats: AboutStat[] = [
  { value: "30+", label: "Years in Industry" },
  { value: "50K+", label: "Students Taught" },
  { value: "100+", label: "International Brands" },
]

export const freePDFs: FreePDF[] = [
  {
    title: "Monochrome Mastery: Editing for Expression",
    description: "A practical guide to converting images with purpose and emotional depth.",
    icon: "📖",
  },
  {
    title: "Pricing Your Photography With Confidence",
    description: "Break through the pricing barrier and charge what your work is truly worth.",
    icon: "💰",
  },
  {
    title: "5 Shifts to Go from £500 to £5,000 Clients",
    description: "The mindset and strategy shifts that attract premium clients consistently.",
    icon: "🚀",
  },
]
