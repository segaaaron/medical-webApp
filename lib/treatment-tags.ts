// Etiquetas y colores semánticos de los tags de tratamiento.
// Compartido entre el grid público y el dashboard para mantener consistencia.

export const TAG_LABELS: Record<string, string> = {
  POPULAR:       "Popular",
  INNOVADOR:     "Innovador",
  RECOMENDADO:   "Recomendado",
  DEFINITIVO:    "Definitivo",
  ESENCIAL:      "Esencial",
  ESPECIALIZADO: "Especializado",
}

export const TAG_COLORS: Record<string, string> = {
  POPULAR:       "oklch(46% 0.17 35)",   // terracota oscuro — WCAG 4.5:1 vs blanco
  INNOVADOR:     "#0771A0",              // teal oscuro — WCAG compliant
  RECOMENDADO:   "#15803D",              // verde oscuro — WCAG compliant
  DEFINITIVO:    "#8A6E27",              // gold oscuro — WCAG compliant
  ESENCIAL:      "#B45309",              // ámbar oscuro — WCAG compliant
  ESPECIALIZADO: "#6D28D9",              // violeta oscuro — WCAG compliant
}

export const DEFAULT_TAG_COLOR = "oklch(46% 0.17 35)"
