import Link from "next/link"
import { FileStack, Plus, Send } from "lucide-react"
import { getFeedbacks, getPacientes } from "@/lib/queries"
import type { Feedback, Paciente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FeedbackFilters } from "@/components/feedback-filters"
import { FeedbackList } from "@/components/feedback-list"
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
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gradient-brand opacity-10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-gradient-accent opacity-10 blur-2xl" />
        <div className="relative flex items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Painel
            </span>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
              Feedbacks diários
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Registre a evolução do dia e gere o texto prontinho para enviar aos pais.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-gradient-brand shadow-soft hover:opacity-95"
            render={<Link href="/feedbacks/novo" />}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Novo feedback</span>
          </Button>
        </div>
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
            <FeedbackList feedbacks={feedbacks} />
          )}
        </>
      )}
    </div>
  )
}
