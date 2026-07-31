"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Loader2, LogIn, UserPlus } from "lucide-react"
import {
  criarPrimeiroAcesso,
  entrar,
  type FormState,
} from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function SubmitButton({
  primeiroAcesso,
}: {
  primeiroAcesso: boolean
}) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="w-full bg-gradient-brand shadow-soft hover:opacity-95"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : primeiroAcesso ? (
        <UserPlus className="size-4" />
      ) : (
        <LogIn className="size-4" />
      )}
      {primeiroAcesso ? "Criar acesso e entrar" : "Entrar"}
    </Button>
  )
}

export function LoginForm({ primeiroAcesso }: { primeiroAcesso: boolean }) {
  const action = primeiroAcesso ? criarPrimeiroAcesso : entrar
  const [state, formAction] = useActionState<FormState, FormData>(action, {})

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da terapeuta</Label>
        <Input
          id="nome"
          name="nome"
          autoComplete="username"
          placeholder="Seu nome"
          className="h-11"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete={primeiroAcesso ? "new-password" : "current-password"}
          placeholder="••••••••"
          className="h-11"
          required
        />
      </div>

      {state?.erro ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.erro}
        </p>
      ) : null}

      <SubmitButton primeiroAcesso={primeiroAcesso} />
    </form>
  )
}
