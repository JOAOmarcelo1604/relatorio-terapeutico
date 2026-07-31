import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getModelos, getPacientes } from "@/lib/queries"
import type { Feedback, Paciente } from "@/lib/types"
import { FeedbackForm } from "@/components/feedback-form"
import { DbSetupNotice } from "@/components/db-setup-notice"

export const dynamic = "force-dynamic"

export default async function NovoFeedbackPage() {
  let pacientes: Paciente[] = []
  let modelos: Feedback[] = []
  let erro: string | null = null

  try {
    ;[pacientes, modelos] = await Promise.all([getPacientes(), getModelos()])
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao carregar os dados."
  }

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
          Novo feedback
        </h1>
      </div>
      {erro ? (
        <DbSetupNotice detail={erro} />
      ) : (
        <FeedbackForm pacientes={pacientes} modelos={modelos} />
      )}
    </div>
  )
}
