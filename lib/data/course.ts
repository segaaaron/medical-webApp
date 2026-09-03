import type { CourseIncluded, CourseModule, CoursePricing } from "@/types"

// iconName is a string — safe to pass across the server→client boundary
export const courseIncluded: CourseIncluded[] = [
  { iconName: "CheckCircle", text: "Consulta de valoración personalizada" },
  { iconName: "CheckCircle", text: "Plan de tratamiento individualizado" },
  { iconName: "CheckCircle", text: "Seguimiento post-tratamiento" },
  { iconName: "CheckCircle", text: "Productos de calidad certificada" },
  { iconName: "CheckCircle", text: "Tecnología de última generación" },
  { iconName: "CheckCircle", text: "Atención médica especializada" },
]

export const courseModules: CourseModule[] = [
  { title: "Toxina Botulínica (Botox)", treatmentId: "botox" },
  { title: "Rellenos de Ácido Hialurónico", treatmentId: "rellenos" },
  { title: "Bioestimulación con Polinucleótidos", treatmentId: "bioestimulación" },
  { title: "Mesoterapia Facial", treatmentId: "mesoterapia" },
  { title: "Radiofrecuencia Facial", treatmentId: "radiofrecuencia" },
  { title: "Peeling Químico", treatmentId: "peeling" },
  { title: "Tratamiento de Manchas", treatmentId: "manchas" },
  { title: "Hidratación Profunda", treatmentId: "hidratacion" },
]

export const coursePricing: CoursePricing = {
  earlyBird: 0,
  regular: 150000,
  currency: "$",
  savings: 150000,
}
