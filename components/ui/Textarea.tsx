import { type TextareaHTMLAttributes } from "react"
import { clsx } from "clsx"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  rows?: number
}

export function Textarea({ className, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={clsx(
        "w-full px-4 py-3 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none bg-white border border-gray-200 focus:border-[#673de6] focus:ring-1 focus:ring-[#673de6] transition-colors resize-y",
        className
      )}
      {...props}
    />
  )
}
