/**
 * Assinatura/verificação do token de sessão usando HMAC-SHA256 via Web Crypto.
 * Não importa nada de Node, então é seguro rodar no middleware (edge).
 */

export interface Sessao {
  id: number
  nome: string
  exp: number // epoch em ms
}

const encoder = new TextEncoder()

function segredo(): string {
  return process.env.AUTH_SECRET ?? "troque-este-segredo-em-producao"
}

function toB64Url(bytes: Uint8Array): string {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromB64Url(str: string): Uint8Array {
  const norm = str.replace(/-/g, "+").replace(/_/g, "/")
  const bin = atob(norm)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

async function chave(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(segredo()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
}

export async function assinarToken(sessao: Sessao): Promise<string> {
  const payload = toB64Url(encoder.encode(JSON.stringify(sessao)))
  const sig = await crypto.subtle.sign(
    "HMAC",
    await chave(),
    encoder.encode(payload),
  )
  return `${payload}.${toB64Url(new Uint8Array(sig))}`
}

export async function verificarToken(token: string): Promise<Sessao | null> {
  const partes = token.split(".")
  if (partes.length !== 2) return null
  const [payload, sig] = partes
  try {
    const valido = await crypto.subtle.verify(
      "HMAC",
      await chave(),
      fromB64Url(sig),
      encoder.encode(payload),
    )
    if (!valido) return null
    const sessao = JSON.parse(
      new TextDecoder().decode(fromB64Url(payload)),
    ) as Sessao
    if (!sessao?.exp || Date.now() > sessao.exp) return null
    return sessao
  } catch {
    return null
  }
}

export const COOKIE_SESSAO = "sessao"
export const DURACAO_SESSAO_MS = 1000 * 60 * 60 * 12 // 12 horas
