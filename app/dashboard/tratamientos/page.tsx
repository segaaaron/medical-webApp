"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Plus, Trash2, Pencil, GripVertical, Grip, ArrowUpDown, Save, X, ImageOff } from "lucide-react"
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
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { guardedFetch } from "@/lib/client-fetch"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { DashboardPagination } from "@/components/dashboard/DashboardPagination"
import { useToast } from "@/components/dashboard/Toast"
import { useConfirm } from "@/components/dashboard/ConfirmDialog"
import { TAG_COLORS, DEFAULT_TAG_COLOR } from "@/lib/treatment-tags"

interface Treatment {
  id: string
  name: string
  description: string | null
  tag: string | null
  price: string | null
  imageUrl: string | null
  active: boolean
  order?: number
}

/** Convierte HTML enriquecido del editor en texto plano para el preview de la lista. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
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
    // Sin transición en la card arrastrada → sigue al cursor 1:1 (evita el lag).
    // Las demás cards conservan la transición de dnd-kit para reacomodarse suave.
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.92 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  const plainDescription = treatment.description ? stripHtml(treatment.description) : ""

  // En modo reordenar la card COMPLETA es el área de arrastre (más fácil que un handle chico).
  const dragHandleProps = reorderMode ? { ...attributes, ...listeners } : {}

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragHandleProps}
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
        reorderMode ? "cursor-grab active:cursor-grabbing select-none touch-none" : ""
      } ${
        isDragging
          ? "border-[var(--vintage-gold)] shadow-2xl"
          : "border-[rgba(184,151,59,0.18)] shadow-sm hover:shadow-xl hover:-translate-y-1"
      }`}
    >
      {/* Banner: imagen con gradiente + título superpuesto */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {treatment.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagen subida desde CMS (host arbitrario, admin-only) + draggable=false para dnd-kit: next/image no aplica
          <img
            src={treatment.imageUrl}
            alt={treatment.name}
            draggable={false}
            className={`absolute inset-0 w-full h-full object-cover ${
              reorderMode ? "" : "transition-transform duration-[600ms] ease-out group-hover:scale-105"
            }`}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(150deg, var(--primary-darker, #5c1f35) 0%, var(--primary-darkest, #3a0f20) 100%)" }}
          >
            <ImageOff size={26} style={{ color: "rgba(184,151,59,0.5)" }} />
          </div>
        )}

        {/* Gradiente para legibilidad del texto inferior */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(58,15,32,0.92) 0%, rgba(58,15,32,0.35) 38%, rgba(58,15,32,0) 65%)" }}
          aria-hidden="true"
        />

        {/* Tag + estado — pills arriba-izquierda */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {treatment.tag && (
            <span
              className="inline-flex items-center text-[10px] font-bold uppercase px-2.5 py-1 rounded-full text-white"
              style={{
                backgroundColor: TAG_COLORS[treatment.tag] ?? DEFAULT_TAG_COLOR,
                letterSpacing: "0.1em",
                boxShadow: "0 2px 8px rgba(58,15,32,0.3)",
              }}
            >
              {treatment.tag}
            </span>
          )}
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
            style={{
              // Fondo semántico: verde = visible en la web, gris cálido = fuera de
              // ella. El gris no compite con el dorado de los botones de acción.
              // El punto y el texto acompañan al color (nunca color a solas).
              backgroundColor: treatment.active ? "#1f7a52" : "#6f635a",
              color: "#fff",
              letterSpacing: "0.08em",
              boxShadow: "0 2px 8px rgba(58,15,32,0.25)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.85)" }} />
            {treatment.active ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Acciones — pills con texto, resaltadas al hover (ocultas en reordenar) */}
        {!reorderMode && (
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-bold text-white hover:brightness-110 transition-[filter,box-shadow]"
              style={{ backgroundColor: "var(--vintage-gold)", boxShadow: "0 4px 14px rgba(58,15,32,0.35)" }}
              aria-label={`Editar ${treatment.name}`}
            >
              <Pencil size={14} />
              Editar
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:scale-105 transition-transform"
              style={{ backgroundColor: "#d1455f", boxShadow: "0 4px 14px rgba(58,15,32,0.35)" }}
              aria-label={`Eliminar ${treatment.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}

        {/* Indicador de arrastre — visual, la card completa es el área de drag */}
        {reorderMode && (
          <>
            {/* Pill superior: "Arrastra" */}
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 h-8 rounded-full text-[10px] font-bold uppercase pointer-events-none"
              style={{
                backgroundColor: "rgba(255,255,255,0.92)",
                color: "var(--vintage-gold-dark, #9A7C2E)",
                letterSpacing: "0.08em",
                backdropFilter: "blur(6px)",
                boxShadow: "0 2px 10px rgba(58,15,32,0.25)",
              }}
              aria-hidden="true"
            >
              <Grip size={14} style={{ color: "var(--vintage-gold)" }} />
              Arrastra
            </div>
            {/* Ícono central de puntos */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(6px)", boxShadow: "0 4px 16px rgba(58,15,32,0.3)" }}
              >
                <Grip size={22} style={{ color: "var(--vintage-gold)" }} />
              </div>
            </div>
          </>
        )}

        {/* Título + precio superpuestos */}
        <div className="absolute inset-x-0 bottom-0 p-4 pt-8">
          <div className="flex items-end justify-between gap-3">
            <h3
              className="text-white text-lg leading-tight line-clamp-2 flex-1"
              style={{ fontFamily: "var(--font-heading, Georgia, serif)", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
            >
              {treatment.name}
            </h3>
            {treatment.price && (
              <span
                className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                style={{ backgroundColor: "var(--vintage-gold)", color: "#3a0f20", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
              >
                {treatment.price}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="px-5 py-4 flex-1">
        {plainDescription ? (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{plainDescription}</p>
        ) : (
          <p className="text-xs text-gray-300 italic">Sin descripción</p>
        )}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

/** Mismo tamaño de página que servía el backend (8): la vista no cambia. */
const PAGE_SIZE = 8

export default function TratamientosDashboardPage() {
  const showToast = useToast()

  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const confirm = useConfirm()
  const [reorderMode, setReorderMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [originalOrder, setOriginalOrder] = useState<Treatment[]>([])
  const [page, setPage] = useState(1)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /**
   * Lista completa desde la superficie de administración.
   *
   * Antes convivían dos contratos sobre la ruta pública: `?page=N` para la
   * tabla y `?all=true` para reordenar — y ninguno reenviaba el token, así que
   * el panel veía la web pública. Ahora hay una sola carga autenticada: la
   * tabla pagina en memoria y reordenar ya tiene todos los items delante.
   */
  const load = useCallback(async () => {
    setLoading(true)
    const res = await guardedFetch("/api/admin/treatments")
    if (res.ok) {
      const json = await res.json()
      const list: Treatment[] = (Array.isArray(json) ? json : []).sort(
        (a: Treatment, b: Treatment) => (a.order ?? 0) - (b.order ?? 0)
      )
      setTreatments(list)
      setOriginalOrder(list)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga de datos en mount
    load()
  }, [load])

  const totalCount = treatments.length
  // En reorder se arrastra sobre la lista entera: paginar partiría el drag.
  const totalPages = reorderMode ? 1 : Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visibleTreatments = reorderMode
    ? treatments
    : treatments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function enterReorderMode() {
    setOriginalOrder(treatments)
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
      setOriginalOrder([...treatments])
      setReorderMode(false)
    } else {
      const data = await res.json().catch(() => ({}))
      showToast("error", data.error ?? "No se pudo guardar el orden. Intenta de nuevo.")
    }
  }

  async function handleDelete(treatment: Treatment) {
    const ok = await confirm({
      title: "¿Eliminar tratamiento?",
      description: `Se borrará "${treatment.name}" de forma permanente. Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar tratamiento",
    })
    if (!ok) return
    const res = await guardedFetch(`/api/treatments/${treatment.id}`, { method: "DELETE" })
    if (res.ok) showToast("success", `"${treatment.name}" fue eliminado correctamente.`)
    else showToast("error", "No se pudo eliminar el tratamiento. Intenta de nuevo.")
    await load()
  }

  return (
    <>
      <PageHeader
        title="Tratamientos"
        description="Gestiona el catálogo de tratamientos del consultorio."
      />

      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <p className="text-sm text-gray-500">
          {totalCount} tratamiento{totalCount === 1 ? "" : "s"}
          {!reorderMode && totalPages > 1 && (
            <span className="text-gray-400"> · página {currentPage} de {totalPages}</span>
          )}
        </p>

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
                style={{ backgroundColor: "var(--vintage-gold)" }}
              >
                <Save size={15} />
                Guardar orden
              </button>
            </>
          ) : (
            <>
              {totalCount > 1 && (
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
                style={{ backgroundColor: "var(--vintage-gold)" }}
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

      {loading && treatments.length === 0 ? (
        null
      ) : treatments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No hay tratamientos. Crea el primero.</p>
        </div>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visibleTreatments.map((t) => t.id)} strategy={rectSortingStrategy}>
              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-5 transition-opacity duration-200"
                style={{ opacity: loading ? 0.6 : 1 }}
                aria-busy={loading}
              >
                {visibleTreatments.map((t) => (
                  <SortableRow
                    key={t.id}
                    treatment={t}
                    reorderMode={reorderMode}
                    onEdit={() => { window.location.href = `/dashboard/tratamientos/${t.id}/editar` }}
                    onDelete={() => handleDelete(t)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {!reorderMode && (
            <DashboardPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              label="Paginación de tratamientos"
            />
          )}
        </>
      )}


    </>
  )
}
