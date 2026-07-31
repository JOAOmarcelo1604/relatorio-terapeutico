import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getPaciente } from "@/lib/queries"
import type { Paciente } from "@/lib/types"
import { PacienteForm } from "@/components/paciente-form"
import { DbSetupNotice } from "@/components/db-setup-notice"

export const dynamic = "force-dynamic"

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let paciente: Paciente | null = null
  let erro: string | null = null
  try {
    paciente = await getPaciente(Number(id))
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao carregar o paciente."
  }

  if (!erro && !paciente) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/pacientes"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para pacientes
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Editar paciente
        </h1>
      </div>
      {erro ? <DbSetupNotice detail={erro} /> : <PacienteForm paciente={paciente!} />}
    </div>
  )
}
