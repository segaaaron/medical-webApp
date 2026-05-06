"use client"
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
  backgroundImage: string  // kept in props for API compatibility, HeroLayout uses video
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
