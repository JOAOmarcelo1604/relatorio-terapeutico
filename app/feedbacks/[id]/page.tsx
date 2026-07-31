import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"
import { getFeedback } from "@/lib/queries"
import type { Feedback } from "@/lib/types"
import { formatDailyText } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { CopyText } from "@/components/copy-text"
import { DbSetupNotice } from "@/components/db-setup-notice"

export const dynamic = "force-dynamic"

export default async function FeedbackViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let feedback: Feedback | null = null
  let erro: string | null = null

  try {
    feedback = await getFeedback(Number(id))
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao carregar o feedback."
  }

  if (!erro && !feedback) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar para feedbacks
          </Link>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Texto do dia
          </h1>
          {feedback?.paciente_nome ? (
            <p className="text-sm text-muted-foreground">{feedback.paciente_nome}</p>
          ) : null}
        </div>
        {feedback ? (
          <Button variant="outline" render={<Link href={`/feedbacks/${feedback.id}/editar`} />}>
            <Pencil className="size-4" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
        ) : null}
      </div>

      {erro ? (
        <DbSetupNotice detail={erro} />
      ) : (
        <CopyText text={formatDailyText(feedback!)} />
      )}
    </div>
  )
}
