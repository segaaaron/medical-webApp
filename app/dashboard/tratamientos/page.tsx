"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Plus, Trash2, Pencil, GripVertical, ArrowUpDown, Save, X } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { guardedFetch } from "@/lib/client-fetch"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { useToast } from "@/components/dashboard/Toast"
import { DeleteTreatmentDialog } from "@/components/ui/DialogAlert"

interface Treatment {
  id: string
  name: string
  description: string | null
  category: string
  price: string | null
  imageUrl: string | null
  active: boolean
  order?: number
}

// ─── Sortable row ────────────────────────────────────────────────────────────

function SortableRow({
  treatment,
  reorderMode,
  onEdit,
  onDelete,
}: {
  treatment: Treatment
  reorderMode: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: treatment.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex gap-0"
    >
      {/* Drag handle — only in reorder mode */}
      {reorderMode && (
        <button
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-10 shrink-0 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors touch-none"
          aria-label="Arrastrar para reordenar"
          tabIndex={0}
        >
          <GripVertical size={18} />
        </button>
      )}

      {/* Thumbnail */}
      <div className="w-28 shrink-0 bg-gray-100">
        {treatment.imageUrl ? (
          <img
            src={treatment.imageUrl}
            alt={treatment.name}
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
            <span className="font-semibold text-gray-800 text-sm">{treatment.name}</span>
            {treatment.category && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-gray-300 text-gray-500 tracking-wide">
                {treatment.category}
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full ${treatment.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
              {treatment.active ? "Publicado" : "Borrador"}
            </span>
          </div>
          {treatment.description && (
            <p className="text-xs text-gray-500 truncate">{treatment.description}</p>
          )}
        </div>

        {/* Actions — hidden in reorder mode */}
        {!reorderMode && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-[#B8973B] hover:text-[#B8973B] transition-colors"
              aria-label="Editar"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
              aria-label="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TratamientosDashboardPage() {
  const showToast = useToast()
  const router = { push: (url: string) => { window.location.href = url } }

  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Treatment | null>(null)
  const [reorderMode, setReorderMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [originalOrder, setOriginalOrder] = useState<Treatment[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function load() {
    setLoading(true)
    const res = await guardedFetch("/api/treatments")
    if (res.ok) {
      const data: Treatment[] = await res.json()
      const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setTreatments(sorted)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function enterReorderMode() {
    setOriginalOrder([...treatments])
    setReorderMode(true)
  }

  function cancelReorder() {
    setTreatments(originalOrder)
    setReorderMode(false)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setTreatments((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === active.id)
      const newIndex = prev.findIndex((t) => t.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  async function saveOrder() {
    setSaving(true)
    const payload = treatments.map((t, index) => ({ id: t.id, order: index }))
    const res = await guardedFetch("/api/treatments/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setSaving(false)

    if (res.ok) {
      showToast("success", "¡Reordenamiento exitoso! Los tratamientos ahora aparecen en el nuevo orden.")
      setReorderMode(false)
    } else {
      showToast("error", "No se pudo guardar el orden. El backend aún no tiene este endpoint.")
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await guardedFetch(`/api/treatments/${deleteTarget.id}`, { method: "DELETE" })
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

      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <p className="text-sm text-gray-500">{treatments.length} tratamiento(s)</p>

        <div className="flex gap-2 flex-wrap">
          {reorderMode ? (
            <>
              <button
                onClick={cancelReorder}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X size={15} />
                Cancelar
              </button>
              <button
                onClick={saveOrder}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "#B8973B" }}
              >
                <Save size={15} />
                {saving ? "Guardando..." : "Guardar orden"}
              </button>
            </>
          ) : (
            <>
              {treatments.length > 1 && (
                <button
                  onClick={enterReorderMode}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ArrowUpDown size={15} />
                  Reordenar
                </button>
              )}
              <Link
                href="/dashboard/tratamientos/nuevo"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#B8973B" }}
              >
                <Plus size={15} />
                Nuevo tratamiento
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Reorder hint */}
      {reorderMode && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{ backgroundColor: "rgba(184,151,59,0.08)", color: "#8A6E27", border: "1px solid rgba(184,151,59,0.2)" }}>
          <GripVertical size={15} />
          Arrastra las filas para cambiar el orden. Presiona <strong>Guardar orden</strong> para confirmar.
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : treatments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No hay tratamientos. Crea el primero.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={treatments.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-4">
              {treatments.map((t) => (
                <SortableRow
                  key={t.id}
                  treatment={t}
                  reorderMode={reorderMode}
                  onEdit={() => { window.location.href = `/dashboard/tratamientos/${t.id}/editar` }}
                  onDelete={() => setDeleteTarget(t)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
