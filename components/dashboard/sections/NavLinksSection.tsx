"use client"
import { Plus, Trash2, ChevronDown } from "lucide-react"
import { useState } from "react"
import { FormField } from "@/components/ui/FormField"
import { INPUT, type SectionProps } from "./types"

export function NavLinksSection({ data, setData }: SectionProps) {
  const [expandedLink, setExpandedLink] = useState<number | null>(null)

  function updateLink(i: number, field: string, value: string | boolean) {
    const navLinks = [...data.navLinks]
    navLinks[i] = { ...navLinks[i], [field]: value }
    setData({ ...data, navLinks })
  }

  function addLink() {
    setData({
      ...data,
      navLinks: [...data.navLinks, { label: "", href: "", children: [] }],
    })
  }

  function removeLink(i: number) {
    setData({ ...data, navLinks: data.navLinks.filter((_, idx) => idx !== i) })
  }

  function addChild(parentIdx: number) {
    const navLinks = [...data.navLinks]
    const children = [...(navLinks[parentIdx].children ?? []), { label: "", href: "" }]
    navLinks[parentIdx] = { ...navLinks[parentIdx], children }
    setData({ ...data, navLinks })
  }

  function updateChild(parentIdx: number, childIdx: number, field: string, value: string) {
    const navLinks = [...data.navLinks]
    const children = [...(navLinks[parentIdx].children ?? [])]
    children[childIdx] = { ...children[childIdx], [field]: value }
    navLinks[parentIdx] = { ...navLinks[parentIdx], children }
    setData({ ...data, navLinks })
  }

  function removeChild(parentIdx: number, childIdx: number) {
    const navLinks = [...data.navLinks]
    const children = (navLinks[parentIdx].children ?? []).filter((_, idx) => idx !== childIdx)
    navLinks[parentIdx] = { ...navLinks[parentIdx], children }
    setData({ ...data, navLinks })
  }

  return (
    <>
      {data.navLinks.map((link, i) => {
        const hasChildren = (link.children ?? []).length > 0
        const isExpanded = expandedLink === i

        return (
          <div key={i} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Enlace #{i + 1}</span>
              <button
                onClick={() => removeLink(i)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={13} />
                Eliminar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Texto">
                <input className={INPUT} value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} />
              </FormField>
              <FormField label="Href">
                <input className={INPUT} value={link.href} onChange={(e) => updateLink(i, "href", e.target.value)} />
              </FormField>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={link.external ?? false}
                onChange={(e) => updateLink(i, "external", e.target.checked)}
                className="rounded border-gray-300"
              />
              Enlace externo
            </label>

            {/* Children (sublinks) */}
            <div>
              <button
                type="button"
                onClick={() => setExpandedLink(isExpanded ? null : i)}
                className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                Sub-enlaces ({(link.children ?? []).length})
              </button>

              {isExpanded && (
                <div className="mt-3 ml-4 flex flex-col gap-3">
                  {(link.children ?? []).map((child, ci) => (
                    <div key={ci} className="flex items-center gap-2">
                      <input
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        value={child.label}
                        onChange={(e) => updateChild(i, ci, "label", e.target.value)}
                        placeholder="Texto"
                      />
                      <input
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        value={child.href}
                        onChange={(e) => updateChild(i, ci, "href", e.target.value)}
                        placeholder="Href"
                      />
                      <button onClick={() => removeChild(i, ci)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addChild(i)}
                    className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-700 transition-colors"
                  >
                    <Plus size={15} />
                    Anadir sub-enlace
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
      <button
        onClick={addLink}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
      >
        <Plus size={16} />
        Anadir enlace
      </button>
    </>
  )
}
