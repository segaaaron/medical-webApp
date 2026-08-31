"use client"

import { Save, CheckCircle, RotateCcw } from "lucide-react"

/**
 * Barra de guardado fija al pie del formulario.
 *
 * Dice en todo momento en qué estado está el trabajo — sin cambios, con cambios
 * sin guardar, o guardado — en lugar de dejar al usuario adivinando si pulsó el
 * botón. Se queda a la vista mientras se recorre el formulario.
 */
export function SaveBar({
  dirty,
  saving,
  saved,
  onSave,
  onReset,
}: {
  /** Hay cambios sin guardar. */
  dirty: boolean
  saving?: boolean
  /** Se acaba de guardar con éxito. */
  saved?: boolean
  onSave: () => void
  /** Descarta los cambios y vuelve a lo último guardado. */
  onReset?: () => void
}) {
  const status = saving
    ? "Guardando cambios…"
    : saved && !dirty
      ? "Todos los cambios guardados"
      : dirty
        ? "Tienes cambios sin guardar"
        : "Sin cambios pendientes"

  return (
    <div className="dash-savebar">
      <p className="flex items-center gap-2 text-xs" style={{ color: dirty ? "var(--vintage-gold-dark)" : "var(--prem-muted)" }}>
        <span
          aria-hidden="true"
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: dirty ? "var(--vintage-gold)" : saved ? "#1f7a52" : "var(--prem-border)" }}
        />
        <span aria-live="polite">{status}</span>
      </p>

      <div className="flex items-center gap-2">
        {onReset && dirty && !saving && (
          <button type="button" onClick={onReset} className="dash-btn dash-btn--ghost">
            <RotateCcw size={15} aria-hidden="true" />
            Descartar
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          aria-label={dirty ? "Guardar cambios" : "No hay cambios que guardar"}
          className={`dash-btn ${saved && !dirty ? "dash-btn--saved" : "dash-btn--primary"}`}
        >
          {saved && !dirty ? <CheckCircle size={16} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
          {saved && !dirty ? "Guardado" : "Guardar cambios"}
        </button>
      </div>
    </div>
  )
}
