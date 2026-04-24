import { Pool } from "pg"

// Singleton pool — reutiliza conexiones entre requests
const globalPool = globalThis as typeof globalThis & { _pgPool?: Pool }

function createPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: process.env.NODE_ENV === "production" }
      : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  })
}

export function getPool(): Pool {
  if (!globalPool._pgPool) {
    globalPool._pgPool = createPool()
  }
  return globalPool._pgPool
}

/** Crea la tabla si no existe — llamar al iniciar la app */
export async function initDb(): Promise<void> {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      id      SERIAL PRIMARY KEY,
      key     TEXT NOT NULL UNIQUE,
      value   JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `)
}
