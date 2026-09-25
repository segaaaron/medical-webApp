"use client"

import { useEffect, useRef, useState } from "react"
import { History, ImageIcon, X } from "lucide-react"

/**
 * Borrador local de los formularios del blog (nuevo / editar).
 *
 * Escribir un artículo puede llevar horas sin una sola petición: si la sesión
 * expira, el navegador se cierra o algo falla al guardar, el texto sigue en
 * `localStorage` y se ofrece recuperarlo al volver. Solo se guardan los campos
 * de texto — nunca tokens ni la imagen (un File no se serializa).
 */

export interface BlogDraftValues {
  title: string
  excerpt: string
  content: string
  published: boolean
}

interface StoredDraft {
  values: BlogDraftValues
  savedAt: number
  /** Había una imagen nueva seleccionada que el borrador no conserva. */
  hasImage: boolean
}

const DEBOUNCE_MS = 1000

export const blogDraftKey = (postId: string | null) => `blog-draft:v1:${postId ?? "new"}`

function sameValues(a: BlogDraftValues, b: BlogDraftValues): boolean {
  return a.title === b.title && a.excerpt === b.excerpt && a.content === b.content && a.published === b.published
}

function readDraft(key: string): StoredDraft | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDraft
    const v = parsed?.values
    if (!v || typeof v.title !== "string" || typeof v.content !== "string" || typeof parsed.savedAt !== "number") {
      return null
    }
    return {
      values: { title: v.title, excerpt: typeof v.excerpt === "string" ? v.excerpt : "", content: v.content, published: v.published === true },
      savedAt: parsed.savedAt,
      hasImage: parsed.hasImage === true,
    }
  } catch {
    return null
  }
}

function writeDraft(key: string, draft: StoredDraft | null): void {
  try {
    if (draft) window.localStorage.setItem(key, JSON.stringify(draft))
    else window.localStorage.removeItem(key)
  } catch {
    // Almacenamiento lleno o bloqueado (modo privado): el borrador es un extra.
  }
}

interface UseBlogDraftOptions {
  storageKey: string
  values: BlogDraftValues
  /** Valores de partida (vacíos o los del servidor): igual a esto = sin borrador. */
  baseline: BlogDraftValues
  /** false mientras se cargan los datos del artículo (editar). */
  ready: boolean
  hasImage: boolean
  onRecover: (values: BlogDraftValues) => void
}

export function useBlogDraft({ storageKey, values, baseline, ready, hasImage, onRecover }: UseBlogDraftOptions) {
  const [checked, setChecked] = useState(false)
  const [pending, setPending] = useState<StoredDraft | null>(null)
  const [imageNotice, setImageNotice] = useState(false)
  const clearedRef = useRef(false)
  const latestRef = useRef<StoredDraft | null>(null)
  // El borrador pendiente de decidir vive aparte: así el autoguardado de lo que
  // se escribe ahora (clave principal) nunca lo pisa, aunque se ignore el aviso.
  const pendingKey = `${storageKey}:pending`

  // Al abrir (y tras cargar el artículo): ¿hay un borrador distinto de lo actual?
  useEffect(() => {
    if (!ready || checked) return
    const differs = (d: StoredDraft | null) => (d && !sameValues(d.values, baseline) ? d : null)
    // ponytail: un solo pendiente. Si se ignoró el aviso Y se escribió otro texto,
    // al volver se ofrece ese más reciente y el anterior se reemplaza.
    const main = differs(readDraft(storageKey))
    if (main) writeDraft(pendingKey, main)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage solo existe en el cliente; leerlo en render rompería la hidratación
    setPending(main ?? differs(readDraft(pendingKey)))
    setChecked(true)
  }, [ready, checked, storageKey, pendingKey, baseline])

  // Autoguardado con debounce (también con el aviso abierto: lo nuevo se guarda).
  useEffect(() => {
    if (!checked || clearedRef.current) return
    const draft = sameValues(values, baseline) ? null : { values, savedAt: Date.now(), hasImage }
    latestRef.current = draft
    const timer = window.setTimeout(() => writeDraft(storageKey, draft), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [checked, values, baseline, hasImage, storageKey])

  // Cierre de pestaña o navegación completa (p. ej. ir al login) dentro del debounce.
  useEffect(() => {
    function flush() {
      if (checked && !clearedRef.current) writeDraft(storageKey, latestRef.current)
    }
    window.addEventListener("pagehide", flush)
    return () => window.removeEventListener("pagehide", flush)
  }, [checked, storageKey])

  return {
    pending,
    imageNotice,
    recover() {
      if (!pending) return
      // Si ya escribió algo nuevo, ese texto pasa a ser el pendiente: nada se pierde.
      const current = sameValues(values, baseline) ? null : { values, savedAt: Date.now(), hasImage }
      onRecover(pending.values)
      setImageNotice(pending.hasImage)
      writeDraft(pendingKey, current)
      setPending(current)
    },
    discard() {
      writeDraft(pendingKey, null)
      setPending(null)
    },
    dismissImageNotice: () => setImageNotice(false),
    /** Tras guardar con éxito: borra el borrador y detiene el autoguardado. */
    clear() {
      clearedRef.current = true
      writeDraft(storageKey, null)
    },
  }
}

type BlogDraftState = ReturnType<typeof useBlogDraft>

/** Aviso de borrador pendiente + nota de imagen tras recuperarlo. */
export function BlogDraftBanner({ draft }: { draft: BlogDraftState }) {
  if (draft.pending) {
    const when = new Date(draft.pending.savedAt).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" })
    return (
      <div
        role="status"
        className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
        style={{ borderColor: "rgba(184,151,59,0.45)", backgroundColor: "var(--vintage-parchment)" }}
      >
        <History size={18} className="shrink-0" style={{ color: "var(--vintage-gold-dark)" }} aria-hidden="true" />
        <p className="flex-1 min-w-[200px] text-sm text-gray-700">
          Tienes un borrador sin guardar del <strong>{when}</strong>.
        </p>
        <div className="flex gap-2">
          <button type="button" className="dash-btn dash-btn--ghost" onClick={draft.discard}>
            Descartar
          </button>
          <button type="button" className="dash-btn dash-btn--primary" onClick={draft.recover}>
            Recuperar
          </button>
        </div>
      </div>
    )
  }

  if (draft.imageNotice) {
    return (
      <div
        role="status"
        className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3"
        style={{ borderColor: "rgba(184,151,59,0.45)", backgroundColor: "var(--vintage-parchment)" }}
      >
        <ImageIcon size={18} className="shrink-0 mt-0.5" style={{ color: "var(--vintage-gold-dark)" }} aria-hidden="true" />
        <p className="flex-1 text-sm text-gray-700">
          Borrador recuperado. La imagen de portada no se guarda en el borrador: vuelve a seleccionarla antes de guardar.
        </p>
        <button
          type="button"
          onClick={draft.dismissImageNotice}
          aria-label="Cerrar aviso"
          className="p-0.5 rounded-md text-gray-500 hover:bg-black/10 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return null
}
