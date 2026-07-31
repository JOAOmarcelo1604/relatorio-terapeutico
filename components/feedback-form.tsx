"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import {
  ArrowDown,
  ArrowUp,
  CopyPlus,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react"
import { salvarFeedback } from "@/lib/actions"
import type { Feedback, FeedbackStatus, Paciente } from "@/lib/types"
import { dayHeader, todayISO } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function SubmitButton({ editando }: { editando: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {editando ? "Salvar alterações" : "Salvar feedback"}
    </Button>
  )
}

interface FeedbackFormProps {
  pacientes: Paciente[]
  modelos: Feedback[]
  feedback?: Feedback
}

export function FeedbackForm({ pacientes, modelos, feedback }: FeedbackFormProps) {
  const editando = Boolean(feedback)

  const [pacienteId, setPacienteId] = useState(
    feedback ? String(feedback.paciente_id) : "",
  )
  const [data, setData] = useState(feedback?.data ?? todayISO())
  const [terapeuta, setTerapeuta] = useState(feedback?.terapeuta ?? "")
  const [status, setStatus] = useState<FeedbackStatus>(feedback?.status ?? "normal")
  const [atividades, setAtividades] = useState<string[]>(
    feedback && feedback.atividades.length > 0 ? feedback.atividades : [""],
  )
  const [objetivos, setObjetivos] = useState(feedback?.objetivos ?? "")
  const [evolucao, setEvolucao] = useState(feedback?.evolucao ?? "")

  const faltou = status === "faltou"

  const modelosDoPaciente = useMemo(
    () =>
      modelos.filter(
        (m) => String(m.paciente_id) === pacienteId && m.id !== feedback?.id,
      ),
    [modelos, pacienteId, feedback?.id],
  )

  function atualizarAtividade(index: number, valor: string) {
    setAtividades((prev) => prev.map((a, i) => (i === index ? valor : a)))
  }
  function adicionarAtividade() {
    setAtividades((prev) => [...prev, ""])
  }
  function removerAtividade(index: number) {
    setAtividades((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, i) => i !== index),
    )
  }
  function moverAtividade(index: number, direcao: -1 | 1) {
    setAtividades((prev) => {
      const alvo = index + direcao
      if (alvo < 0 || alvo >= prev.length) return prev
      const copia = [...prev]
      ;[copia[index], copia[alvo]] = [copia[alvo], copia[index]]
      return copia
    })
  }

  function aplicarModelo(modelo: Feedback) {
    setAtividades(modelo.atividades.length > 0 ? [...modelo.atividades] : [""])
    setObjetivos(modelo.objetivos ?? "")
    if (!terapeuta && modelo.terapeuta) setTerapeuta(modelo.terapeuta)
    setStatus("normal")
  }

  function selecionarPaciente(id: string | null) {
    const value = id ? String(id) : ""
    setPacienteId(value)
    const p = pacientes.find((x) => String(x.id) === value)
    if (p?.terapeuta && !terapeuta) setTerapeuta(p.terapeuta)
  }

  return (
    <form action={salvarFeedback} className="space-y-4">
      {feedback ? <input type="hidden" name="id" value={feedback.id} /> : null}
      <input type="hidden" name="paciente_id" value={pacienteId} />
      <input type="hidden" name="status" value={status} />

      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Paciente *</Label>
              <Select value={pacienteId} onValueChange={selecionarPaciente} required>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {pacientes.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum paciente cadastrado.{" "}
                  <Link href="/pacientes/novo" className="text-primary underline">
                    Cadastrar agora
                  </Link>
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                name="data"
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="h-11"
              />
              {data ? (
                <p className="text-xs text-muted-foreground">{dayHeader(data)}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="terapeuta">AT / Terapeuta</Label>
              <Input
                id="terapeuta"
                name="terapeuta"
                value={terapeuta}
                onChange={(e) => setTerapeuta(e.target.value)}
                placeholder="Nome da terapeuta"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status do dia</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("normal")}
                className={cn(
                  "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                  !faltou
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                Dia normal
              </button>
              <button
                type="button"
                onClick={() => setStatus("faltou")}
                className={cn(
                  "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                  faltou
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                Faltou
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {faltou ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Dia marcado como <span className="font-semibold text-destructive">Faltou</span>.
            O feedback enviado aos pais será apenas &quot;Faltou.&quot;.
          </CardContent>
        </Card>
      ) : (
        <>
          {modelosDoPaciente.length > 0 ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="secondary" className="w-full">
                  <CopyPlus className="size-4" />
                  Usar um dia anterior como modelo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-heading">
                    Copiar de um feedback anterior
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  As atividades e os objetivos serão copiados. Você pode ajustar depois.
                </p>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {modelosDoPaciente.map((m) => (
                    <DialogClose asChild key={m.id}>
                      <button
                        type="button"
                        onClick={() => aplicarModelo(m)}
                        className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {dayHeader(m.data)}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {m.atividades.join(", ") || "Sem atividades"}
                        </p>
                      </button>
                    </DialogClose>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          ) : null}

          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>Atividades</Label>
                <div className="space-y-2">
                  {atividades.map((atividade, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        name="atividades"
                        value={atividade}
                        onChange={(e) => atualizarAtividade(index, e.target.value)}
                        placeholder={`Atividade ${index + 1}`}
                        className="h-11"
                      />
                      <div className="flex shrink-0 items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moverAtividade(index, -1)}
                          disabled={index === 0}
                          aria-label="Mover para cima"
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moverAtividade(index, 1)}
                          disabled={index === atividades.length - 1}
                          aria-label="Mover para baixo"
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removerAtividade(index)}
                          aria-label="Remover atividade"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={adicionarAtividade}
                >
                  <Plus className="size-4" />
                  Adicionar atividade
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivos">Objetivos</Label>
                <Textarea
                  id="objetivos"
                  name="objetivos"
                  value={objetivos}
                  onChange={(e) => setObjetivos(e.target.value)}
                  placeholder="Objetivos trabalhados no dia"
                  className="min-h-28"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evolucao">Evolução</Label>
                <Textarea
                  id="evolucao"
                  name="evolucao"
                  value={evolucao}
                  onChange={(e) => setEvolucao(e.target.value)}
                  placeholder="Relato narrativo de como foi o dia..."
                  className="min-h-40"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" asChild>
          <Link href="/">Cancelar</Link>
        </Button>
        <SubmitButton editando={editando} />
      </div>
    </form>
  )
}
