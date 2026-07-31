import Link from "next/link"
import { Plus, UserRound } from "lucide-react"
import { getPacientes } from "@/lib/queries"
import type { Paciente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDelete } from "@/components/confirm-delete"
import { DbSetupNotice } from "@/components/db-setup-notice"
import { excluirPaciente } from "@/lib/actions"

export const dynamic = "force-dynamic"

export default async function PacientesPage() {
  let pacientes: Paciente[] = []
  let erro: string | null = null

  try {
    pacientes = await getPacientes()
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao carregar pacientes."
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre e gerencie as crianças acompanhadas.
          </p>
        </div>
        <Button render={<Link href="/pacientes/novo" />}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Novo paciente</span>
        </Button>
      </div>

      {erro ? (
        <DbSetupNotice detail={erro} />
      ) : pacientes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <UserRound className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum paciente cadastrado ainda.</p>
            <Button variant="outline" render={<Link href="/pacientes/novo" />}>
              Cadastrar o primeiro paciente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pacientes.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate font-heading font-semibold text-foreground">
                    {p.nome}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {[
                      p.responsavel ? `Resp.: ${p.responsavel}` : null,
                      p.terapeuta ? `AT: ${p.terapeuta}` : null,
                    ]
                      .filter(Boolean)
                      .join("  •  ") || "Sem informações adicionais"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/pacientes/${p.id}/editar`} />}
                  >
                    Editar
                  </Button>
                  <ConfirmDelete
                    action={excluirPaciente}
                    id={p.id}
                    compact
                    title={`Excluir ${p.nome}?`}
                    description="Todos os feedbacks vinculados a este paciente também serão excluídos. Esta ação não pode ser desfeita."
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
