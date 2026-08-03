"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"
import type { Feedback } from "@/lib/types"
import { dayHeader, formatDateBR } from "@/lib/format"
import { Button } from "@/components/ui/button"

export function PrintView({ feedbacks }: { feedbacks: Feedback[] }) {
  useEffect(() => {
    if (feedbacks.length === 0) return
    const t = setTimeout(() => window.print(), 500)
    return () => clearTimeout(t)
  }, [feedbacks.length])

  // Agrupa por paciente, preservando a ordem recebida.
  const grupos: { nome: string; at: string; itens: Feedback[] }[] = []
  for (const f of feedbacks) {
    const nome = f.paciente_nome ?? "Paciente"
    let g = grupos.find((x) => x.nome === nome)
    if (!g) {
      g = { nome, at: f.terapeuta ?? "", itens: [] }
      grupos.push(g)
    }
    if (!g.at && f.terapeuta) g.at = f.terapeuta
    g.itens.push(f)
  }

  if (feedbacks.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-muted-foreground">
          Nenhum feedback selecionado para impressão.
        </p>
        <Button variant="outline" className="mt-4" render={<Link href="/" />}>
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </div>
    )
  }

  const hoje = formatDateBR(new Date().toISOString().slice(0, 10))

  return (
    <div className="mx-auto max-w-2xl">
      <div className="no-print mb-6 flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" render={<Link href="/" />}>
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
        <Button
          size="sm"
          className="bg-gradient-brand shadow-soft hover:opacity-95"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          Imprimir / Salvar PDF
        </Button>
      </div>

      <div className="rounded-none bg-white p-2 text-[13px] leading-relaxed text-neutral-900 sm:p-0">
        <div className="mb-6 border-b border-neutral-300 pb-4">
          <h1 className="font-heading text-xl font-bold">
            Feedback Terapêutico
          </h1>
          <p className="text-xs text-neutral-500">Emitido em {hoje}</p>
        </div>

        {grupos.map((grupo, gi) => (
          <section
            key={grupo.nome}
            className={gi > 0 ? "print-quebra pt-6" : ""}
          >
            <div className="mb-4">
              <h2 className="font-heading text-lg font-bold">{grupo.nome}</h2>
              {grupo.at ? (
                <p className="text-sm text-neutral-600">AT: {grupo.at}</p>
              ) : null}
            </div>

            <div className="space-y-5">
              {grupo.itens.map((f) => (
                <article
                  key={f.id}
                  className="print-bloco border-b border-neutral-200 pb-4 last:border-b-0"
                >
                  <h3 className="font-semibold">{dayHeader(f.data)}</h3>

                  {f.status === "faltou" ? (
                    <p className="mt-1 italic text-neutral-600">Faltou.</p>
                  ) : (
                    <div className="mt-1 space-y-2">
                      {f.atividades.length > 0 ? (
                        <div>
                          <p className="font-medium">Atividades:</p>
                          <ul className="ml-5 list-disc">
                            {f.atividades.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {f.objetivos ? (
                        <p>
                          <span className="font-medium">Objetivos: </span>
                          {f.objetivos}
                        </p>
                      ) : null}
                      {f.evolucao ? (
                        <p>
                          <span className="font-medium">Evolução: </span>
                          {f.evolucao}
                        </p>
                      ) : null}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
