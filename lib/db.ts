import "server-only"
import { Pool, type PoolClient, type QueryResultRow } from "pg"

/**
 * Conexão com PostgreSQL configurada exclusivamente por variáveis de ambiente,
 * sem acoplamento a nenhum provedor específico.
 *
 * Você pode configurar de duas formas:
 *  1. Uma única URL de conexão:
 *       DATABASE_URL=postgres://usuario:senha@host:5432/nome_do_banco
 *  2. Variáveis separadas:
 *       PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
 *
 * SSL (opcional): defina PGSSL=require se o seu servidor exigir TLS.
 */

let pool: Pool | null = null

export function isDbConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
      (process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE),
  )
}

function sslConfig() {
  if (process.env.PGSSL === "require" || process.env.PGSSL === "true") {
    return { rejectUnauthorized: false }
  }
  return undefined
}

function getPool(): Pool {
  if (!isDbConfigured()) {
    throw new DbNotConfiguredError()
  }
  if (!pool) {
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: sslConfig(),
      })
    } else {
      pool = new Pool({
        host: process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: sslConfig(),
      })
    }
  }
  return pool
}

export class DbNotConfiguredError extends Error {
  constructor() {
    super("Banco de dados não configurado")
    this.name = "DbNotConfiguredError"
  }
}

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params as never)
  return result.rows
}

/** Executa uma função dentro de uma transação. */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query("BEGIN")
    const result = await fn(client)
    await client.query("COMMIT")
    return result
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}
