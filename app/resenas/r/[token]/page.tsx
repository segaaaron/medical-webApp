import type { Metadata } from "next"
import { validateInvite } from "@/lib/content/reviews"
import { getActiveTreatments } from "@/lib/content/treatments"
import { InviteReviewForm } from "@/components/sections/InviteReviewForm"
import { InviteErrorState } from "@/components/sections/InviteErrorState"

export const metadata: Metadata = {
  title: "Tu reseña — Dra. Yasmin Medrano",
  robots: { index: false, follow: false },
}

export default async function InviteReviewPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const data = await validateInvite(token)

  if (!data?.valid) {
    return <InviteErrorState reason={data?.reason} />
  }

  const { data: activos } = await getActiveTreatments()
  const treatments = activos.map((t) => t.name)

  return (
    <InviteReviewForm
      token={token}
      patientName={data.patient_name ?? ""}
      treatments={treatments}
    />
  )
}
