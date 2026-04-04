import { type ReactNode } from "react"

interface EditorCardProps {
  title: string
  description?: string
  children: ReactNode
}

export function EditorCard({ title, description, children }: EditorCardProps) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" aria-labelledby={`editor-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 id={`editor-${title.replace(/\s+/g, "-").toLowerCase()}`} className="font-semibold text-gray-800 text-base">{title}</h2>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-5 flex flex-col gap-5">{children}</div>
    </section>
  )
}
