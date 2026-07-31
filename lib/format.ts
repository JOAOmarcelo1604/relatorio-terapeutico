import type { Feedback, Paciente } from "./types"

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
]

/** Converte "YYYY-MM-DD" em um Date local (sem deslocamento de fuso). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** "2026-07-20" -> "20/07/2026" */
export function formatDateBR(iso: string): string {
  if (!iso) return ""
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

/** "2026-07-20" -> "Segunda-feira" */
export function weekdayLabel(iso: string): string {
  return DIAS_SEMANA[parseISODate(iso).getDay()]
}

/** "2026-07-20" -> "Segunda-feira (20/07/2026)" */
export function dayHeader(iso: string): string {
  return `${weekdayLabel(iso)} (${formatDateBR(iso)})`
}

/** Data de hoje em formato ISO "YYYY-MM-DD" (fuso local). */
export function todayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Monta o texto final de um único dia, pronto para copiar. */
export function formatDailyText(feedback: Feedback): string {
  const header = dayHeader(feedback.data)

  if (feedback.status === "faltou") {
    return `${header}\nFaltou.`
  }

  const linhas: string[] = [header]

  linhas.push("Atividades:")
  if (feedback.atividades.length > 0) {
    for (const item of feedback.atividades) {
      linhas.push(`* ${item}`)
    }
  }

  linhas.push("")
  linhas.push(`Objetivos: ${feedback.objetivos?.trim() ?? ""}`.trimEnd())
  linhas.push("")
  linhas.push(`Evolução: ${feedback.evolucao?.trim() ?? ""}`.trimEnd())

  return linhas.join("\n")
}

/** Monta o texto do feedback semanal agrupando vários dias. */
export function formatWeeklyText(
  paciente: Paciente,
  feedbacks: Feedback[],
  dataInicio: string,
  dataFim: string,
): string {
  const cabecalho = [
    `Feedback Semanal - ${formatDateBR(dataInicio)} a ${formatDateBR(dataFim)}`,
    "",
    `Paciente: ${paciente.nome}`,
    `AT: ${paciente.terapeuta ?? feedbacks[0]?.terapeuta ?? ""}`.trimEnd(),
    "",
  ]

  const corpo = feedbacks
    .slice()
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((f) => formatDailyText(f))
    .join("\n\n")

  return `${cabecalho.join("\n")}\n${corpo}`
}
