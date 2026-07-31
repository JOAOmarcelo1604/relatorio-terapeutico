"use client"

import { useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { Loader2, UserPlus } from "lucide-react"
import { adicionarTerapeuta, type FormState } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="sm:self-end">
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <UserPlus className="size-4" />
      )}
      Cadastrar
    </Button>
  )
}

export function TerapeutaForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    adicionarTerapeuta,
    {},
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" name="nome" placeholder="Nome da terapeuta" className="h-11" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            name="senha"
            type="password"
            placeholder="Mínimo 4 caracteres"
            className="h-11"
            required
          />
        </div>
        <SubmitButton />
      </div>

      {state?.erro ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.erro}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          Terapeuta cadastrada com sucesso.
        </p>
      ) : null}
    </form>
  )
}
