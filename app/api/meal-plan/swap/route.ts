import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'

const anthropic = new Anthropic()

function extractJSON(text: string): string {
  const block = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (block) return block[1]
  const obj = text.match(/\{[\s\S]*\}/)
  if (obj) return obj[0]
  return text
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStart, dayName, reason } = await req.json()

  const profileResult = await db.execute({ sql: 'SELECT * FROM profiles WHERE user_id = ?', args: [userId] })
  const profile = profileResult.rows[0] ?? null
  const dislikes: string[] = profile ? JSON.parse((profile.dislikes as string) || '[]') : []
  const dietary: string[] = profile ? JSON.parse((profile.dietary_restrictions as string) || '[]') : []
  const householdSize = (profile?.household_size as number) || 2
  const toddlerMode = profile?.toddler_mode === 1

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Suggest ONE dinner recipe for ${dayName}.
${dietary.length ? `Dietary restrictions: ${dietary.join(', ')}.` : ''}
${dislikes.length ? `Never use: ${dislikes.join(', ')}.` : ''}
${reason ? `The user wants: ${reason}` : ''}
Serves ${householdSize} people.

Return a single JSON object (not an array):
{
  "title": "Dish name",
  "description": "One appetising sentence",
  "prep_time": 15,
  "cook_time": 30,
  "servings": ${householdSize},
  "ingredients": ["amount + ingredient"],
  "instructions": ["Step 1"],
  "toddler_notes": ${toddlerMode ? '"Brief adaptation"' : 'null'},
  "tags": ["tag"]
}
Return only valid JSON.`,
    }],
  })

  let dinner
  try {
    dinner = JSON.parse(extractJSON((message.content[0] as { text: string }).text))
  } catch {
    return NextResponse.json({ error: 'Failed to generate replacement' }, { status: 500 })
  }

  // Update just this day in the stored plan
  const planResult = await db.execute({
    sql: 'SELECT meals FROM meal_plans WHERE user_id = ? AND week_start_date = ? ORDER BY created_at DESC LIMIT 1',
    args: [userId, weekStart],
  })

  if (planResult.rows.length > 0) {
    const days = JSON.parse((planResult.rows[0].meals as string) || '[]')
    const updated = days.map((d: { day: string }) =>
      d.day === dayName ? { ...d, dinner } : d
    )
    await db.execute({
      sql: 'UPDATE meal_plans SET meals = ? WHERE user_id = ? AND week_start_date = ?',
      args: [JSON.stringify(updated), userId, weekStart],
    })
  }

  return NextResponse.json({ dinner })
}
