import type { ContentStore } from "@/types/content"

export interface SectionProps {
  data: ContentStore
  setData: React.Dispatch<React.SetStateAction<ContentStore | null>>
}

export const INPUT =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
