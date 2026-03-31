"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2, Pencil, X, Check } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"

interface Treatment {
  id: string
  name: string
  description: string | null
  longDescription: string | null
  price: number
  category: string
  imageUrl: string | null
  active: boolean
}

const EMPTY: Omit<Treatment, "id"> = {
  name: "",
  description: "",
  longDescription: "",
  price: 0,
  category: "",
  imageUrl: "",
  active: true,
}

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"

export default function TratamientosDashboardPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Treatment, "id">>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/treatments")
    if (res.ok) setTreatments(await res.json())
    else setError("No se pudo cargar la lista de tratamientos.")
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditId(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  function openEdit(t: Treatment) {
    setEditId(t.id)
    setForm({ name: t.name, description: t.description ?? "", longDescription: t.longDescription ?? "", price: t.price, category: t.category, imageUrl: t.imageUrl ?? "", active: t.active })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name || !form.category || !form.price) return
    setSaving(true)
    const url = editId ? `/api/treatments/${editId}` : "/api/treatments"
    const method = editId ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    })
    if (res.ok) {
      setShowForm(false)
      await load()
    } else {
      const data = await res.json()
      setError(data.error ?? "Error al guardar")
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este tratamiento?")) return
    await fetch(`/api/treatments/${id}`, { method: "DELETE" })
    await load()
  }

  return (
    <>
      <PageHeader
        title="Tratamientos"
        description="Gestiona el catálogo de tratamientos del consultorio."
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <EditorCard title={editId ? "Editar tratamiento" : "Nuevo tratamiento"}>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nombre *">
              <input className={INPUT_CLS} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Toxina Botulínica" />
            </FormField>
            <FormField label="Categoría *">
              <input className={INPUT_CLS} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Facial" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Precio *">
              <input type="number" className={INPUT_CLS} value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} placeholder="150" />
            </FormField>
            <FormField label="URL de imagen">
              <input className={INPUT_CLS} value={form.imageUrl ?? ""} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </FormField>
          </div>
          <FormField label="Descripción corta">
            <input className={INPUT_CLS} value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <FormField label="Descripción larga">
            <textarea className={INPUT_CLS} rows={4} value={form.longDescription ?? ""} onChange={e => setForm({ ...form, longDescription: e.target.value })} />
          </FormField>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="rounded" />
              Activo (visible en el sitio)
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: "#673de6" }}
            >
              <Check size={15} />
              {saving ? "Guardando..." : editId ? "Actualizar" : "Crear tratamiento"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </EditorCard>
      )}

      {/* List */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{treatments.length} tratamiento(s)</p>
          {!showForm && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: "#673de6" }}
            >
              <Plus size={15} />
              Nuevo tratamiento
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : treatments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p className="text-gray-400 text-sm">No hay tratamientos. Crea el primero.</p>
          </div>
        ) : (
          treatments.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800 text-sm">{t.name}</span>
                  {!t.active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Inactivo</span>}
                </div>
                <p className="text-xs text-gray-400">{t.category} · ${t.price.toLocaleString()}</p>
                {t.description && <p className="text-xs text-gray-500 mt-1 truncate">{t.description}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => openEdit(t)}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
