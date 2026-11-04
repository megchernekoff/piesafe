import { createClient } from '@libsql/client'

if (!process.env.TURSO_DATABASE_URL) throw new Error('TURSO_DATABASE_URL is not set')
if (!process.env.TURSO_AUTH_TOKEN) throw new Error('TURSO_AUTH_TOKEN is not set')

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export async function initializeSchema() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id              TEXT    PRIMARY KEY,
      display_name         TEXT,
      household_size       INTEGER NOT NULL DEFAULT 2,
      toddler_mode         INTEGER NOT NULL DEFAULT 0,
      toddler_age          INTEGER,
      dislikes             TEXT    NOT NULL DEFAULT '[]',
      dietary_restrictions TEXT    NOT NULL DEFAULT '[]',
      created_at           TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at           TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS recipes (
      id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id       TEXT NOT NULL,
      title         TEXT NOT NULL,
      description   TEXT,
      ingredients   TEXT NOT NULL DEFAULT '[]',
      instructions  TEXT NOT NULL DEFAULT '',
      source_url    TEXT,
      image_url     TEXT,
      tags          TEXT NOT NULL DEFAULT '[]',
      prep_time     INTEGER,
      cook_time     INTEGER,
      servings      INTEGER,
      toddler_notes TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
    )
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id)`)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS meal_plans (
      id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id         TEXT NOT NULL,
      week_start_date TEXT NOT NULL,
      meals           TEXT NOT NULL DEFAULT '{}',
      grocery_list    TEXT NOT NULL DEFAULT '[]',
      prep_notes      TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
    )
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON meal_plans(user_id)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_meal_plans_week ON meal_plans(user_id, week_start_date)`)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS gmail_tokens (
      user_id       TEXT PRIMARY KEY,
      access_token  TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expiry        INTEGER NOT NULL,
      email         TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS gmail_providers (
      id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id    TEXT NOT NULL,
      domain     TEXT NOT NULL,
      name       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, domain)
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS email_digests (
      id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id    TEXT NOT NULL,
      gmail_id   TEXT NOT NULL,
      sender     TEXT NOT NULL,
      subject    TEXT NOT NULL,
      date       TEXT NOT NULL,
      summary    TEXT NOT NULL DEFAULT '[]',
      saved      INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}
