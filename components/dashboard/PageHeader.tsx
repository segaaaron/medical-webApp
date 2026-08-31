"use client"

interface PageHeaderProps {
  title: string
  description?: string
  /** Acciones a la derecha del título (botones secundarios, enlaces). */
  actions?: React.ReactNode
}

/**
 * Cabecera de página del panel.
 *
 * El guardado ya no vive aquí: en formularios de quince campos obligaba a subir
 * hasta arriba para guardar y no decía si había cambios sin guardar. Eso es
 * ahora `SaveBar`, fija al pie del formulario.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl" style={{ fontFamily: "var(--font-heading)", color: "var(--prem-fg)" }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm mt-1" style={{ color: "var(--prem-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  )
}
