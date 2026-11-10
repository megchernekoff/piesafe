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

function dayNumberFromName(dayName: string): number {
  const match = dayName.match(/\d+/)
  return match ? parseInt(match[0]) : 1
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planId, dayName, reason, prebuiltDinner } = await req.json()
  if (!planId || !dayName) return NextResponse.json({ error: 'planId and dayName required' }, { status: 400 })

  const dayNumber = dayNumberFromName(dayName)

  // If a pre-built dinner is provided, just save it directly
  if (prebuiltDinner) {
    await db.execute({
      sql: 'INSERT INTO meal_plan_days (plan_id, user_id, day_number, dinner) VALUES (?,?,?,?) ON CONFLICT(plan_id, day_number) DO UPDATE SET dinner = excluded.dinner',
      args: [planId, userId, dayNumber, JSON.stringify(prebuiltDinner)],
    })
    return NextResponse.json({ dinner: prebuiltDinner })
  }

  // Generate a new dinner via Claude
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

Return a single JSON object:
{"title":"...","description":"...","prep_time":15,"cook_time":30,"servings":${householdSize},"ingredients":["..."],"instructions":["..."],"toddler_notes":${toddlerMode ? '"Brief adaptation"' : 'null'},"tags":["..."]}
Return only valid JSON.`,
    }],
  })

  let dinner
  try {
    dinner = JSON.parse(extractJSON((message.content[0] as { text: string }).text))
  } catch {
    return NextResponse.json({ error: 'Failed to generate replacement' }, { status: 500 })
  }

  await db.execute({
    sql: 'INSERT INTO meal_plan_days (plan_id, user_id, day_number, dinner) VALUES (?,?,?,?) ON CONFLICT(plan_id, day_number) DO UPDATE SET dinner = excluded.dinner',
    args: [planId, userId, dayNumber, JSON.stringify(dinner)],
  })

  return NextResponse.json({ dinner })
}
