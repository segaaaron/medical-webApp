"use client"

import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/Button"

interface DeleteBlogDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  blogTitle: string
}

export function DeleteBlogDialog({
  open,
  onConfirm,
  onCancel,
  blogTitle,
}: DeleteBlogDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-red-50">
            <Trash2 className="size-5 text-red-500" />
          </AlertDialogMedia>
          <AlertDialogTitle>Eliminar artículo</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar el artículo{" "}
            <strong>&quot;{blogTitle}&quot;</strong>? Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button variant="destructive" onClick={onConfirm}>
            Eliminar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
