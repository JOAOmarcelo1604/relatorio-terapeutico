import { HeartHandshake } from "lucide-react"
import { contarTerapeutas } from "@/lib/queries"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent } from "@/components/ui/card"
import { DbSetupNotice } from "@/components/db-setup-notice"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  let primeiroAcesso = false
  let erro: string | null = null

  try {
    primeiroAcesso = (await contarTerapeutas()) === 0
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao acessar o banco de dados."
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-soft">
          <HeartHandshake className="size-7" />
        </span>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
          {primeiroAcesso ? "Criar primeiro acesso" : "Entrar"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {primeiroAcesso
            ? "Nenhuma terapeuta cadastrada ainda. Crie o primeiro acesso para começar."
            : "Acesse com seu nome e senha para registrar os feedbacks."}
        </p>
      </div>

      {erro ? (
        <DbSetupNotice detail={erro} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <LoginForm primeiroAcesso={primeiroAcesso} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
