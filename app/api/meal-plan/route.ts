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

function getMonday(dateStr: string): Date {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  return d
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const weekStart = new URL(req.url).searchParams.get('weekStart')

  const result = weekStart
    ? await db.execute({
        sql: 'SELECT * FROM meal_plans WHERE user_id = ? AND week_start_date = ? ORDER BY created_at DESC LIMIT 1',
        args: [userId, weekStart],
      })
    : await db.execute({
        sql: 'SELECT * FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        args: [userId],
      })

  if (result.rows.length === 0) return NextResponse.json(null)

  const row = result.rows[0]
  return NextResponse.json({
    id: row.id,
    weekStart: row.week_start_date,
    days: JSON.parse((row.meals as string) || '[]'),
    grocery_list: JSON.parse((row.grocery_list as string) || '[]'),
    prep_notes: JSON.parse((row.prep_notes as string) || '[]'),
  })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStart, tweaks } = await req.json()
  if (!weekStart) return NextResponse.json({ error: 'weekStart required' }, { status: 400 })

  const profileResult = await db.execute({
    sql: 'SELECT * FROM profiles WHERE user_id = ?',
    args: [userId],
  })
  const profile = profileResult.rows[0] ?? null
  const dislikes: string[] = profile ? JSON.parse((profile.dislikes as string) || '[]') : []
  const dietary: string[] = profile ? JSON.parse((profile.dietary_restrictions as string) || '[]') : []
  const toddlerMode = profile?.toddler_mode === 1
  const toddlerAge = profile?.toddler_age as number | null
  const householdSize = (profile?.household_size as number) || 2

  const monday = getMonday(weekStart)
  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const days = DAY_NAMES.map((name, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return { name, date: d.toISOString().split('T')[0] }
  })

  const prompt = `Generate a 7-day dinner meal plan for a household of ${householdSize} people.
${dietary.length ? `Dietary restrictions: ${dietary.join(', ')}.` : ''}
${dislikes.length ? `Never use these ingredients: ${dislikes.join(', ')}.` : ''}
${toddlerMode ? `Include toddler_notes for a ${toddlerAge ? `${toddlerAge}-month-old` : 'young child'} for each meal.` : ''}
${tweaks ? `Special requests: ${tweaks}` : ''}

Week: ${days.map(d => `${d.name} ${d.date}`).join(', ')}.

Return a JSON object:
{
  "days": [
    {
      "day": "Monday",
      "date": "YYYY-MM-DD",
      "dinner": {
        "title": "Dish name",
        "description": "One appetising sentence",
        "prep_time": 15,
        "cook_time": 30,
        "servings": ${householdSize},
        "ingredients": ["amount + ingredient", ...],
        "instructions": ["Step 1", ...],
        "toddler_notes": "How to adapt, or null",
        "tags": ["tag", ...]
      }
    }
  ],
  "grocery_list": [
    { "item": "name", "amount": "qty + unit", "category": "produce|protein|dairy|pantry|other" }
  ],
  "prep_notes": ["Ahead-of-time tip", ...]
}

Make varied, delicious, practical meals. Return only valid JSON.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  let plan: { days: unknown[]; grocery_list: unknown[]; prep_notes: unknown[] }
  try {
    plan = JSON.parse(extractJSON((message.content[0] as { text: string }).text))
  } catch {
    return NextResponse.json({ error: 'Failed to parse meal plan from AI response.' }, { status: 500 })
  }

  // Replace any existing plan for this week
  await db.execute({
    sql: 'DELETE FROM meal_plans WHERE user_id = ? AND week_start_date = ?',
    args: [userId, weekStart],
  })
  await db.execute({
    sql: `INSERT INTO meal_plans (user_id, week_start_date, meals, grocery_list, prep_notes)
          VALUES (?, ?, ?, ?, ?)`,
    args: [
      userId,
      weekStart,
      JSON.stringify(plan.days ?? []),
      JSON.stringify(plan.grocery_list ?? []),
      JSON.stringify(plan.prep_notes ?? []),
    ],
  })

  return NextResponse.json({ weekStart, ...plan })
}
