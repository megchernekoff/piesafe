import { initializeSchema, db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { STARTER_RECIPE_SEED } from '@/lib/recipe-seed'

async function seedStarterRecipes() {
  const count = await db.execute('SELECT COUNT(*) as count FROM starter_recipes')
  if (Number(count.rows[0]?.count) > 0) return

  for (const r of STARTER_RECIPE_SEED) {
    await db.execute({
      sql: `INSERT INTO starter_recipes (title, description, category, emoji, color, prep_time, cook_time, servings, ingredients, instructions, tags, contains)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        r.title, r.description, r.category, r.emoji, r.color,
        r.prep_time, r.cook_time, r.servings,
        JSON.stringify(r.ingredients), JSON.stringify(r.instructions),
        JSON.stringify(r.tags), JSON.stringify(r.contains),
      ],
    })
  }
}

// POST /api/setup — run once after first deploy to create DB tables.
export async function POST() {
  try {
    await initializeSchema()
    await seedStarterRecipes()
    return NextResponse.json({ success: true, message: 'Schema initialized and recipes seeded' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
