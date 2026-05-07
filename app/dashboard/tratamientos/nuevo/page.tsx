"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/components/dashboard/Toast"
import {
  TreatmentForm,
  TreatmentFormValues,
  buildTreatmentFormData,
} from "@/components/dashboard/TreatmentForm"

export default function NuevoTratamientoPage() {
  const showToast = useToast()
  const router = useRouter()

  async function handleSubmit(values: TreatmentFormValues) {
    if (values.name.trim().length < 5) {
      showToast("error", "El nombre del tratamiento es obligatorio.")
      return
    }

    try {
      const res = await guardedFetch("/api/treatments", {
        method: "POST",
        body: buildTreatmentFormData(values),
      })

      if (res.ok) {
        showToast("success", "¡Tratamiento creado exitosamente!")
        router.push("/dashboard/tratamientos")
      } else {
        const data = await res.json()
        showToast("error", data.error ?? "Error al crear el tratamiento.")
      }
    } catch {
      showToast("error", "No se pudo conectar al servidor.")
    }
  }

  return (
    <>
      <nav aria-label="Volver" className="mb-6">
        <Link
          href="/dashboard/tratamientos"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "#B8973B" }}
        >
          <ArrowLeft size={16} />
          Volver
        </Link>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">Nuevo tratamiento</h1>
      <p className="text-sm text-gray-500 mb-6">Completa los campos para agregar un tratamiento al catálogo.</p>

      <TreatmentForm
        submitLabel="Crear tratamiento"
        onSubmit={handleSubmit}
      />
    </>
  )
}
