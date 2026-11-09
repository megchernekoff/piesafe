import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, message, history, image } = await req.json()

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
    ? `\nThe user's saved Recipe Box:\n${savedRecipes.map(r =>
        r.ingredients.length > 0
          ? `- ${r.title} [FULL RECIPE: ${r.ingredients.length} ingredients, ${r.instructions.length} steps]`
          : `- ${r.title} [LINK ONLY — no ingredients saved]`
      ).join('\n')}`
    : ''

  const system = `You are a meal planning assistant helping a user refine their weekly dinner plan. You have full access to their data — treat it as your own working context, not as something you're "looking at from outside."

Current plan:
${mealSummary}
${savedRecipesBlock}
${plan.rationale ? `\nWhy this plan was chosen: ${plan.rationale}` : ''}

When asked about a saved recipe, answer from the details above. Be warm and practical. The "Regenerate entire plan" button rebuilds the whole week — only suggest it for major overhauls.

IMPORTANT — SWAPPING A DAY WITH A RECIPE:
If the user uploads a photo of a recipe AND wants it on a specific day, extract the full recipe and return:
<swap>{"day":"Day X","recipeName":"title","recipe":{"title":"...","description":"...","ingredients":["..."],"instructions":["..."],"prep_time":15,"cook_time":30,"servings":4,"tags":[]}}</swap>

If the user wants to use a saved Recipe Box recipe on a specific day:
- If marked [FULL RECIPE]: confirm and return <swap>{"day":"Day X","recipeName":"exact title"}</swap>
- If marked [LINK ONLY]: say "That's saved as a link only — no ingredients yet. Try the photo import, or I can suggest something similar." Do NOT make up ingredients. Do NOT return <swap>.

Never invent ingredients for a recipe you don't have full data for.

IMPORTANT — FOOD DISLIKES: If the user expresses a food dislike, acknowledge it and return:
<preferences>{"new_dislikes":["ingredient1","ingredient2"]}</preferences>

Only include the <preferences> block if the user is genuinely expressing a dislike to remember. Do not include it for one-off meal swaps or general questions.`

  const userContent = image
    ? [
        { type: 'image' as const, source: { type: 'base64' as const, media_type: image.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: image.base64 } },
        { type: 'text' as const, text: message },
      ]
    : message

  const messages = [
    ...(history || []),
    { role: 'user' as const, content: userContent },
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
      const parsed = JSON.parse(swapMatch[1])
      const { day, recipeName } = parsed
      // Use embedded recipe from image extraction if present, otherwise look up saved recipe
      const embeddedRecipe = parsed.recipe || null
      const savedRecipe = embeddedRecipe ? null :
        savedRecipes.find(r => r.title.toLowerCase() === recipeName?.toLowerCase())
        || savedRecipes.find(r => r.title?.toLowerCase().includes(recipeName?.toLowerCase().slice(0, 15)))
      const recipe = embeddedRecipe || savedRecipe || null
      swapAction = { day, recipeName: recipeName || embeddedRecipe?.title || '', recipe }

      // Auto-save photo-extracted recipes to recipe box so they persist
      if (embeddedRecipe && embeddedRecipe.ingredients?.length > 0) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO recipes (user_id, title, description, ingredients, instructions, tags, prep_time, cook_time, servings)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [userId, embeddedRecipe.title, embeddedRecipe.description || '', JSON.stringify(embeddedRecipe.ingredients), JSON.stringify(embeddedRecipe.instructions || []), JSON.stringify(embeddedRecipe.tags || []), embeddedRecipe.prep_time || null, embeddedRecipe.cook_time || null, embeddedRecipe.servings || null],
        })
      }

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
