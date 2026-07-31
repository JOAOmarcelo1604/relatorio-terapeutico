import Link from "next/link"
import { FileStack, Plus, Send } from "lucide-react"
import { getFeedbacks, getPacientes } from "@/lib/queries"
import type { Feedback, Paciente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FeedbackFilters } from "@/components/feedback-filters"
import { FeedbackCard } from "@/components/feedback-card"
import { DbSetupNotice } from "@/components/db-setup-notice"

export const dynamic = "force-dynamic"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ paciente?: string; inicio?: string; fim?: string }>
}) {
  const sp = await searchParams
  const pacienteId = sp.paciente ? Number(sp.paciente) : undefined

  let pacientes: Paciente[] = []
  let feedbacks: Feedback[] = []
  let erro: string | null = null

  try {
    ;[pacientes, feedbacks] = await Promise.all([
      getPacientes(),
      getFeedbacks({
        pacienteId,
        dataInicio: sp.inicio,
        dataFim: sp.fim,
      }),
    ])
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao carregar os feedbacks."
  }

  const semanalHref = (() => {
    const params = new URLSearchParams()
    if (sp.paciente) params.set("paciente", sp.paciente)
    if (sp.inicio) params.set("inicio", sp.inicio)
    if (sp.fim) params.set("fim", sp.fim)
    return `/semanal?${params.toString()}`
  })()

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Feedbacks</h1>
          <p className="text-sm text-muted-foreground">
            Registros diários de evolução, do mais recente ao mais antigo.
          </p>
        </div>
        <Button render={<Link href="/feedbacks/novo" />}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Novo feedback</span>
        </Button>
      </div>

      {erro ? (
        <DbSetupNotice detail={erro} />
      ) : (
        <>
          <FeedbackFilters pacientes={pacientes} />

          {pacienteId ? (
            <Button variant="secondary" render={<Link href={semanalHref} />} className="w-full">
              <Send className="size-4" />
              Gerar texto da semana para este paciente
            </Button>
          ) : null}

          {feedbacks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <FileStack className="size-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {pacientes.length === 0
                    ? "Cadastre um paciente para começar a registrar feedbacks."
                    : "Nenhum feedback encontrado com esses filtros."}
                </p>
                <Button
                  variant="outline"
                  render={
                    <Link href={pacientes.length === 0 ? "/pacientes/novo" : "/feedbacks/novo"} />
                  }
                >
                  {pacientes.length === 0 ? "Cadastrar paciente" : "Criar novo feedback"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((f) => (
                <FeedbackCard key={f.id} feedback={f} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
