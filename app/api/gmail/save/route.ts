import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Save selected recipes from an email digest to the recipe box
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { digestId, recipes } = await req.json()
  // recipes: { title, description }[]

  for (const recipe of recipes) {
    await db.execute({
      sql: `INSERT INTO recipes (user_id, title, description, ingredients, instructions, tags)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        userId,
        recipe.title,
        recipe.description ?? '',
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify(['newsletter']),
      ],
    })
  }

  // Mark digest as saved
  if (digestId) {
    await db.execute({
      sql: 'UPDATE email_digests SET saved = 1 WHERE gmail_id = ? AND user_id = ?',
      args: [digestId, userId],
    })
  }

  return NextResponse.json({ success: true, saved: recipes.length })
}
