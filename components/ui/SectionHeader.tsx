import DOMPurify from "isomorphic-dompurify"
import { clsx } from "clsx"
import type { SectionHeaderProps } from "@/types"

export function SectionHeader({ eyebrow, title, subtitle, light = false }: SectionHeaderProps) {
  return (
    <div className="text-center mb-16">
      <p
        className={clsx(
          "text-sm uppercase tracking-[0.3em] font-semibold mb-4",
          light ? "text-[#8c85ff]" : "text-[#673de6]"
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={clsx(
          "text-3xl md:text-5xl font-bold leading-tight",
          light ? "text-white" : "text-[#1F1346]"
        )}
      >
        {title}
      </h2>
      <div className="w-20 h-1 mx-auto my-8 bg-[#ffcd35]" />
      {subtitle && (
        <p
          className={clsx(
            "text-lg max-w-2xl mx-auto leading-relaxed",
            light ? "text-[#d5dfff]" : "text-[#36344d]"
          )}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(subtitle) }}
        />
      )}
    </div>
  )
}
