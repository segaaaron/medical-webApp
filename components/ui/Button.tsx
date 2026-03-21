import { type ButtonHTMLAttributes } from "react"
import { clsx } from "clsx"
import type { ButtonVariant } from "@/types"

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#673de6] text-white hover:bg-[#5025d1]",
  warning:
    "bg-[#ffcd35] text-[#1d1e20] hover:bg-[#fea419]",
  outline:
    "border border-white text-white hover:bg-white hover:text-[#1d1e20]",
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  asChild?: boolean
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center px-8 py-4 font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer",
        VARIANT_STYLES[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant
}

export function LinkButton({
  variant = "primary",
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <a
      className={clsx(
        "inline-flex items-center justify-center px-8 py-4 font-bold uppercase tracking-widest text-sm transition-colors",
        VARIANT_STYLES[variant],
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}
