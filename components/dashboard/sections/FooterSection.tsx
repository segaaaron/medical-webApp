"use client"
import { Plus, Trash2 } from "lucide-react"
import { FormField } from "@/components/ui/FormField"
import { INPUT, type SectionProps } from "./types"

export function FooterSection({ data, setData }: SectionProps) {
  function updateGroup(i: number, title: string) {
    const groups = [...data.footerGroups]
    groups[i] = { ...groups[i], title }
    setData({ ...data, footerGroups: groups })
  }

  function addGroup() {
    setData({
      ...data,
      footerGroups: [...data.footerGroups, { title: "", links: [] }],
    })
  }

  function removeGroup(i: number) {
    setData({ ...data, footerGroups: data.footerGroups.filter((_, idx) => idx !== i) })
  }

  function addLink(groupIdx: number) {
    const groups = [...data.footerGroups]
    groups[groupIdx] = {
      ...groups[groupIdx],
      links: [...groups[groupIdx].links, { label: "", href: "", external: false }],
    }
    setData({ ...data, footerGroups: groups })
  }

  function updateLink(groupIdx: number, linkIdx: number, field: string, value: string | boolean) {
    const groups = [...data.footerGroups]
    const links = [...groups[groupIdx].links]
    links[linkIdx] = { ...links[linkIdx], [field]: value }
    groups[groupIdx] = { ...groups[groupIdx], links }
    setData({ ...data, footerGroups: groups })
  }

  function removeLink(groupIdx: number, linkIdx: number) {
    const groups = [...data.footerGroups]
    groups[groupIdx] = {
      ...groups[groupIdx],
      links: groups[groupIdx].links.filter((_, idx) => idx !== linkIdx),
    }
    setData({ ...data, footerGroups: groups })
  }

  return (
    <>
      {data.footerGroups.map((group, gi) => (
        <div key={gi} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Grupo #{gi + 1}</span>
            <button
              onClick={() => removeGroup(gi)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={13} />
              Eliminar grupo
            </button>
          </div>
          <FormField label="Titulo del grupo">
            <input className={INPUT} value={group.title} onChange={(e) => updateGroup(gi, e.target.value)} />
          </FormField>

          <h4 className="text-xs font-medium text-gray-500 mt-1">Enlaces</h4>
          {group.links.map((link, li) => (
            <div key={li} className="flex items-center gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={link.label}
                onChange={(e) => updateLink(gi, li, "label", e.target.value)}
                placeholder="Texto"
              />
              <input
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={link.href}
                onChange={(e) => updateLink(gi, li, "href", e.target.value)}
                placeholder="Href"
              />
              <label className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                <input
                  type="checkbox"
                  checked={link.external ?? false}
                  onChange={(e) => updateLink(gi, li, "external", e.target.checked)}
                  className="rounded border-gray-300"
                />
                Ext
              </label>
              <button onClick={() => removeLink(gi, li)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => addLink(gi)}
            className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-700 transition-colors"
          >
            <Plus size={15} />
            Anadir enlace
          </button>
        </div>
      ))}
      <button
        onClick={addGroup}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
      >
        <Plus size={16} />
        Anadir grupo
      </button>
    </>
  )
}
