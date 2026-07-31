import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getFeedback, getModelos, getPacientes } from "@/lib/queries"
import type { Feedback, Paciente } from "@/lib/types"
import { FeedbackForm } from "@/components/feedback-form"
import { DbSetupNotice } from "@/components/db-setup-notice"

export const dynamic = "force-dynamic"

export default async function EditarFeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let pacientes: Paciente[] = []
  let modelos: Feedback[] = []
  let feedback: Feedback | null = null
  let erro: string | null = null

  try {
    ;[pacientes, modelos, feedback] = await Promise.all([
      getPacientes(),
      getModelos(),
      getFeedback(Number(id)),
    ])
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao carregar o feedback."
  }

  if (!erro && !feedback) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para feedbacks
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Editar feedback
        </h1>
      </div>
      {erro ? (
        <DbSetupNotice detail={erro} />
      ) : (
        <FeedbackForm
          pacientes={pacientes}
          modelos={modelos}
          feedback={feedback!}
        />
      )}
    </div>
  )
}
