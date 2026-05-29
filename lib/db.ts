import { createClient } from "@libsql/client";
import path from "path";

const dbPath = path.join(process.cwd(), "mealplan.db");

export const db = createClient({
  url: `file:${dbPath}`,
});

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      prep_time INTEGER,
      cook_time INTEGER,
      servings INTEGER,
      tags TEXT,
      source_url TEXT,
      toddler_notes TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start TEXT NOT NULL,
      plan_data TEXT NOT NULL,
      grocery_list TEXT,
      prep_notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS email_recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT,
      subject TEXT,
      recipe_links TEXT,
      raw_snippet TEXT,
      email_date TEXT,
      scanned_at TEXT DEFAULT (datetime('now'))
    )
  `);
}
