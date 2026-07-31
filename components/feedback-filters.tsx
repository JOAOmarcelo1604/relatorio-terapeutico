"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { CalendarRange, X } from "lucide-react"
import type { Paciente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Retorna a segunda e a sexta-feira da semana de uma data. */
function semanaDe(base: Date) {
  const dia = base.getDay() // 0 = domingo
  const offsetSegunda = dia === 0 ? -6 : 1 - dia
  const segunda = new Date(base)
  segunda.setDate(base.getDate() + offsetSegunda)
  const sexta = new Date(segunda)
  sexta.setDate(segunda.getDate() + 4)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { inicio: iso(segunda), fim: iso(sexta) }
}

export function FeedbackFilters({ pacientes }: { pacientes: Paciente[] }) {
  const router = useRouter()
  const params = useSearchParams()

  const pacienteId = params.get("paciente") ?? ""
  const inicio = params.get("inicio") ?? ""
  const fim = params.get("fim") ?? ""

  const update = useCallback(
    (patch: Record<string, string>) => {
      const next = new URLSearchParams(params.toString())
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      router.push(`/?${next.toString()}`)
    },
    [params, router],
  )

  const temFiltro = pacienteId || inicio || fim

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Paciente</Label>
          <Select
            value={pacienteId || "todos"}
            onValueChange={(v) => update({ paciente: !v || v === "todos" ? "" : String(v) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os pacientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os pacientes</SelectItem>
              {pacientes.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inicio">De</Label>
          <Input
            id="inicio"
            type="date"
            value={inicio}
            onChange={(e) => update({ inicio: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fim">Até</Label>
          <Input
            id="fim"
            type="date"
            value={fim}
            onChange={(e) => update({ fim: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            const { inicio, fim } = semanaDe(new Date())
            update({ inicio, fim })
          }}
        >
          <CalendarRange className="size-4" />
          Esta semana
        </Button>
        {temFiltro ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
          >
            <X className="size-4" />
            Limpar filtros
          </Button>
        ) : null}
      </div>
    </div>
  )
}
