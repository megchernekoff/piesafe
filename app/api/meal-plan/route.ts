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
    grocery_custom: JSON.parse((row.grocery_custom as string) || '[]'),
    grocery_checked: JSON.parse((row.grocery_checked as string) || '[]'),
    prep_notes: JSON.parse((row.prep_notes as string) || '[]'),
  })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStart, action, item, key } = await req.json()
  if (!weekStart) return NextResponse.json({ error: 'weekStart required' }, { status: 400 })

  const result = await db.execute({
    sql: 'SELECT grocery_custom, grocery_checked FROM meal_plans WHERE user_id = ? AND week_start_date = ?',
    args: [userId, weekStart],
  })
  if (result.rows.length === 0) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  const row = result.rows[0]
  const custom: { item: string; amount: string; category: string }[] = JSON.parse((row.grocery_custom as string) || '[]')
  const checked: string[] = JSON.parse((row.grocery_checked as string) || '[]')

  if (action === 'add') {
    custom.push({ item: item.item, amount: item.amount || '', category: item.category || 'other' })
    await db.execute({
      sql: 'UPDATE meal_plans SET grocery_custom = ? WHERE user_id = ? AND week_start_date = ?',
      args: [JSON.stringify(custom), userId, weekStart],
    })
  } else if (action === 'check') {
    // key is "cat-idx" for generated items or "custom-idx" for custom items
    if (!checked.includes(key)) checked.push(key)
    await db.execute({
      sql: 'UPDATE meal_plans SET grocery_checked = ? WHERE user_id = ? AND week_start_date = ?',
      args: [JSON.stringify(checked), userId, weekStart],
    })
  } else if (action === 'uncheck') {
    const next = checked.filter(k => k !== key)
    await db.execute({
      sql: 'UPDATE meal_plans SET grocery_checked = ? WHERE user_id = ? AND week_start_date = ?',
      args: [JSON.stringify(next), userId, weekStart],
    })
  } else if (action === 'remove-custom') {
    const next = custom.filter((_, i) => `custom-${i}` !== key)
    await db.execute({
      sql: 'UPDATE meal_plans SET grocery_custom = ? WHERE user_id = ? AND week_start_date = ?',
      args: [JSON.stringify(next), userId, weekStart],
    })
  }

  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStart, tweaks, nights = 7 } = await req.json()
  if (!weekStart) return NextResponse.json({ error: 'weekStart required' }, { status: 400 })

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

  // Only pass recipes that have full ingredient data (photo imports)
  const savedRecipes = recipesResult.rows
    .filter(r => {
      const ingredients = JSON.parse((r.ingredients as string) || '[]')
      return ingredients.length > 0
    })
    .map(r => ({
      title: r.title as string,
      description: r.description as string,
      ingredients: JSON.parse((r.ingredients as string) || '[]') as string[],
      instructions: JSON.parse((r.instructions as string) || '[]') as string[],
      prep_time: r.prep_time as number | null,
      cook_time: r.cook_time as number | null,
      servings: r.servings as number | null,
      tags: JSON.parse((r.tags as string) || '[]') as string[],
    }))

  const days = Array.from({ length: nights }, (_, i) => ({ name: `Day ${i + 1}` }))

  const savedRecipesBlock = savedRecipes.length > 0
    ? `\nThe user has these saved recipes in their recipe box — try to use some of them this week:\n${savedRecipes.map(r =>
        `- ${r.title}${r.description ? `: ${r.description}` : ''}${r.prep_time || r.cook_time ? ` (${[r.prep_time && `${r.prep_time}m prep`, r.cook_time && `${r.cook_time}m cook`].filter(Boolean).join(', ')})` : ''}`
      ).join('\n')}\nFor any saved recipe you use, copy its exact ingredients and instructions from above.\n`
    : ''

  const prompt = `Generate a ${nights}-day dinner meal plan for a household of ${householdSize} people.
${dietary.length ? `Dietary restrictions: ${dietary.join(', ')}.` : ''}
${dislikes.length ? `Never use these ingredients: ${dislikes.join(', ')}.` : ''}
${toddlerMode ? `Include toddler_notes for a ${toddlerAge ? `${toddlerAge}-month-old` : 'young child'} for each meal.` : ''}
${tweaks ? `Special requests: ${tweaks}` : ''}${savedRecipesBlock}

Days: ${days.map(d => d.name).join(', ')}.

Return a JSON object. Be concise — keep ingredients to one line each, instructions to one sentence each:
{
  "rationale": "2-3 sentences explaining why you chose these meals — mention variety, any saved recipes used, how preferences were respected.",
  "days": [
    {
      "day": "Day 1",
      "dinner": {
        "title": "Dish name",
        "description": "One appetising sentence",
        "prep_time": 15,
        "cook_time": 30,
        "servings": ${householdSize},
        "ingredients": ["2 cups flour", "1 tsp salt", ...],
        "instructions": ["Step 1.", "Step 2.", ...],
        "toddler_notes": "Brief adaptation or null",
        "tags": ["tag1", "tag2"]
      }
    }
  ],
  "grocery_list": [
    { "item": "name", "amount": "qty + unit", "category": "produce|protein|dairy|pantry|other" }
  ],
  "prep_notes": ["One tip per line."]
}

Make varied, delicious, practical meals. Return only valid JSON, no markdown.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = (message.content[0] as { text: string }).text
  let plan: { rationale?: string; days: unknown[]; grocery_list: unknown[]; prep_notes: unknown[] }
  try {
    plan = JSON.parse(extractJSON(rawText))
  } catch {
    console.error('Meal plan parse error. Stop reason:', message.stop_reason, '| Response length:', rawText.length)
    return NextResponse.json({ error: 'Failed to parse meal plan from AI response.' }, { status: 500 })
  }

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
