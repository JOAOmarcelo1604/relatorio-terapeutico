import "server-only"
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)

/** Gera um hash no formato "salt:hash" (ambos em hex). Nunca armazene a senha pura. */
export async function hashSenha(senha: string): Promise<string> {
  const salt = randomBytes(16)
  const derivada = (await scryptAsync(senha, salt, 64)) as Buffer
  return `${salt.toString("hex")}:${derivada.toString("hex")}`
}

/** Compara uma senha em texto com o hash armazenado, de forma resistente a timing. */
export async function verificarSenha(
  senha: string,
  armazenado: string,
): Promise<boolean> {
  const [saltHex, hashHex] = armazenado.split(":")
  if (!saltHex || !hashHex) return false
  const hash = Buffer.from(hashHex, "hex")
  const derivada = (await scryptAsync(
    senha,
    Buffer.from(saltHex, "hex"),
    64,
  )) as Buffer
  return hash.length === derivada.length && timingSafeEqual(hash, derivada)
}
