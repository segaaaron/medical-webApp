"use client"

import { useId, useState } from "react"
import { Upload, X } from "lucide-react"

interface ImageDropzoneProps {
  /** URL de preview actual (blob o remota). Vacío = sin imagen. */
  preview?: string
  /** Se llama con el archivo seleccionado o soltado. */
  onFile: (file: File) => void
  /** Opcional: quitar la imagen actual. Si no se pasa, no se muestra el botón de quitar. */
  onRemove?: () => void
  /** Texto del área (se antepone "Cambiar"/"Seleccionar" automáticamente). */
  hint?: string
  /** Clase del thumbnail de preview. */
  previewClassName?: string
  /** id del input (para el label). Si no se pasa, se genera. */
  id?: string
}

/**
 * Campo de imagen con click-para-seleccionar Y arrastrar-y-soltar.
 * Reutilizable en todos los formularios del dashboard.
 */
export function ImageDropzone({
  preview,
  onFile,
  onRemove,
  hint = "(JPG, PNG, WebP)",
  previewClassName = "h-32 rounded-lg object-cover border border-gray-200",
  id,
}: ImageDropzoneProps) {
  const generatedId = useId()
  const inputId = id ?? `img-${generatedId}`
  const [dragOver, setDragOver] = useState(false)

  function pickImageFile(files: FileList | null) {
    const file = Array.from(files ?? []).find((f) => f.type.startsWith("image/"))
    if (file) onFile(file)
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          pickImageFile(e.dataTransfer.files)
        }}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed text-sm cursor-pointer transition-colors ${
          dragOver
            ? "border-[var(--vintage-gold)] bg-[rgba(184,151,59,0.08)] text-[var(--vintage-gold)]"
            : "border-gray-300 text-gray-500 hover:border-[var(--vintage-gold)] hover:text-[var(--vintage-gold)]"
        }`}
      >
        <Upload size={15} />
        {dragOver
          ? "Suelta la imagen aquí"
          : `${preview ? "Cambiar" : "Seleccionar"} imagen o arrástrala aquí ${hint}`}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => pickImageFile(e.target.files)}
        />
      </label>

      {preview && (
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Vista previa" className={previewClassName} />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-white rounded-full border border-gray-200 p-0.5 hover:bg-red-50"
              aria-label="Eliminar imagen"
            >
              <X size={12} className="text-gray-500" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
