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

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await db.execute({
    sql: 'SELECT * FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    args: [userId],
  })
  if (result.rows.length === 0) return NextResponse.json(null)

  const planRow = result.rows[0] as Record<string, unknown>
  const planId = planRow.id as string
  const daysResult = await db.execute({
    sql: 'SELECT day_number, dinner FROM meal_plan_days WHERE plan_id = ? ORDER BY day_number ASC',
    args: [planId],
  })
  const days = daysResult.rows.map(r => ({
    day: `Day ${r.day_number}`,
    dinner: JSON.parse((r.dinner as string) || '{}'),
  }))
  return NextResponse.json({
    id: planId,
    rationale: planRow.rationale as string | undefined,
    days,
    grocery_list: JSON.parse((planRow.grocery_list as string) || '[]'),
    grocery_custom: JSON.parse((planRow.grocery_custom as string) || '[]'),
    grocery_checked: JSON.parse((planRow.grocery_checked as string) || '[]'),
    prep_notes: JSON.parse((planRow.prep_notes as string) || '[]'),
  })
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

  const { tweaks, nights = 7, pinnedRecipes = [], placeholderMeals = [] } = await req.json()

  const [profileResult, recipesResult] = await Promise.all([
    db.execute({ sql: 'SELECT * FROM profiles WHERE user_id = ?', args: [userId] }),
    db.execute({ sql: "SELECT title, description FROM recipes WHERE user_id = ? AND ingredients != '[]' ORDER BY created_at DESC LIMIT 15", args: [userId] }),
  ])

  const profile = profileResult.rows[0] ?? null
  const dislikes: string[] = profile ? JSON.parse((profile.dislikes as string) || '[]') : []
  const dietary: string[] = profile ? JSON.parse((profile.dietary_restrictions as string) || '[]') : []
  const toddlerMode = profile?.toddler_mode === 1
  const householdSize = (profile?.household_size as number) || 2

  const placeholderBlock = (placeholderMeals as string[]).length > 0
    ? `\nPLACEHOLDER MEALS (include by name, set ingredients/instructions to []):\n${(placeholderMeals as string[]).join(', ')}\n`
    : ''

  const pinnedBlock = (pinnedRecipes as { title: string }[]).length > 0
    ? `\nPINNED RECIPES (must appear, use exact title):\n${(pinnedRecipes as { title: string }[]).map(r => `- ${r.title}`).join('\n')}\n`
    : ''

  const savedBlock = recipesResult.rows.length > 0
    ? `\nSaved recipes (use 1-2 max, rest should be new):\n${recipesResult.rows.map(r => `- ${r.title}`).join('\n')}\n`
    : ''

  const prompt = `Generate a ${nights}-night dinner plan for ${householdSize} people.
${dietary.length ? `Restrictions: ${dietary.join(', ')}.` : ''}
${dislikes.length ? `Never use: ${dislikes.join(', ')}.` : ''}
${toddlerMode ? 'Include toddler_notes for each meal.' : ''}
${tweaks ? `Notes: ${tweaks}` : ''}${placeholderBlock}${pinnedBlock}${savedBlock}

Return JSON only:
{"rationale":"2 sentences","days":[{"day":"Day 1","dinner":{"title":"","description":"","prep_time":15,"cook_time":30,"servings":${householdSize},"ingredients":[""],"instructions":[""],"toddler_notes":null,"tags":[""]}}],"grocery_list":[{"item":"","amount":"","category":"produce"}],"prep_notes":[""]}`

  // Stream the response to avoid Render's 30s timeout
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let fullText = ''
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 8000,
          stream: true,
          messages: [{ role: 'user', content: prompt }],
        })
        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullText += event.delta.text
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }

        // Parse and save to DB after streaming completes
        let plan: { rationale?: string; days: { day: string; dinner: unknown }[]; grocery_list: unknown[]; prep_notes: unknown[] }
        try {
          plan = JSON.parse(extractJSON(fullText))
        } catch {
          controller.enqueue(encoder.encode('\n__ERROR__Failed to parse AI response'))
          controller.close()
          return
        }

        const newPlanId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        await db.execute({
          sql: `INSERT INTO meal_plans (id, user_id, week_start_date, rationale, grocery_list, prep_notes, meals) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [newPlanId, userId, new Date().toISOString().split('T')[0], plan.rationale ?? '', JSON.stringify(plan.grocery_list ?? []), JSON.stringify(plan.prep_notes ?? []), '[]'],
        })
        for (let i = 0; i < plan.days.length; i++) {
          await db.execute({
            sql: 'INSERT INTO meal_plan_days (plan_id, user_id, day_number, dinner) VALUES (?,?,?,?)',
            args: [newPlanId, userId, i + 1, JSON.stringify(plan.days[i].dinner)],
          })
        }

        // Send the final plan ID so client knows what to fetch
        controller.enqueue(encoder.encode(`\n__PLAN_ID__${newPlanId}`))
      } catch (err) {
        controller.enqueue(encoder.encode(`\n__ERROR__${String(err).slice(0, 200)}`))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Accel-Buffering': 'no',
    },
  })
}
