"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/components/dashboard/Toast"
import { resolveImageUrl } from "@/lib/image-utils"
import {
  TreatmentForm,
  TreatmentFormValues,
  buildTreatmentFormData,
} from "@/components/dashboard/TreatmentForm"

export default function EditarTratamientoPage() {
  const showToast = useToast()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [initialValues, setInitialValues] = useState<Partial<TreatmentFormValues>>()

  useEffect(() => {
    async function fetchTreatment() {
      try {
        const res = await fetch(`/api/treatments/${id}`)
        if (!res.ok) {
          showToast("error", "No se pudo cargar el tratamiento.")
          return
        }
        const treatment = await res.json()
        setInitialValues({
          name: treatment.name ?? "",
          tag: treatment.tag ?? "",
          description: treatment.description ?? "",
          price: treatment.price ?? "",
          active: treatment.active ?? false,
          imagePreview: treatment.imageUrl ?? "",
        })
      } catch {
        showToast("error", "No se pudo conectar al servidor.")
      } finally {
        setLoading(false)
      }
    }
    fetchTreatment()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleSubmit(values: TreatmentFormValues) {
    if (values.name.trim().length < 5) {
      showToast("error", "El nombre del tratamiento es obligatorio.")
      return
    }

    try {
      const res = await fetch(`/api/treatments/${id}`, {
        method: "PUT",
        body: buildTreatmentFormData(values),
      })

      if (res.ok) {
        showToast("success", "¡Tratamiento actualizado exitosamente!")
        router.push("/dashboard/tratamientos?updated=1")
      } else {
        const data = await res.json()
        showToast("error", data.error ?? "Error al guardar el tratamiento.")
      }
    } catch {
      showToast("error", "No se pudo conectar al servidor.")
    }
  }

  const backNav = (
    <nav aria-label="Volver" className="mb-6">
      <Link
        href="/dashboard/tratamientos"
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: "#b5496a" }}
      >
        <ArrowLeft size={16} />
        Volver
      </Link>
    </nav>
  )

  if (loading) {
    return (
      <>
        {backNav}
        <p className="text-gray-400 text-sm">Cargando tratamiento...</p>
      </>
    )
  }

  return (
    <>
      {backNav}

      <h1 className="text-2xl font-bold text-gray-800 mb-1">Editar tratamiento</h1>
      <p className="text-sm text-gray-500 mb-6">Modifica los campos y guarda los cambios.</p>

      <TreatmentForm
        initialValues={initialValues}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
      />
    </>
  )
}
