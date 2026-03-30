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
  { title: "Toxina Botulínica (Botox)" },
  { title: "Rellenos de Ácido Hialurónico" },
  { title: "Bioestimulación con Polinucleótidos" },
  { title: "Mesoterapia Facial" },
  { title: "Radiofrecuencia Facial" },
  { title: "Peeling Químico" },
  { title: "Tratamiento de Manchas" },
  { title: "Hidratación Profunda" },
  { title: "Reducción de Medidas" },
  { title: "Tratamiento de Celulitis" },
  { title: "Depilación Láser" },
  { title: "Tratamiento de Estrías" },
]

export const coursePricing: CoursePricing = {
  earlyBird: 0,
  regular: 150000,
  currency: "$",
  savings: 150000,
}
