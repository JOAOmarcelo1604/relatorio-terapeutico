import "server-only"
import { query } from "./db"
import type { Feedback, FeedbackFilters, Paciente, Terapeuta } from "./types"

// ---------------------------------------------------------------------------
// Terapeutas (login)
// ---------------------------------------------------------------------------

export async function contarTerapeutas(): Promise<number> {
  const rows = await query<{ total: number }>(
    `SELECT count(*)::int AS total FROM terapeutas`,
  )
  return rows[0]?.total ?? 0
}

export async function getTerapeutas(): Promise<Terapeuta[]> {
  return query<Terapeuta>(
    `SELECT id, nome,
            to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at
     FROM terapeutas
     ORDER BY nome ASC`,
  )
}

export async function getTerapeutaComHash(
  nome: string,
): Promise<{ id: number; nome: string; senha_hash: string } | null> {
  const rows = await query<{ id: number; nome: string; senha_hash: string }>(
    `SELECT id, nome, senha_hash FROM terapeutas WHERE lower(nome) = lower($1)`,
    [nome],
  )
  return rows[0] ?? null
}

export async function inserirTerapeuta(
  nome: string,
  senhaHash: string,
): Promise<Terapeuta> {
  const rows = await query<Terapeuta>(
    `INSERT INTO terapeutas (nome, senha_hash)
     VALUES ($1, $2)
     RETURNING id, nome,
               to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at`,
    [nome, senhaHash],
  )
  return rows[0]
}

export async function excluirTerapeutaDB(id: number): Promise<void> {
  await query(`DELETE FROM terapeutas WHERE id = $1`, [id])
}

// ---------------------------------------------------------------------------
// Pacientes
// ---------------------------------------------------------------------------

export async function getPacientes(): Promise<Paciente[]> {
  return query<Paciente>(
    `SELECT id, nome, responsavel, terapeuta, observacoes,
            to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at
     FROM pacientes
     ORDER BY nome ASC`,
  )
}

export async function getPaciente(id: number): Promise<Paciente | null> {
  const rows = await query<Paciente>(
    `SELECT id, nome, responsavel, terapeuta, observacoes,
            to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at
     FROM pacientes
     WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

// ---------------------------------------------------------------------------
// Feedbacks
// ---------------------------------------------------------------------------

interface FeedbackRow {
  id: number
  paciente_id: number
  paciente_nome: string
  data: string
  terapeuta: string | null
  status: "normal" | "faltou"
  objetivos: string | null
  evolucao: string | null
  atividades: string[] | null
}

function mapFeedbackRow(row: FeedbackRow): Feedback {
  return {
    id: row.id,
    paciente_id: row.paciente_id,
    paciente_nome: row.paciente_nome,
    data: row.data,
    terapeuta: row.terapeuta,
    status: row.status,
    objetivos: row.objetivos,
    evolucao: row.evolucao,
    atividades: row.atividades ?? [],
  }
}

const FEEDBACK_SELECT = `
  SELECT
    f.id,
    f.paciente_id,
    p.nome AS paciente_nome,
    to_char(f.data, 'YYYY-MM-DD') AS data,
    f.terapeuta,
    f.status,
    f.objetivos,
    f.evolucao,
    COALESCE(
      (SELECT array_agg(a.descricao ORDER BY a.ordem, a.id)
       FROM feedback_atividades a
       WHERE a.feedback_id = f.id),
      ARRAY[]::text[]
    ) AS atividades
  FROM feedbacks f
  JOIN pacientes p ON p.id = f.paciente_id
`

export async function getFeedbacks(
  filters: FeedbackFilters = {},
): Promise<Feedback[]> {
  const conditions: string[] = []
  const params: unknown[] = []

  if (filters.pacienteId) {
    params.push(filters.pacienteId)
    conditions.push(`f.paciente_id = $${params.length}`)
  }
  if (filters.dataInicio) {
    params.push(filters.dataInicio)
    conditions.push(`f.data >= $${params.length}`)
  }
  if (filters.dataFim) {
    params.push(filters.dataFim)
    conditions.push(`f.data <= $${params.length}`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
  const rows = await query<FeedbackRow>(
    `${FEEDBACK_SELECT} ${where} ORDER BY f.data DESC, p.nome ASC`,
    params,
  )
  return rows.map(mapFeedbackRow)
}

export async function getFeedback(id: number): Promise<Feedback | null> {
  const rows = await query<FeedbackRow>(
    `${FEEDBACK_SELECT} WHERE f.id = $1`,
    [id],
  )
  return rows[0] ? mapFeedbackRow(rows[0]) : null
}

/** Feedbacks recentes (status normal) usados como modelo para agilizar o preenchimento. */
export async function getModelos(): Promise<Feedback[]> {
  const rows = await query<FeedbackRow>(
    `${FEEDBACK_SELECT}
     WHERE f.status = 'normal'
     ORDER BY f.data DESC
     LIMIT 100`,
  )
  return rows.map(mapFeedbackRow)
}

/** Feedbacks de um paciente dentro de um intervalo (usado no export semanal). */
export async function getFeedbacksSemana(
  pacienteId: number,
  dataInicio: string,
  dataFim: string,
): Promise<Feedback[]> {
  const rows = await query<FeedbackRow>(
    `${FEEDBACK_SELECT}
     WHERE f.paciente_id = $1 AND f.data >= $2 AND f.data <= $3
     ORDER BY f.data ASC`,
    [pacienteId, dataInicio, dataFim],
  )
  return rows.map(mapFeedbackRow)
}
