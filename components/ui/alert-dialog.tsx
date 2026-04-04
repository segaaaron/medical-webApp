"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"

import { cn } from "@/lib/utils"

/* ─── Root ─── */

function AlertDialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </AlertDialogPrimitive.Root>
  )
}

/* ─── Portal ─── */

function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  return <AlertDialogPrimitive.Portal>{children}</AlertDialogPrimitive.Portal>
}

/* ─── Overlay / Backdrop ─── */

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity",
        className,
      )}
      {...props}
    />
  )
}

/* ─── Content (Popup) ─── */

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
      <AlertDialogPrimitive.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl",
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  )
}

/* ─── Trigger ─── */

function AlertDialogTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Trigger
      className={cn(className)}
      {...props}
    />
  )
}

/* ─── Header ─── */

function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col items-center gap-2 text-center", className)}
      {...props}
    />
  )
}

/* ─── Footer ─── */

function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6 flex justify-end gap-2", className)}
      {...props}
    />
  )
}

/* ─── Media (icon container) ─── */

function AlertDialogMedia({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mb-2 flex size-12 items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  )
}

/* ─── Title ─── */

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h2"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("text-lg font-semibold text-gray-900", className)}
      {...props}
    />
  )
}

/* ─── Description ─── */

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  )
}

/* ─── Action (confirm button slot) ─── */

function AlertDialogAction({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(className)}
      {...props}
    />
  )
}

/* ─── Cancel ─── */

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted",
        className,
      )}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogOverlay,
  AlertDialogPortal,
}
