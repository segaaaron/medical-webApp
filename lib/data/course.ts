import type { CourseIncluded, CourseModule, CoursePricing } from "@/types"

// iconName is a string — safe to pass across the server→client boundary
export const courseIncluded: CourseIncluded[] = [
  { iconName: "Play", text: "31+ In-Depth Video Lessons" },
  { iconName: "FileText", text: "Full Transcripts for Every Module" },
  { iconName: "Download", text: "Downloadable PDFs & Workbooks" },
  { iconName: "Download", text: "Exclusive Lightroom Presets" },
  { iconName: "CheckCircle", text: "Lifetime Access to All Updates" },
  { iconName: "CheckCircle", text: "Private Student Community" },
]

export const courseModules: CourseModule[] = [
  { title: "Introduction to Monochrome Vision" },
  { title: "The Zone System — Foundations" },
  { title: "TRIOME™ Method Explained" },
  { title: "Landscape Photography in Mono" },
  { title: "Wedding Photography in Mono" },
  { title: "Street Photography Mastery" },
  { title: "Fashion & Editorial Mono" },
  { title: "Portrait Photography in Black & White" },
  { title: "Tonal Control & Zone Mapping" },
  { title: "Advanced Editing Workflow" },
  { title: "Lightroom Monochrome Techniques" },
  { title: "Print Preparation & Output" },
]

export const coursePricing: CoursePricing = {
  earlyBird: 297,
  regular: 597,
  currency: "£",
  savings: 300,
}
