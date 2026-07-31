"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { query, withTransaction } from "./db"
import type { FeedbackStatus } from "./types"

// ---------------------------------------------------------------------------
// Pacientes
// ---------------------------------------------------------------------------

export async function salvarPaciente(formData: FormData) {
  const id = formData.get("id")
  const nome = String(formData.get("nome") ?? "").trim()
  const responsavel = String(formData.get("responsavel") ?? "").trim() || null
  const terapeuta = String(formData.get("terapeuta") ?? "").trim() || null
  const observacoes = String(formData.get("observacoes") ?? "").trim() || null

  if (!nome) {
    throw new Error("O nome do paciente é obrigatório.")
  }

  if (id) {
    await query(
      `UPDATE pacientes
       SET nome = $1, responsavel = $2, terapeuta = $3, observacoes = $4
       WHERE id = $5`,
      [nome, responsavel, terapeuta, observacoes, Number(id)],
    )
  } else {
    await query(
      `INSERT INTO pacientes (nome, responsavel, terapeuta, observacoes)
       VALUES ($1, $2, $3, $4)`,
      [nome, responsavel, terapeuta, observacoes],
    )
  }

  revalidatePath("/pacientes")
  revalidatePath("/")
  redirect("/pacientes")
}

export async function excluirPaciente(formData: FormData) {
  const id = Number(formData.get("id"))
  if (!id) return
  await query(`DELETE FROM pacientes WHERE id = $1`, [id])
  revalidatePath("/pacientes")
  revalidatePath("/")
}

// ---------------------------------------------------------------------------
// Feedbacks
// ---------------------------------------------------------------------------

function extrairDados(formData: FormData) {
  const pacienteId = Number(formData.get("paciente_id"))
  const data = String(formData.get("data") ?? "").trim()
  const terapeuta = String(formData.get("terapeuta") ?? "").trim() || null
  const status = (String(formData.get("status") ?? "normal") as FeedbackStatus)
  const objetivos =
    status === "faltou" ? null : String(formData.get("objetivos") ?? "").trim() || null
  const evolucao =
    status === "faltou" ? null : String(formData.get("evolucao") ?? "").trim() || null

  const atividades =
    status === "faltou"
      ? []
      : formData
          .getAll("atividades")
          .map((a) => String(a).trim())
          .filter(Boolean)

  if (!pacienteId) throw new Error("Selecione um paciente.")
  if (!data) throw new Error("A data é obrigatória.")

  return { pacienteId, data, terapeuta, status, objetivos, evolucao, atividades }
}

export async function salvarFeedback(formData: FormData) {
  const idRaw = formData.get("id")
  const { pacienteId, data, terapeuta, status, objetivos, evolucao, atividades } =
    extrairDados(formData)

  await withTransaction(async (client) => {
    let feedbackId: number

    if (idRaw) {
      feedbackId = Number(idRaw)
      await client.query(
        `UPDATE feedbacks
         SET paciente_id = $1, data = $2, terapeuta = $3, status = $4,
             objetivos = $5, evolucao = $6, updated_at = now()
         WHERE id = $7`,
        [pacienteId, data, terapeuta, status, objetivos, evolucao, feedbackId],
      )
      await client.query(`DELETE FROM feedback_atividades WHERE feedback_id = $1`, [
        feedbackId,
      ])
    } else {
      const res = await client.query<{ id: number }>(
        `INSERT INTO feedbacks (paciente_id, data, terapeuta, status, objetivos, evolucao)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [pacienteId, data, terapeuta, status, objetivos, evolucao],
      )
      feedbackId = res.rows[0].id
    }

    for (let i = 0; i < atividades.length; i++) {
      await client.query(
        `INSERT INTO feedback_atividades (feedback_id, descricao, ordem)
         VALUES ($1, $2, $3)`,
        [feedbackId, atividades[i], i],
      )
    }
  })

  revalidatePath("/")
  redirect("/")
}

export async function excluirFeedback(formData: FormData) {
  const id = Number(formData.get("id"))
  if (!id) return
  await query(`DELETE FROM feedbacks WHERE id = $1`, [id])
  revalidatePath("/")
}
