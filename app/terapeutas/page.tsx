import { UserCog, User, ShieldCheck, ShieldMinus, Shield } from "lucide-react"
import { requireAdmin } from "@/lib/auth"
import { getTerapeutas } from "@/lib/queries"
import { alternarAdmin, excluirTerapeuta } from "@/lib/auth-actions"
import { formatDateBR } from "@/lib/format"
import type { Terapeuta } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConfirmDelete } from "@/components/confirm-delete"
import { TerapeutaForm } from "@/components/terapeuta-form"
import { DbSetupNotice } from "@/components/db-setup-notice"

export const dynamic = "force-dynamic"

export default async function TerapeutasPage() {
  const sessao = await requireAdmin()

  let terapeutas: Terapeuta[] = []
  let erro: string | null = null
  try {
    terapeutas = await getTerapeutas()
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao carregar as terapeutas."
  }

  const totalAdmins = terapeutas.filter((t) => t.admin).length

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
          Cadastre os acessos e defina quem pode administrar o sistema.
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
              const ultimaAdmin = t.admin && totalAdmins <= 1
              return (
                <Card key={t.id} className="card-premium border-border/60">
                  <CardContent className="flex items-center justify-between gap-3 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={
                          t.admin
                            ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                            : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                        }
                      >
                        {t.admin ? (
                          <ShieldCheck className="size-4" />
                        ) : (
                          <User className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 truncate font-medium text-foreground">
                          {t.nome}
                          {t.admin ? (
                            <Badge className="bg-primary/15 text-primary">
                              Admin
                            </Badge>
                          ) : null}
                          {euMesma ? (
                            <Badge variant="secondary">você</Badge>
                          ) : null}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Desde {formatDateBR(t.created_at.slice(0, 10))}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {t.admin ? (
                        <form action={alternarAdmin}>
                          <input type="hidden" name="id" value={t.id} />
                          <input type="hidden" name="tornar" value="false" />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            disabled={ultimaAdmin}
                            title={
                              ultimaAdmin
                                ? "Não é possível rebaixar a última administradora"
                                : "Rebaixar para terapeuta comum"
                            }
                            className="text-muted-foreground"
                          >
                            <ShieldMinus className="size-4" />
                            <span className="hidden sm:inline">Rebaixar</span>
                          </Button>
                        </form>
                      ) : (
                        <form action={alternarAdmin}>
                          <input type="hidden" name="id" value={t.id} />
                          <input type="hidden" name="tornar" value="true" />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            title="Promover a administradora"
                            className="text-primary"
                          >
                            <Shield className="size-4" />
                            <span className="hidden sm:inline">Tornar admin</span>
                          </Button>
                        </form>
                      )}

                      {!ultimaAdmin ? (
                        <ConfirmDelete
                          action={excluirTerapeuta}
                          id={t.id}
                          compact
                          hiddenFields={{ admin: String(t.admin) }}
                          title="Remover acesso?"
                          description={`${t.nome} não poderá mais acessar o sistema.`}
                        />
                      ) : null}
                    </div>
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
