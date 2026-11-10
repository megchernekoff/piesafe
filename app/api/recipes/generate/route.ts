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

  const { prompt } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

  // Load user preferences so Claude can respect them
  const profileResult = await db.execute({
    sql: 'SELECT dietary_restrictions, dislikes, household_size, toddler_mode FROM profiles WHERE user_id = ?',
    args: [userId],
  })
  const profile = profileResult.rows[0] ?? null
  const dietary: string[] = profile ? JSON.parse((profile.dietary_restrictions as string) || '[]') : []
  const dislikes: string[] = profile ? JSON.parse((profile.dislikes as string) || '[]') : []
  const servings = (profile?.household_size as number) || 2
  const toddlerMode = profile?.toddler_mode === 1

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create a complete recipe based on this request: "${prompt}"

${dietary.length ? `Dietary restrictions: ${dietary.join(', ')}.` : ''}
${dislikes.length ? `Never use: ${dislikes.join(', ')}.` : ''}
Default to ${servings} servings.
${toddlerMode ? 'Include a toddler_notes field with adaptations for a young child.' : ''}

Return a JSON object:
{
  "title": "Recipe name",
  "description": "One appetising sentence",
  "ingredients": ["amount + ingredient", ...],
  "instructions": ["Step 1.", "Step 2.", ...],
  "prep_time": 15,
  "cook_time": 30,
  "servings": ${servings},
  "tags": ["tag1", "tag2"],
  "toddler_notes": null
}
Return only valid JSON, no markdown.`,
    }],
  })

  let recipe
  try {
    recipe = JSON.parse(extractJSON((message.content[0] as { text: string }).text))
  } catch {
    return NextResponse.json({ error: 'Could not generate a recipe from that prompt.' }, { status: 500 })
  }

  await db.execute({
    sql: `INSERT INTO recipes (user_id, title, description, ingredients, instructions, tags, prep_time, cook_time, servings, toddler_notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      userId,
      recipe.title,
      recipe.description ?? '',
      JSON.stringify(recipe.ingredients ?? []),
      JSON.stringify(recipe.instructions ?? []),
      JSON.stringify(recipe.tags ?? []),
      recipe.prep_time ?? null,
      recipe.cook_time ?? null,
      recipe.servings ?? servings,
      recipe.toddler_notes ?? null,
    ],
  })

  return NextResponse.json({ success: true, recipe })
}
