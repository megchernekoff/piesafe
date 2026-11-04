import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = new URL(req.url).searchParams.get('q')

  const result = q
    ? await db.execute({
        sql: `SELECT * FROM recipes WHERE user_id = ?
              AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)
              ORDER BY created_at DESC`,
        args: [userId, `%${q}%`, `%${q}%`, `%${q}%`],
      })
    : await db.execute({
        sql: 'SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC',
        args: [userId],
      })

  return NextResponse.json(
    result.rows.map(r => ({
      ...r,
      ingredients: JSON.parse((r.ingredients as string) || '[]'),
      instructions: JSON.parse((r.instructions as string) || '[]'),
      tags: JSON.parse((r.tags as string) || '[]'),
    }))
  )
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, ingredients, instructions, prep_time, cook_time, servings, tags } = await req.json()

  await db.execute({
    sql: `INSERT INTO recipes (user_id, title, description, ingredients, instructions, prep_time, cook_time, servings, tags)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      userId,
      title,
      description ?? '',
      JSON.stringify(ingredients ?? []),
      JSON.stringify(instructions ?? []),
      prep_time ?? null,
      cook_time ?? null,
      servings ?? null,
      JSON.stringify(tags ?? []),
    ],
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.execute({
    sql: 'DELETE FROM recipes WHERE id = ? AND user_id = ?',
    args: [id, userId],
  })

  return NextResponse.json({ success: true })
}
