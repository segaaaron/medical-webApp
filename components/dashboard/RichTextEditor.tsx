"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import LinkExt from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import ImageExt from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import { useEffect, useCallback, useRef, useState } from "react"
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  Undo, Redo,
  Link as LinkIcon, ImageIcon,
  Code, RemoveFormatting,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  Highlighter, Palette, ChevronDown,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  onBlur?: () => void
  placeholder?: string
  hasError?: boolean
}

const BTN = "p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
const BTN_ACTIVE = "bg-[#B8973B]/10 text-[#B8973B]"
const SEP = <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />

const TEXT_COLORS = [
  "#000000", "#3a0f20", "#b5496a", "#6b21a8", "#1d4ed8",
  "#0891b2", "#047857", "#92400e", "#dc2626", "#ea580c",
  "#ca8a04", "#4b5563", "#6b7280", "#9ca3af", "#ffffff",
]

const HIGHLIGHT_COLORS = [
  "#fef9c3", "#fce7f3", "#ede9fe", "#dbeafe", "#dcfce7",
  "#ffedd5", "#fee2e2", "#f3f4f6",
]

function ColorPicker({
  colors,
  onSelect,
  icon,
  title,
  currentColor,
}: {
  colors: string[]
  onSelect: (color: string) => void
  icon: React.ReactNode
  title: string
  currentColor?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={title}
        onClick={() => setOpen((v) => !v)}
        className={`${BTN} flex items-center gap-0.5`}
        style={{ borderBottom: currentColor ? `3px solid ${currentColor}` : undefined }}
      >
        {icon}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 w-36">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => { onSelect(c); setOpen(false) }}
              className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
            />
          ))}
          <label
            className="col-span-5 mt-1 flex items-center gap-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700"
            title="Color personalizado"
          >
            <Palette size={11} />
            Personalizado
            <input
              type="color"
              className="sr-only"
              onChange={(e) => { onSelect(e.target.value); setOpen(false) }}
            />
          </label>
        </div>
      )}
    </div>
  )
}

export default function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = "Escribe el contenido del artículo...",
  hasError = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#8A6E27] underline" },
      }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      ImageExt.configure({ HTMLAttributes: { class: "max-w-full rounded-lg my-2" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Subscript,
      Superscript,
    ],
    content: value || "",
    onUpdate({ editor }) {
      const html = editor.getHTML()
      onChange(html === "<p></p>" ? "" : html)
    },
    onBlur() { onBlur?.() },
    editorProps: {
      attributes: {
        class: "min-h-[300px] px-4 py-3 text-sm text-gray-800 outline-none focus:outline-none",
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value && value !== undefined) {
      editor.commands.setContent(value || "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const previous = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("URL del enlace:", previous ?? "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  const insertImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt("URL de la imagen:", "https://")
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  if (!editor) return null

  const can = editor.can().chain().focus()
  const currentTextColor = editor.getAttributes("textStyle").color as string | undefined
  const currentHighlight = editor.getAttributes("highlight").color as string | undefined

  return (
    <div className={`rounded-lg border bg-white overflow-hidden ${hasError ? "border-red-400" : "border-gray-200"}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">

        {/* History */}
        <button type="button" title="Deshacer" onClick={() => editor.chain().focus().undo().run()} disabled={!can.undo().run()} className={BTN}><Undo size={14} /></button>
        <button type="button" title="Rehacer" onClick={() => editor.chain().focus().redo().run()} disabled={!can.redo().run()} className={BTN}><Redo size={14} /></button>

        {SEP}

        {/* Headings */}
        <button type="button" title="Título 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${BTN} ${editor.isActive("heading", { level: 1 }) ? BTN_ACTIVE : ""}`}><Heading1 size={14} /></button>
        <button type="button" title="Título 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${BTN} ${editor.isActive("heading", { level: 2 }) ? BTN_ACTIVE : ""}`}><Heading2 size={14} /></button>
        <button type="button" title="Título 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${BTN} ${editor.isActive("heading", { level: 3 }) ? BTN_ACTIVE : ""}`}><Heading3 size={14} /></button>

        {SEP}

        {/* Inline marks */}
        <button type="button" title="Negrita" onClick={() => editor.chain().focus().toggleBold().run()} className={`${BTN} ${editor.isActive("bold") ? BTN_ACTIVE : ""}`}><Bold size={14} /></button>
        <button type="button" title="Cursiva" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${BTN} ${editor.isActive("italic") ? BTN_ACTIVE : ""}`}><Italic size={14} /></button>
        <button type="button" title="Subrayado" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${BTN} ${editor.isActive("underline") ? BTN_ACTIVE : ""}`}><UnderlineIcon size={14} /></button>
        <button type="button" title="Tachado" onClick={() => editor.chain().focus().toggleStrike().run()} className={`${BTN} ${editor.isActive("strike") ? BTN_ACTIVE : ""}`}><Strikethrough size={14} /></button>
        <button type="button" title="Subíndice" onClick={() => editor.chain().focus().toggleSubscript().run()} className={`${BTN} ${editor.isActive("subscript") ? BTN_ACTIVE : ""}`}><SubscriptIcon size={14} /></button>
        <button type="button" title="Superíndice" onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`${BTN} ${editor.isActive("superscript") ? BTN_ACTIVE : ""}`}><SuperscriptIcon size={14} /></button>
        <button type="button" title="Código en línea" onClick={() => editor.chain().focus().toggleCode().run()} className={`${BTN} ${editor.isActive("code") ? BTN_ACTIVE : ""}`}><Code size={14} /></button>

        {SEP}

        {/* Color de texto */}
        <ColorPicker
          colors={TEXT_COLORS}
          title="Color de texto"
          currentColor={currentTextColor}
          icon={<Palette size={14} />}
          onSelect={(color) => editor.chain().focus().setColor(color).run()}
        />

        {/* Resaltado */}
        <ColorPicker
          colors={HIGHLIGHT_COLORS}
          title="Resaltar texto"
          currentColor={currentHighlight}
          icon={<Highlighter size={14} />}
          onSelect={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
        />

        {SEP}

        {/* Alineación */}
        <button type="button" title="Alinear izquierda" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={`${BTN} ${editor.isActive({ textAlign: "left" }) ? BTN_ACTIVE : ""}`}><AlignLeft size={14} /></button>
        <button type="button" title="Centrar" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={`${BTN} ${editor.isActive({ textAlign: "center" }) ? BTN_ACTIVE : ""}`}><AlignCenter size={14} /></button>
        <button type="button" title="Alinear derecha" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={`${BTN} ${editor.isActive({ textAlign: "right" }) ? BTN_ACTIVE : ""}`}><AlignRight size={14} /></button>
        <button type="button" title="Justificar" onClick={() => editor.chain().focus().setTextAlign("justify").run()} className={`${BTN} ${editor.isActive({ textAlign: "justify" }) ? BTN_ACTIVE : ""}`}><AlignJustify size={14} /></button>

        {SEP}

        {/* Listas */}
        <button type="button" title="Lista con viñetas" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${BTN} ${editor.isActive("bulletList") ? BTN_ACTIVE : ""}`}><List size={14} /></button>
        <button type="button" title="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${BTN} ${editor.isActive("orderedList") ? BTN_ACTIVE : ""}`}><ListOrdered size={14} /></button>
        <button type="button" title="Cita" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${BTN} ${editor.isActive("blockquote") ? BTN_ACTIVE : ""}`}><Quote size={14} /></button>
        <button type="button" title="Línea divisoria" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={BTN}><Minus size={14} /></button>

        {SEP}

        {/* Link e imagen */}
        <button type="button" title="Enlace" onClick={setLink} className={`${BTN} ${editor.isActive("link") ? BTN_ACTIVE : ""}`}><LinkIcon size={14} /></button>
        <button type="button" title="Insertar imagen por URL" onClick={insertImage} className={BTN}><ImageIcon size={14} /></button>

        {SEP}

        {/* Limpiar */}
        <button type="button" title="Quitar formato" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} className={BTN}><RemoveFormatting size={14} /></button>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}
