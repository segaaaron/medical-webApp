import type { Metadata } from "next"
import { backendFetch, extractList } from "@/lib/backend-client"
import { readContent } from "@/lib/store/content-store"
import { getFooterData } from "@/lib/data/footer"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ReviewForm } from "@/components/sections/ReviewForm"

export const metadata: Metadata = {
  title: "Deja tu Reseña — Dra. Yasmin Medrano",
  robots: { index: false, follow: false },
}

interface BackendTreatment {
  id: string
  name: string
  active: boolean
}

export default async function NuevaResenaPage() {
  const [content, footerData, treatmentsResult] = await Promise.all([
    readContent(),
    getFooterData(),
    backendFetch<BackendTreatment[]>("/treatments?active=true", { revalidate: 300 }),
  ])

  const treatments =
    treatmentsResult.error === null
      ? extractList<BackendTreatment>(treatmentsResult.data).map((t) => t.name)
      : []

  return (
    <>
      <Navbar links={content.navLinks} />
      <main
        className="min-h-dvh flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: "var(--prem-dark)" }}
      >
        <div className="w-full max-w-lg">
          <ReviewForm treatments={treatments} />
        </div>
      </main>
      <Footer data={footerData} />
    </>
  )
}
