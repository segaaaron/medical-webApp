"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, Trash2, Pencil } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { useToast } from "@/components/dashboard/Toast"
import { resolveImageUrl } from "@/lib/image-utils"
import { DeleteTreatmentDialog } from "@/components/ui/DialogAlert"

interface Treatment {
  id: string
  name: string
  description: string | null
  category: string
  price: string | null
  imageUrl: string | null
  active: boolean
}

export default function TratamientosDashboardPage() {
  const showToast = useToast()
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Treatment | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/treatments")
    if (res.ok) setTreatments(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/treatments/${deleteTarget.id}`, { method: "DELETE" })
    if (res.ok) showToast("success", `"${deleteTarget.name}" fue eliminado correctamente.`)
    else showToast("error", "No se pudo eliminar el tratamiento. Intenta de nuevo.")
    setDeleteTarget(null)
    await load()
  }

  return (
    <>
      <PageHeader
        title="Tratamientos"
        description="Gestiona el catálogo de tratamientos del consultorio."
      />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{treatments.length} tratamiento(s)</p>
        <Link
          href="/dashboard/tratamientos/nuevo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#b5496a" }}
        >
          <Plus size={15} />
          Nuevo tratamiento
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : treatments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No hay tratamientos. Crea el primero.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {treatments.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex gap-0"
            >
              {/* Thumbnail */}
              <div className="w-28 shrink-0 bg-gray-100">
                {t.imageUrl ? (
                  <img
                    src={t.imageUrl}
                    alt={t.name}
                    width={112}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center min-h-[80px]">
                    <span className="text-gray-300 text-xs">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 items-center gap-4 px-5 py-4 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{t.name}</span>
                    {t.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-gray-300 text-gray-500 tracking-wide">
                        {t.category}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                      {t.active ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                  {t.description && (
                    <p className="text-xs text-gray-500 truncate">{t.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/dashboard/tratamientos/${t.id}/editar`}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-[#b5496a] hover:text-[#b5496a] transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteTreatmentDialog
        open={deleteTarget !== null}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        treatmentName={deleteTarget?.name ?? ""}
      />
    </>
  )
}
