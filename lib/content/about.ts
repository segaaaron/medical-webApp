import { cache } from "react"
import type { HeroStat } from "@/types"
import { fromService } from "./service"
import { parseAbout, type AboutData } from "./parse/about"
import { ABOUT_FALLBACK } from "./fallback/about"

export type { AboutData }

/** «Sobre la doctora» (`/about`). */
export const getAbout = cache(() =>
  fromService("/about", parseAbout, ABOUT_FALLBACK, { revalidate: 300 })
)

/**
 * Las estadísticas del panel como frase: «12+ años de experiencia y 1000
 * pacientes atendidos». Cada par valor + etiqueta se cita entero, sin
 * interpretar el número. Sin estadísticas (respaldo o campos vacíos) devuelve
 * "" y quien la use debe omitir la afirmación, no inventarla.
 */
export function statsClaim(stats: HeroStat[]): string {
  const parts = stats.map((s) => `${s.value} ${s.label.toLocaleLowerCase("es")}`)
  if (parts.length < 2) return parts.join("")
  return `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`
}
