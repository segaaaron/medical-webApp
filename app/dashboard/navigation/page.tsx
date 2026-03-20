"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import type { ContentStore } from "@/types/content"
import type { NavLink, FooterGroup, FooterLink } from "@/types"

export default function NavigationEditorPage() {
  const [navLinks, setNavLinks] = useState<NavLink[]>([])
  const [footerGroups, setFooterGroups] = useState<FooterGroup[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((c: ContentStore) => {
        setNavLinks(c.navLinks)
        setFooterGroups(c.footerGroups)
      })
  }, [])

  function updateNav(i: number, field: keyof NavLink, value: string) {
    const updated = [...navLinks]
    updated[i] = { ...updated[i], [field]: value }
    setNavLinks(updated)
  }

  function removeNav(i: number) {
    setNavLinks(navLinks.filter((_, idx) => idx !== i))
  }

  function addNav() {
    setNavLinks([...navLinks, { label: "", href: "/" }])
  }

  function updateFooterLink(gi: number, li: number, field: keyof FooterLink, value: string) {
    const groups = [...footerGroups]
    const links = [...groups[gi].links]
    links[li] = { ...links[li], [field]: value }
    groups[gi] = { ...groups[gi], links }
    setFooterGroups(groups)
  }

  function removeFooterLink(gi: number, li: number) {
    const groups = [...footerGroups]
    groups[gi] = { ...groups[gi], links: groups[gi].links.filter((_, idx) => idx !== li) }
    setFooterGroups(groups)
  }

  function addFooterLink(gi: number) {
    const groups = [...footerGroups]
    groups[gi] = { ...groups[gi], links: [...groups[gi].links, { label: "", href: "/" }] }
    setFooterGroups(groups)
  }

  async function handleSave() {
    setSaving(true)
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ navLinks, footerGroups }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      <PageHeader
        title="Navegación"
        description="Links del menú principal y del footer."
        saving={saving}
        saved={saved}
        onSave={handleSave}
      />

      <div className="flex flex-col gap-6">
        {/* Navbar links */}
        <EditorCard title="Menú principal" description="Links que aparecen en la barra de navegación.">
          <div className="flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-center">
                <div className="col-span-2">
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    value={link.label}
                    onChange={(e) => updateNav(i, "label", e.target.value)}
                    placeholder="Texto del link"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    value={link.href}
                    onChange={(e) => updateNav(i, "href", e.target.value)}
                    placeholder="href"
                  />
                </div>
                <button
                  onClick={() => removeNav(i)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addNav}
            className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-700 transition-colors"
          >
            <Plus size={15} />
            Añadir link
          </button>
        </EditorCard>

        {/* Footer groups */}
        {footerGroups.map((group, gi) => (
          <EditorCard key={gi} title={`Footer — ${group.title}`}>
            <div className="flex flex-col gap-2">
              {group.links.map((link, li) => (
                <div key={li} className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      value={link.label}
                      onChange={(e) => updateFooterLink(gi, li, "label", e.target.value)}
                      placeholder="Texto"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      value={link.href}
                      onChange={(e) => updateFooterLink(gi, li, "href", e.target.value)}
                      placeholder="href"
                    />
                  </div>
                  <button
                    onClick={() => removeFooterLink(gi, li)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => addFooterLink(gi)}
              className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-700 transition-colors"
            >
              <Plus size={15} />
              Añadir link
            </button>
          </EditorCard>
        ))}
      </div>
    </>
  )
}
