"use client"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { FormField } from "@/components/ui/FormField"
import { Textarea } from "@/components/ui/Textarea"
import { INPUT, type SectionProps } from "./types"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type FAQ = { question: string; answer: string }

function SortableFAQ({
  faq,
  index,
  id,
  onUpdate,
  onRemove,
}: {
  faq: FAQ
  index: number
  id: string
  onUpdate: (field: "question" | "answer", value: string) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors touch-none"
            aria-label="Arrastrar para reordenar"
          >
            <GripVertical size={16} />
          </button>
          <span className="text-xs font-medium text-gray-500">Pregunta #{index + 1}</span>
        </div>
        <button
          onClick={onRemove}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 size={13} />
          Eliminar
        </button>
      </div>
      <FormField label="Pregunta">
        <input
          className={INPUT}
          value={faq.question}
          onChange={(e) => onUpdate("question", e.target.value)}
          placeholder="Cual es tu pregunta?"
        />
      </FormField>
      <FormField label="Respuesta">
        <Textarea
          value={faq.answer}
          onChange={(e) => onUpdate("answer", e.target.value)}
          placeholder="Escribe la respuesta aqui..."
          rows={3}
        />
      </FormField>
    </div>
  )
}

export function FAQsSection({ data, setData }: SectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const ids = data.faqs.map((_, i) => `faq-${i}`)

  function update(i: number, field: "question" | "answer", value: string) {
    const faqs = [...data.faqs]
    faqs[i] = { ...faqs[i], [field]: value }
    setData({ ...data, faqs })
  }

  function add() {
    setData({ ...data, faqs: [...data.faqs, { question: "", answer: "" }] })
  }

  function remove(i: number) {
    setData({ ...data, faqs: data.faqs.filter((_, idx) => idx !== i) })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    setData({ ...data, faqs: arrayMove(data.faqs, oldIndex, newIndex) })
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-4">
            {data.faqs.map((faq, i) => (
              <SortableFAQ
                key={ids[i]}
                id={ids[i]}
                faq={faq}
                index={i}
                onUpdate={(field, value) => update(i, field, value)}
                onRemove={() => remove(i)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        onClick={add}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
      >
        <Plus size={16} />
        Anadir pregunta
      </button>
    </>
  )
}
