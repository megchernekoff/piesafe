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

async function loadPlanWithDays(planRow: Record<string, unknown>) {
  const planId = planRow.id as string
  const daysResult = await db.execute({
    sql: 'SELECT day_number, dinner FROM meal_plan_days WHERE plan_id = ? ORDER BY day_number ASC',
    args: [planId],
  })
  const days = daysResult.rows.map(r => ({
    day: `Day ${r.day_number}`,
    dinner: JSON.parse((r.dinner as string) || '{}'),
  }))
  return {
    id: planId,
    rationale: planRow.rationale as string | undefined,
    days,
    grocery_list: JSON.parse((planRow.grocery_list as string) || '[]'),
    grocery_custom: JSON.parse((planRow.grocery_custom as string) || '[]'),
    grocery_checked: JSON.parse((planRow.grocery_checked as string) || '[]'),
    prep_notes: JSON.parse((planRow.prep_notes as string) || '[]'),
  }
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await db.execute({
    sql: 'SELECT * FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    args: [userId],
  })
  if (result.rows.length === 0) return NextResponse.json(null)

  return NextResponse.json(await loadPlanWithDays(result.rows[0] as Record<string, unknown>))
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planId, action, item, key } = await req.json()
  if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 })

  const result = await db.execute({
    sql: 'SELECT grocery_custom, grocery_checked FROM meal_plans WHERE id = ? AND user_id = ?',
    args: [planId, userId],
  })
  if (result.rows.length === 0) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  const row = result.rows[0]
  const custom: { item: string; amount: string; category: string }[] = JSON.parse((row.grocery_custom as string) || '[]')
  const checked: string[] = JSON.parse((row.grocery_checked as string) || '[]')

  if (action === 'add') {
    custom.push({ item: item.item, amount: item.amount || '', category: item.category || 'other' })
    await db.execute({ sql: 'UPDATE meal_plans SET grocery_custom = ? WHERE id = ?', args: [JSON.stringify(custom), planId] })
  } else if (action === 'check') {
    if (!checked.includes(key)) checked.push(key)
    await db.execute({ sql: 'UPDATE meal_plans SET grocery_checked = ? WHERE id = ?', args: [JSON.stringify(checked), planId] })
  } else if (action === 'uncheck') {
    await db.execute({ sql: 'UPDATE meal_plans SET grocery_checked = ? WHERE id = ?', args: [JSON.stringify(checked.filter(k => k !== key)), planId] })
  } else if (action === 'remove-custom') {
    await db.execute({ sql: 'UPDATE meal_plans SET grocery_custom = ? WHERE id = ?', args: [JSON.stringify(custom.filter((_, i) => `custom-${i}` !== key)), planId] })
  }

  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tweaks, nights = 7 } = await req.json()

  const [profileResult, recipesResult] = await Promise.all([
    db.execute({ sql: 'SELECT * FROM profiles WHERE user_id = ?', args: [userId] }),
    db.execute({ sql: 'SELECT title, description, ingredients, instructions, prep_time, cook_time, servings, tags FROM recipes WHERE user_id = ? ORDER BY created_at DESC LIMIT 30', args: [userId] }),
  ])

  const profile = profileResult.rows[0] ?? null
  const dislikes: string[] = profile ? JSON.parse((profile.dislikes as string) || '[]') : []
  const dietary: string[] = profile ? JSON.parse((profile.dietary_restrictions as string) || '[]') : []
  const toddlerMode = profile?.toddler_mode === 1
  const toddlerAge = profile?.toddler_age as number | null
  const householdSize = (profile?.household_size as number) || 2

  const savedRecipes = recipesResult.rows
    .filter(r => JSON.parse((r.ingredients as string) || '[]').length > 0)
    .map(r => ({
      title: r.title as string,
      description: r.description as string,
      prep_time: r.prep_time as number | null,
      cook_time: r.cook_time as number | null,
    }))

  const savedRecipesBlock = savedRecipes.length > 0
    ? `\nThe user has these saved recipes — include at most 2 if they fit well, fill the rest with fresh suggestions:\n${savedRecipes.map(r => `- ${r.title}${r.description ? `: ${r.description}` : ''}`).join('\n')}\nThe majority of meals should be new creative suggestions.\n`
    : ''

  const prompt = `Generate a ${nights}-day dinner meal plan for a household of ${householdSize} people.
${dietary.length ? `Dietary restrictions: ${dietary.join(', ')}.` : ''}
${dislikes.length ? `Never use: ${dislikes.join(', ')}.` : ''}
${toddlerMode ? `Include toddler_notes for a ${toddlerAge ? `${toddlerAge}-month-old` : 'young child'} for each meal.` : ''}
${tweaks ? `Special requests: ${tweaks}` : ''}${savedRecipesBlock}

Days: ${Array.from({ length: nights }, (_, i) => `Day ${i + 1}`).join(', ')}.

Return JSON. Be concise:
{
  "rationale": "2-3 sentences on why these meals.",
  "days": [{"day":"Day 1","dinner":{"title":"...","description":"...","prep_time":15,"cook_time":30,"servings":${householdSize},"ingredients":["..."],"instructions":["..."],"toddler_notes":null,"tags":["..."]}}],
  "grocery_list": [{"item":"...","amount":"...","category":"produce|protein|dairy|pantry|other"}],
  "prep_notes": ["..."]
}
Return only valid JSON, no markdown.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = (message.content[0] as { text: string }).text
  let plan: { rationale?: string; days: { day: string; dinner: unknown }[]; grocery_list: unknown[]; prep_notes: unknown[] }
  try {
    plan = JSON.parse(extractJSON(rawText))
  } catch {
    console.error('Meal plan parse error. Stop reason:', message.stop_reason, '| Length:', rawText.length)
    return NextResponse.json({ error: 'Failed to parse meal plan from AI response.' }, { status: 500 })
  }

  // Insert plan header
  const planResult = await db.execute({
    sql: `INSERT INTO meal_plans (user_id, week_start_date, rationale, grocery_list, prep_notes, meals)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      userId,
      new Date().toISOString().split('T')[0], // kept for compat, not used as key
      plan.rationale ?? '',
      JSON.stringify(plan.grocery_list ?? []),
      JSON.stringify(plan.prep_notes ?? []),
      '[]', // legacy column kept empty
    ],
  })

  const planId = String(planResult.lastInsertRowid ?? '')
  // Get the actual id (uuid) from the insert
  const inserted = await db.execute({
    sql: 'SELECT id FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    args: [userId],
  })
  const actualPlanId = inserted.rows[0]?.id as string

  // Insert each day
  for (let i = 0; i < plan.days.length; i++) {
    const d = plan.days[i]
    await db.execute({
      sql: 'INSERT INTO meal_plan_days (plan_id, user_id, day_number, dinner) VALUES (?,?,?,?)',
      args: [actualPlanId, userId, i + 1, JSON.stringify(d.dinner)],
    })
  }
  void planId

  return NextResponse.json({
    id: actualPlanId,
    rationale: plan.rationale,
    days: plan.days,
    grocery_list: plan.grocery_list ?? [],
    grocery_custom: [],
    grocery_checked: [],
    prep_notes: plan.prep_notes ?? [],
  })
}
