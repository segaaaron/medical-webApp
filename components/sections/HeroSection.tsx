/**
 * Envoltorio del hero. Sin `"use client"`: solo pasa props a `HeroLayout`, que
 * ya trae su propia directiva. La que había aquí arrastraba este archivo al
 * bundle del navegador sin que ejecute nada en él.
 */
import { HeroLayout } from "./HeroLayout"
import type { HeroStat, HeroCTA } from "@/types"

interface HeroSectionProps {
  stats: HeroStat[]
  ctas: HeroCTA[]
  tagline: string
  doctorName: string
  specialty: string
  subtitle: string
  backgroundImage: string
}

export function HeroSectionFallback({ stats, ctas, tagline, doctorName, specialty, subtitle }: HeroSectionProps) {
  return (
    <HeroLayout
      tagline={tagline}
      doctorName={doctorName}
      specialty={specialty}
      description={subtitle}
      ctas={ctas}
      stats={stats}
    />
  )
}
