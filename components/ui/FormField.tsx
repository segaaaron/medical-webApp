import { type ReactNode } from "react"

interface FormFieldProps {
  label: string
  htmlFor?: string
  hint?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
