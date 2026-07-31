import Link from "next/link"
import { ArrowLeft, CalendarX2 } from "lucide-react"
import { getFeedbacksSemana, getPaciente, getPacientes } from "@/lib/queries"
import type { Feedback, Paciente } from "@/lib/types"
import { formatWeeklyText } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { CopyText } from "@/components/copy-text"
import { SemanalControls } from "@/components/semanal-controls"
import { DbSetupNotice } from "@/components/db-setup-notice"

export const dynamic = "force-dynamic"

export default async function SemanalPage({
  searchParams,
}: {
  searchParams: Promise<{ paciente?: string; inicio?: string; fim?: string }>
}) {
  const sp = await searchParams
  const pacienteId = sp.paciente ? Number(sp.paciente) : undefined
  const { inicio, fim } = sp

  let pacientes: Paciente[] = []
  let paciente: Paciente | null = null
  let feedbacks: Feedback[] = []
  let erro: string | null = null

  try {
    pacientes = await getPacientes()
    if (pacienteId && inicio && fim) {
      ;[paciente, feedbacks] = await Promise.all([
        getPaciente(pacienteId),
        getFeedbacksSemana(pacienteId, inicio, fim),
      ])
    }
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao carregar os dados."
  }

  const pronto = pacienteId && inicio && fim

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
          Feedback semanal
        </h1>
        <p className="text-sm text-muted-foreground">
          Agrupe os feedbacks de uma semana em um único texto para enviar aos pais.
        </p>
      </div>

      {erro ? (
        <DbSetupNotice detail={erro} />
      ) : (
        <>
          <SemanalControls pacientes={pacientes} />

          {!pronto ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Selecione um paciente e o intervalo de datas para gerar o texto.
              </CardContent>
            </Card>
          ) : feedbacks.length === 0 || !paciente ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <CalendarX2 className="size-9 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum feedback encontrado para este paciente no período selecionado.
                </p>
              </CardContent>
            </Card>
          ) : (
            <CopyText text={formatWeeklyText(paciente, feedbacks, inicio!, fim!)} />
          )}
        </>
      )}
    </div>
  )
}
