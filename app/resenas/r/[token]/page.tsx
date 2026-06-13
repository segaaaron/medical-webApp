import type { Metadata } from "next"
import { backendFetch, extractList } from "@/lib/backend-client"
import { InviteReviewForm } from "@/components/sections/InviteReviewForm"
import { InviteErrorState } from "@/components/sections/InviteErrorState"

export const metadata: Metadata = {
  title: "Tu reseña — Dra. Yasmin Medrano",
  robots: { index: false, follow: false },
}

interface ValidateResponse {
  valid: boolean
  patient_name?: string
  patient_lastname?: string
  reason?: "used" | "expired" | "revoked" | "not_found"
}

interface BackendTreatment {
  id: string
  name: string
  active: boolean
}

export default async function InviteReviewPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const { data } = await backendFetch<ValidateResponse>(
    `/reviews/invites/validate/${token}`
  )

  if (!data?.valid) {
    return <InviteErrorState reason={data?.reason} />
  }

  const treatmentsResult = await backendFetch<BackendTreatment[]>(
    "/treatments?active=true",
    { revalidate: 300 }
  )
  const treatments =
    treatmentsResult.error === null
      ? extractList<BackendTreatment>(treatmentsResult.data).map((t) => t.name)
      : []

  return (
    <InviteReviewForm
      token={token}
      patientName={data.patient_name ?? ""}
      treatments={treatments}
    />
  )
}
