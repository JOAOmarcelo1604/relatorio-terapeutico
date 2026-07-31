import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { COOKIE_SESSAO, verificarToken, type Sessao } from "./session"

/** Lê e valida a sessão do cookie. Retorna null se não houver sessão válida. */
export async function getSessao(): Promise<Sessao | null> {
  const store = await cookies()
  const token = store.get(COOKIE_SESSAO)?.value
  if (!token) return null
  return verificarToken(token)
}

/** Garante que há uma sessão; caso contrário redireciona para /login. */
export async function requireSessao(): Promise<Sessao> {
  const sessao = await getSessao()
  if (!sessao) redirect("/login")
  return sessao
}
