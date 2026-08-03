"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CheckSquare, Printer, Square, X } from "lucide-react"
import type { Feedback } from "@/lib/types"
import { cn } from "@/lib/utils"
import { FeedbackCard } from "@/components/feedback-card"
import { Button } from "@/components/ui/button"

export function FeedbackList({ feedbacks }: { feedbacks: Feedback[] }) {
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())

  const todosMarcados =
    feedbacks.length > 0 && selecionados.size === feedbacks.length

  function alternar(id: number) {
    setSelecionados((prev) => {
      const novo = new Set(prev)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  function alternarTodos() {
    setSelecionados(
      todosMarcados ? new Set() : new Set(feedbacks.map((f) => f.id)),
    )
  }

  const hrefImprimir = useMemo(() => {
    const ids = [...selecionados].join(",")
    return `/imprimir?ids=${ids}`
  }, [selecionados])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={alternarTodos}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {todosMarcados ? (
            <CheckSquare className="size-4 text-primary" />
          ) : (
            <Square className="size-4" />
          )}
          Selecionar todos
        </button>
        {selecionados.size > 0 ? (
          <span className="text-sm text-muted-foreground">
            {selecionados.size} selecionado
            {selecionados.size === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {feedbacks.map((f) => {
        const marcado = selecionados.has(f.id)
        return (
          <div key={f.id} className="flex items-start gap-2.5">
            <button
              type="button"
              onClick={() => alternar(f.id)}
              aria-label={marcado ? "Desmarcar" : "Marcar para impressão"}
              className={cn(
                "mt-4 flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                marcado
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card text-transparent hover:border-primary",
              )}
            >
              <CheckSquare className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <FeedbackCard feedback={f} />
            </div>
          </div>
        )
      })}

      {selecionados.size > 0 ? (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-2.5 shadow-elevated">
            <span className="text-sm font-medium text-foreground">
              {selecionados.size} feedback
              {selecionados.size === 1 ? "" : "s"}
            </span>
            <Button
              size="sm"
              className="bg-gradient-brand shadow-soft hover:opacity-95"
              render={<Link href={hrefImprimir} target="_blank" />}
            >
              <Printer className="size-4" />
              Imprimir / PDF
            </Button>
            <button
              type="button"
              onClick={() => setSelecionados(new Set())}
              aria-label="Limpar seleção"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
