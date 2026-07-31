"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ConfirmDeleteProps {
  action: (formData: FormData) => void
  id: number
  title: string
  description: string
  triggerLabel?: string
  compact?: boolean
}

export function ConfirmDelete({
  action,
  id,
  title,
  description,
  triggerLabel = "Excluir",
  compact = false,
}: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          compact ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              aria-label={triggerLabel}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive">
              <Trash2 className="size-4" />
              {triggerLabel}
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive" className="w-full sm:w-auto">
              Sim, excluir
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
