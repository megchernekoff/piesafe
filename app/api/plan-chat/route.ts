import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, message, history } = await req.json()

  const mealSummary = plan.days
    .filter((d: { dinner: { title: string } | null }) => d.dinner)
    .map((d: { day: string; dinner: { title: string } }) => `${d.day}: ${d.dinner.title}`)
    .join('\n')

  // Fetch saved recipes with details for context
  const recipesResult = await db.execute({
    sql: "SELECT title, description, ingredients, instructions, prep_time, cook_time FROM recipes WHERE user_id = ? ORDER BY created_at DESC LIMIT 30",
    args: [userId],
  })
  const savedRecipes = recipesResult.rows.map(r => ({
    title: r.title as string,
    description: r.description as string,
    ingredients: JSON.parse(r.ingredients as string || '[]') as string[],
    instructions: JSON.parse(r.instructions as string || '[]') as string[],
    prep_time: r.prep_time as number | null,
    cook_time: r.cook_time as number | null,
  }))

  const savedRecipesBlock = savedRecipes.length > 0
    ? `\nThe user's saved Recipe Box (you have full access to these):\n${savedRecipes.map(r =>
        `- ${r.title}${r.description ? `: ${r.description}` : ''}${r.ingredients.length ? ` | Ingredients: ${r.ingredients.slice(0,5).join(', ')}${r.ingredients.length > 5 ? '...' : ''}` : ''}`
      ).join('\n')}`
    : ''

  const system = `You are a meal planning assistant helping a user refine their weekly dinner plan. You have full access to their data — treat it as your own working context, not as something you're "looking at from outside."

Current plan:
${mealSummary}
${savedRecipesBlock}
${plan.rationale ? `\nWhy this plan was chosen: ${plan.rationale}` : ''}

When asked about a saved recipe, answer from the details above. Be warm and practical. The "Regenerate entire plan" button rebuilds the whole week — only suggest it for major overhauls.

IMPORTANT — SWAPPING A DAY: If the user wants to put a specific saved recipe on a specific day (e.g. "put Baked Chicken Parmesan on Day 3", "use TJ's Salmon for Day 1"), you MUST:
1. Confirm it in your reply ("Done! I've put Baked Chicken Parmesan on Day 3.")
2. Return this block at the very end:
<swap>{"day":"Day 3","recipeName":"Baked Chicken Parmesan"}</swap>
Use the exact day name (Day 1, Day 2, etc.) and exact recipe title from the Recipe Box.

IMPORTANT — FOOD DISLIKES: If the user expresses a food dislike, acknowledge it and return:
<preferences>{"new_dislikes":["ingredient1","ingredient2"]}</preferences>

Only include the <preferences> block if the user is genuinely expressing a dislike to remember. Do not include it for one-off meal swaps or general questions.`

  const messages = [
    ...(history || []),
    { role: 'user' as const, content: message },
  ]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    messages,
  })

  const raw = (response.content[0] as { text: string }).text

  // Extract any preference updates
  const prefMatch = raw.match(/<preferences>([\s\S]*?)<\/preferences>/)
  let newDislikes: string[] = []
  let savedDislikes: string[] = []

  if (prefMatch) {
    try {
      const parsed = JSON.parse(prefMatch[1])
      newDislikes = parsed.new_dislikes ?? []
    } catch { /* ignore */ }
  }

  // Save new dislikes to profile if any
  if (newDislikes.length > 0) {
    const profileResult = await db.execute({
      sql: 'SELECT dislikes FROM profiles WHERE user_id = ?',
      args: [userId],
    })
    const existing: string[] = profileResult.rows[0]
      ? JSON.parse((profileResult.rows[0].dislikes as string) || '[]')
      : []
    const merged = Array.from(new Set([...existing, ...newDislikes.map(d => d.toLowerCase())]))

    if (profileResult.rows.length > 0) {
      await db.execute({
        sql: 'UPDATE profiles SET dislikes = ?, updated_at = datetime(\'now\') WHERE user_id = ?',
        args: [JSON.stringify(merged), userId],
      })
    } else {
      await db.execute({
        sql: 'INSERT INTO profiles (user_id, dislikes, dietary_restrictions) VALUES (?, ?, ?)',
        args: [userId, JSON.stringify(merged), '[]'],
      })
    }
    savedDislikes = newDislikes
  }

  // Detect swap action
  const swapMatch = raw.match(/<swap>([\s\S]*?)<\/swap>/)
  let swapAction: { day: string; recipe: typeof savedRecipes[0] | null; recipeName: string } | null = null

  if (swapMatch) {
    try {
      const { day, recipeName } = JSON.parse(swapMatch[1])
      const recipe = savedRecipes.find(r => r.title.toLowerCase() === recipeName.toLowerCase())
        || savedRecipes.find(r => r.title.toLowerCase().includes(recipeName.toLowerCase().slice(0, 15)))
      swapAction = { day, recipeName, recipe: recipe || null }

      // Update DB if we have the recipe
      if (recipe && plan?.weekStart) {
        const planResult = await db.execute({
          sql: 'SELECT meals FROM meal_plans WHERE user_id = ? AND week_start_date = ? ORDER BY created_at DESC LIMIT 1',
          args: [userId, plan.weekStart],
        })
        if (planResult.rows.length > 0) {
          const days = JSON.parse((planResult.rows[0].meals as string) || '[]')
          const updated = days.map((d: { day: string }) =>
            d.day === day ? { ...d, dinner: recipe } : d
          )
          await db.execute({
            sql: 'UPDATE meal_plans SET meals = ? WHERE user_id = ? AND week_start_date = ?',
            args: [JSON.stringify(updated), userId, plan.weekStart],
          })
        }
      }
    } catch { /* ignore */ }
  }

  // Strip action blocks from reply
  const reply = raw
    .replace(/<preferences>[\s\S]*?<\/preferences>/, '')
    .replace(/<swap>[\s\S]*?<\/swap>/, '')
    .trim()

  return NextResponse.json({ reply, savedDislikes, swapAction })
}
