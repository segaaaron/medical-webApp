import { type InputHTMLAttributes, type ReactNode } from "react"
import { clsx } from "clsx"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode
}

export function Input({ leftIcon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {leftIcon}
        </span>
      )}
      <input
        className={clsx(
          "w-full py-4 pr-4 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none bg-white",
          leftIcon ? "pl-12" : "pl-4",
          className
        )}
        {...props}
      />
    </div>
  )
}
