import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PacienteForm } from "@/components/paciente-form"

export default function NovoPacientePage() {
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
          Novo paciente
        </h1>
      </div>
      <PacienteForm />
    </div>
  )
}
