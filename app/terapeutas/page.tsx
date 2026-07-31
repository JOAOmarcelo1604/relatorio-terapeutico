import { UserCog, User } from "lucide-react"
import { requireSessao } from "@/lib/auth"
import { getTerapeutas } from "@/lib/queries"
import { excluirTerapeuta } from "@/lib/auth-actions"
import { formatDateBR } from "@/lib/format"
import type { Terapeuta } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConfirmDelete } from "@/components/confirm-delete"
import { TerapeutaForm } from "@/components/terapeuta-form"
import { DbSetupNotice } from "@/components/db-setup-notice"

export const dynamic = "force-dynamic"

export default async function TerapeutasPage() {
  const sessao = await requireSessao()

  let terapeutas: Terapeuta[] = []
  let erro: string | null = null
  try {
    terapeutas = await getTerapeutas()
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao carregar as terapeutas."
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          <UserCog className="size-3.5" />
          Acessos
        </span>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
          Terapeutas
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie quem pode acessar o sistema.
        </p>
      </div>

      {erro ? (
        <DbSetupNotice detail={erro} />
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <TerapeutaForm />
            </CardContent>
          </Card>

          <div className="space-y-2">
            {terapeutas.map((t) => {
              const euMesma = t.id === sessao.id
              return (
                <Card key={t.id} className="card-premium border-border/60">
                  <CardContent className="flex items-center justify-between gap-3 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <User className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {t.nome}
                          {euMesma ? (
                            <Badge variant="secondary" className="ml-2 align-middle">
                              você
                            </Badge>
                          ) : null}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Desde {formatDateBR(t.created_at.slice(0, 10))}
                        </p>
                      </div>
                    </div>
                    {terapeutas.length > 1 ? (
                      <ConfirmDelete
                        action={excluirTerapeuta}
                        id={t.id}
                        compact
                        title="Remover acesso?"
                        description={`${t.nome} não poderá mais acessar o sistema.`}
                      />
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
