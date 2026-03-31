"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2, Pencil, X, Check, Globe, EyeOff } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  imageUrl: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
}

const EMPTY: Omit<BlogPost, "id" | "slug" | "publishedAt" | "createdAt"> = {
  title: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  published: false,
}

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"

export default function BlogDashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/blog")
    if (res.ok) setPosts(await res.json())
    else setError("No se pudo cargar los artículos.")
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditId(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  function openEdit(p: BlogPost) {
    setEditId(p.id)
    setForm({ title: p.title, excerpt: p.excerpt ?? "", content: p.content, imageUrl: p.imageUrl ?? "", published: p.published })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title || !form.content) return
    setSaving(true)
    const url = editId ? `/api/blog/${editId}` : "/api/blog"
    const method = editId ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    if (!confirm("¿Eliminar este artículo?")) return
    await fetch(`/api/blog/${id}`, { method: "DELETE" })
    await load()
  }

  async function togglePublish(p: BlogPost) {
    await fetch(`/api/blog/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !p.published }),
    })
    await load()
  }

  return (
    <>
      <PageHeader
        title="Blog"
        description="Crea y gestiona los artículos del blog."
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <EditorCard title={editId ? "Editar artículo" : "Nuevo artículo"}>
          <FormField label="Título *">
            <input className={INPUT_CLS} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="5 beneficios del ácido hialurónico" />
          </FormField>
          <FormField label="Extracto (resumen corto)">
            <input className={INPUT_CLS} value={form.excerpt ?? ""} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
          </FormField>
          <FormField label="URL de imagen de portada">
            <input className={INPUT_CLS} value={form.imageUrl ?? ""} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
          </FormField>
          <FormField label="Contenido *">
            <textarea className={INPUT_CLS} rows={8} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Escribe aquí el contenido del artículo..." />
          </FormField>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="rounded" />
              Publicar inmediatamente
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
              {saving ? "Guardando..." : editId ? "Actualizar" : "Crear artículo"}
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
          <p className="text-sm text-gray-500">{posts.length} artículo(s)</p>
          {!showForm && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: "#673de6" }}
            >
              <Plus size={15} />
              Nuevo artículo
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p className="text-gray-400 text-sm">No hay artículos. Crea el primero.</p>
          </div>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800 text-sm">{p.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {p.published ? "Publicado" : "Borrador"}
                  </span>
                </div>
                {p.excerpt && <p className="text-xs text-gray-500 truncate">{p.excerpt}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString("es-BO")}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(p)}
                  title={p.published ? "Despublicar" : "Publicar"}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600 transition-colors"
                >
                  {p.published ? <EyeOff size={14} /> : <Globe size={14} />}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
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
