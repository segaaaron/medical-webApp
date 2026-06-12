/**
 * Repository for contact-form leads, stored in the local PostgreSQL instance
 * (same pool used by /api/health and content-store).
 * Never import this in Client Components.
 */

import { getPool } from "@/lib/db"

export interface NewLead {
  name: string
  phone: string | null
  treatment: string | null
  message: string | null
  preferredDate: string | null
  source: string
}

export interface Lead extends NewLead {
  id: number
  createdAt: string
}

let tableReady = false

async function ensureTable(): Promise<void> {
  if (tableReady) return
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id             SERIAL PRIMARY KEY,
      name           TEXT NOT NULL,
      phone          TEXT,
      treatment      TEXT,
      message        TEXT,
      preferred_date TEXT,
      source         TEXT NOT NULL DEFAULT 'contact-form',
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
  // Existing installs created before the column was added
  await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_date TEXT`)
  tableReady = true
}

export async function insertLead(lead: NewLead): Promise<number> {
  await ensureTable()
  const pool = getPool()
  const result = await pool.query<{ id: number }>(
    `INSERT INTO leads (name, phone, treatment, message, preferred_date, source)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [lead.name, lead.phone, lead.treatment, lead.message, lead.preferredDate, lead.source]
  )
  return result.rows[0].id
}

export async function listLeads(limit = 100): Promise<Lead[]> {
  await ensureTable()
  const pool = getPool()
  const result = await pool.query(
    `SELECT id, name, phone, treatment, message, source,
            preferred_date AS "preferredDate",
            created_at AS "createdAt"
     FROM leads
     ORDER BY created_at DESC
     LIMIT $1`,
    [Math.min(Math.max(limit, 1), 500)]
  )
  return result.rows
}
