"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { CalendarRange } from "lucide-react"
import type { Paciente } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function semanaDe(base: Date) {
  const dia = base.getDay()
  const offsetSegunda = dia === 0 ? -6 : 1 - dia
  const segunda = new Date(base)
  segunda.setDate(base.getDate() + offsetSegunda)
  const sexta = new Date(segunda)
  sexta.setDate(segunda.getDate() + 4)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { inicio: iso(segunda), fim: iso(sexta) }
}

export function SemanalControls({ pacientes }: { pacientes: Paciente[] }) {
  const router = useRouter()
  const params = useSearchParams()

  const paciente = params.get("paciente") ?? ""
  const inicio = params.get("inicio") ?? ""
  const fim = params.get("fim") ?? ""

  function update(patch: Record<string, string>) {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    router.push(`/semanal?${next.toString()}`)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Paciente</Label>
          <Select value={paciente} onValueChange={(v) => update({ paciente: v ? String(v) : "" })}>
            <SelectTrigger className="w-full">
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
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inicio">Início da semana</Label>
          <Input
            id="inicio"
            type="date"
            value={inicio}
            onChange={(e) => update({ inicio: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fim">Fim da semana</Label>
          <Input
            id="fim"
            type="date"
            value={fim}
            onChange={(e) => update({ fim: e.target.value })}
          />
        </div>
      </div>
      <div className="mt-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => update(semanaDe(new Date()))}
        >
          <CalendarRange className="size-4" />
          Semana atual (seg a sex)
        </Button>
      </div>
    </div>
  )
}
