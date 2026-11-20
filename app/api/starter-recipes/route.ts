import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const RESTRICTION_EXCLUDES: Record<string, string[]> = {
  'vegetarian': ['meat', 'fish', 'shellfish'],
  'vegan':      ['meat', 'fish', 'shellfish', 'dairy', 'eggs'],
  'gluten-free': ['gluten'],
  'dairy-free':  ['dairy'],
  'nut-free':    ['nuts'],
  'halal':       ['pork'],
  'kosher':      ['pork', 'shellfish'],
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const dietary = (searchParams.get('dietary') || '').split(',').filter(Boolean)
  const dislikes = (searchParams.get('dislikes') || '').split(',').filter(Boolean)

  const all = await db.execute('SELECT * FROM starter_recipes WHERE active = 1')
  const forbidden = new Set(dietary.flatMap(d => RESTRICTION_EXCLUDES[d] ?? []))

  const filtered = all.rows.filter(row => {
    const contains: string[] = JSON.parse((row.contains as string) || '[]')
    if (contains.some(c => forbidden.has(c))) return false
    if (dislikes.length > 0) {
      const haystack = `${row.title} ${row.description} ${row.ingredients}`.toLowerCase()
      if (dislikes.some(d => haystack.includes(d.toLowerCase()))) return false
    }
    return true
  }).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    emoji: row.emoji,
    color: row.color,
    prep_time: row.prep_time,
    cook_time: row.cook_time,
    servings: row.servings,
    ingredients: JSON.parse((row.ingredients as string) || '[]'),
    instructions: JSON.parse((row.instructions as string) || '[]'),
    tags: JSON.parse((row.tags as string) || '[]'),
    contains: JSON.parse((row.contains as string) || '[]'),
  }))

  // Shuffle for variety
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]]
  }

  return NextResponse.json(filtered)
}
