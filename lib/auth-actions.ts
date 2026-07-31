"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import {
  assinarToken,
  COOKIE_SESSAO,
  DURACAO_SESSAO_MS,
} from "./session"
import { hashSenha, verificarSenha } from "./password"
import { getSessao } from "./auth"
import {
  contarAdmins,
  contarTerapeutas,
  definirAdmin,
  excluirTerapeutaDB,
  getTerapeutaComHash,
  inserirTerapeuta,
} from "./queries"

export interface FormState {
  erro?: string
  ok?: boolean
}

async function definirCookieSessao(id: number, nome: string, admin: boolean) {
  const exp = Date.now() + DURACAO_SESSAO_MS
  const token = await assinarToken({ id, nome, admin, exp })
  const store = await cookies()
  store.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(DURACAO_SESSAO_MS / 1000),
  })
}

/** Login: valida nome + senha contra o banco. */
export async function entrar(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const nome = String(formData.get("nome") ?? "").trim()
  const senha = String(formData.get("senha") ?? "")
  if (!nome || !senha) return { erro: "Informe nome e senha." }

  let terapeuta: Awaited<ReturnType<typeof getTerapeutaComHash>>
  try {
    terapeuta = await getTerapeutaComHash(nome)
  } catch {
    return { erro: "Não foi possível acessar o banco de dados." }
  }

  if (!terapeuta || !(await verificarSenha(senha, terapeuta.senha_hash))) {
    return { erro: "Nome ou senha inválidos." }
  }

  await definirCookieSessao(terapeuta.id, terapeuta.nome, terapeuta.admin)
  redirect("/")
}

/** Criação do primeiro acesso (só permitida quando não há nenhuma terapeuta). */
export async function criarPrimeiroAcesso(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const total = await contarTerapeutas().catch(() => -1)
  if (total === -1) return { erro: "Não foi possível acessar o banco de dados." }
  if (total > 0) return { erro: "Já existe acesso cadastrado. Faça login." }

  const validacao = validarCredenciais(formData)
  if ("erro" in validacao) return validacao

  const hash = await hashSenha(validacao.senha)
  // A primeira conta é sempre administradora.
  const nova = await inserirTerapeuta(validacao.nome, hash, true)
  await definirCookieSessao(nova.id, nova.nome, true)
  redirect("/")
}

/** Adiciona uma nova terapeuta (somente administradoras). */
export async function adicionarTerapeuta(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const sessao = await getSessao()
  if (!sessao) return { erro: "Sessão expirada. Faça login novamente." }
  if (!sessao.admin) return { erro: "Apenas administradoras podem cadastrar." }

  const validacao = validarCredenciais(formData)
  if ("erro" in validacao) return validacao

  const comoAdmin = formData.get("admin") === "on"

  try {
    const hash = await hashSenha(validacao.senha)
    await inserirTerapeuta(validacao.nome, hash, comoAdmin)
  } catch (e) {
    const msg = e instanceof Error ? e.message : ""
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return { erro: "Já existe uma terapeuta com esse nome." }
    }
    return { erro: "Não foi possível cadastrar a terapeuta." }
  }

  revalidatePath("/terapeutas")
  return { ok: true }
}

/** Remove uma terapeuta (somente admin; não permite ficar sem admin). */
export async function excluirTerapeuta(formData: FormData): Promise<void> {
  const sessao = await getSessao()
  if (!sessao?.admin) return
  const id = Number(formData.get("id"))
  if (!id) return
  const adminAlvo = formData.get("admin") === "true"
  // Impede remover a última administradora do sistema.
  if (adminAlvo && (await contarAdmins()) <= 1) return
  await excluirTerapeutaDB(id)
  revalidatePath("/terapeutas")
}

/** Promove ou rebaixa uma terapeuta a administradora (somente admin). */
export async function alternarAdmin(formData: FormData): Promise<void> {
  const sessao = await getSessao()
  if (!sessao?.admin) return
  const id = Number(formData.get("id"))
  const tornarAdmin = formData.get("tornar") === "true"
  if (!id) return
  // Impede que a última administradora se rebaixe.
  if (!tornarAdmin && (await contarAdmins()) <= 1) return
  await definirAdmin(id, tornarAdmin)
  revalidatePath("/terapeutas")
}

/** Logout. */
export async function sair(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_SESSAO)
  redirect("/login")
}

function validarCredenciais(
  formData: FormData,
): { nome: string; senha: string } | { erro: string } {
  const nome = String(formData.get("nome") ?? "").trim()
  const senha = String(formData.get("senha") ?? "")
  if (nome.length < 2) return { erro: "O nome precisa ter ao menos 2 letras." }
  if (senha.length < 4) return { erro: "A senha precisa ter ao menos 4 caracteres." }
  return { nome, senha }
}
