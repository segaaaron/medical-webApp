import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Reseñas — Dra. Yasmin Medrano",
  robots: { index: false, follow: false },
}

// The open review form has been retired. Reviews now come exclusively from
// personal invitation links (/resenas/r/[token]).
export default function NuevaResenaPage() {
  redirect("/")
}
