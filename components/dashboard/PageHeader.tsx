"use client"
import { Save, CheckCircle, Loader2 } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  saving?: boolean
  saved?: boolean
  saveDisabled?: boolean
  onSave?: () => void
}

export function PageHeader({ title, description, saving, saved, saveDisabled, onSave }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {onSave && (
        <button
          onClick={onSave}
          disabled={saving || saveDisabled}
          aria-label={saving ? "Guardando cambios" : saved ? "Cambios guardados" : "Guardar cambios"}
          aria-live="polite"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: saved ? "#00b090" : "#673de6" }}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : saved ? (
            <CheckCircle size={16} aria-hidden="true" />
          ) : (
            <Save size={16} aria-hidden="true" />
          )}
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
        </button>
      )}
    </header>
  )
}
