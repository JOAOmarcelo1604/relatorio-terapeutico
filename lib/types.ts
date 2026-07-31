export type FeedbackStatus = "normal" | "faltou"

export interface Terapeuta {
  id: number
  nome: string
  created_at: string
}

export interface Paciente {
  id: number
  nome: string
  responsavel: string | null
  terapeuta: string | null
  observacoes: string | null
  created_at: string
}

export interface Feedback {
  id: number
  paciente_id: number
  paciente_nome?: string
  data: string // formato ISO "YYYY-MM-DD"
  terapeuta: string | null
  status: FeedbackStatus
  objetivos: string | null
  evolucao: string | null
  atividades: string[]
  created_at?: string
  updated_at?: string
}

export interface FeedbackFilters {
  pacienteId?: number
  dataInicio?: string
  dataFim?: string
}
