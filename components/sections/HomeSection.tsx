/**
 * Envoltorio del hero de la portada (panel o su respaldo entero, ver
 * lib/content/home.ts). Sin `"use client"`: la interactividad vive en
 * `HeroLayout`, no aquí.
 */
import { HeroLayout } from "./HeroLayout"
import type { HeroCTA, HeroStat } from "@/types"

export interface homeHeaderSection {
  specialties: string
  doctorName: string
  subtitleSpecialities: string
  description: string
}

interface Prompt {
  headerInfo: homeHeaderSection
  ctas: HeroCTA[]
  stats: HeroStat[]
}

export function HomeSection({ headerInfo, ctas, stats }: Prompt) {
  return (
    <HeroLayout
      tagline={headerInfo.specialties}
      doctorName={headerInfo.doctorName}
      specialty={headerInfo.subtitleSpecialities}
      description={headerInfo.description}
      ctas={ctas}
      stats={stats}
    />
  )
}
