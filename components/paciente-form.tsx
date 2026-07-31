import Link from "next/link"
import { salvarPaciente } from "@/lib/actions"
import type { Paciente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

export function PacienteForm({ paciente }: { paciente?: Paciente }) {
  return (
    <form action={salvarPaciente}>
      {paciente ? <input type="hidden" name="id" value={paciente.id} /> : null}
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do paciente *</Label>
            <Input
              id="nome"
              name="nome"
              required
              defaultValue={paciente?.nome ?? ""}
              placeholder="Ex: João da Silva"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Nome do responsável</Label>
            <Input
              id="responsavel"
              name="responsavel"
              defaultValue={paciente?.responsavel ?? ""}
              placeholder="Ex: Maria (mãe)"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terapeuta">Terapeuta / AT responsável</Label>
            <Input
              id="terapeuta"
              name="terapeuta"
              defaultValue={paciente?.terapeuta ?? ""}
              placeholder="Ex: Ana Paula"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações gerais</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              defaultValue={paciente?.observacoes ?? ""}
              placeholder="Informações relevantes sobre o paciente (opcional)"
              className="min-h-24"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" render={<Link href="/pacientes" />}>
              Cancelar
            </Button>
            <Button type="submit">
              {paciente ? "Salvar alterações" : "Cadastrar paciente"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
