import Link from "next/link"
import { CalendarDays, FileText, Pencil } from "lucide-react"
import type { Feedback } from "@/lib/types"
import { dayHeader } from "@/lib/format"
import { excluirFeedback } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDelete } from "@/components/confirm-delete"

export function FeedbackCard({
  feedback,
  showPaciente = true,
}: {
  feedback: Feedback
  showPaciente?: boolean
}) {
  const faltou = feedback.status === "faltou"

  return (
    <Card
      className={
        faltou
          ? "card-premium border-destructive/30 bg-destructive/5"
          : "card-premium border-border/60"
      }
    >
      <CardContent className="space-y-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {showPaciente && feedback.paciente_nome ? (
              <p className="truncate font-heading font-semibold text-foreground">
                {feedback.paciente_nome}
              </p>
            ) : null}
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4 shrink-0" />
              {dayHeader(feedback.data)}
            </p>
          </div>
          {faltou ? (
            <Badge variant="destructive" className="shrink-0">
              Faltou
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0">
              {feedback.atividades.length}{" "}
              {feedback.atividades.length === 1 ? "atividade" : "atividades"}
            </Badge>
          )}
        </div>

        {!faltou && feedback.evolucao ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
            {feedback.evolucao}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button variant="outline" size="sm" render={<Link href={`/feedbacks/${feedback.id}`} />}>
            <FileText className="size-4" />
            Ver texto
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href={`/feedbacks/${feedback.id}/editar`} />}
            >
              <Pencil className="size-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <ConfirmDelete
              action={excluirFeedback}
              id={feedback.id}
              compact
              title="Excluir feedback?"
              description={`O feedback de ${dayHeader(feedback.data)} será removido permanentemente.`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
