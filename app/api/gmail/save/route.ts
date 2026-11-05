import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { digestId, recipes } = await req.json()

  for (const recipe of recipes) {
    const hasFullRecipe = recipe.ingredients?.length > 0

    await db.execute({
      sql: `INSERT INTO recipes (user_id, title, description, source_url, ingredients, instructions, tags, prep_time, cook_time, servings)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        userId,
        recipe.title,
        recipe.description ?? '',
        recipe.url ?? null,
        JSON.stringify(hasFullRecipe ? recipe.ingredients : []),
        JSON.stringify(hasFullRecipe ? recipe.instructions : []),
        JSON.stringify(hasFullRecipe ? (recipe.tags ?? []) : ['newsletter']),
        recipe.prep_time ?? null,
        recipe.cook_time ?? null,
        recipe.servings ?? null,
      ],
    })
  }

  if (digestId) {
    await db.execute({
      sql: 'UPDATE email_digests SET saved = 1 WHERE gmail_id = ? AND user_id = ?',
      args: [digestId, userId],
    })
  }

  return NextResponse.json({ success: true, saved: recipes.length })
}
