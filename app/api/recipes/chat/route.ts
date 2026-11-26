import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message, history } = await req.json()

  const profileResult = await db.execute({
    sql: 'SELECT dietary_restrictions, dislikes, household_size, toddler_mode FROM profiles WHERE user_id = ?',
    args: [userId],
  })
  const profile = profileResult.rows[0] ?? null
  const dietary: string[] = profile ? JSON.parse((profile.dietary_restrictions as string) || '[]') : []
  const dislikes: string[] = profile ? JSON.parse((profile.dislikes as string) || '[]') : []
  const servings = (profile?.household_size as number) || 2
  const toddlerMode = profile?.toddler_mode === 1

  const system = `You are a warm, friendly cooking assistant helping someone create the perfect recipe.

Chat naturally — ask about cravings, skill level, what they have on hand, time constraints, or anything helpful. Keep responses short and conversational.
${dietary.length ? `Dietary restrictions: ${dietary.join(', ')}.` : ''}
${dislikes.length ? `Never use: ${dislikes.join(', ')}.` : ''}
Default to ${servings} servings.${toddlerMode ? ' Include toddler_notes when relevant.' : ''}

Whenever you have a recipe to suggest (even a first draft), include it at the end of your message inside <recipe>...</recipe> tags. Update the recipe JSON whenever the user asks for changes — always include the latest version.

<recipe>{"title":"...","description":"one appetising sentence","ingredients":["amount ingredient",...],"instructions":["Step 1.","Step 2."...],"prep_time":15,"cook_time":30,"servings":${servings},"tags":["chicken","one pot"]${toddlerMode ? ',"toddler_notes":null' : ''}}</recipe>

Tags: 2-4 max. Use only: main protein/ingredient (beef, chicken, pork, fish, pasta, beans, eggs, tofu…), dish type (soup, salad, stew, side dish, main dish, one pot, sheet pan…), or style (vegetarian, vegan, gluten-free, quick, low lift, one skillet, meal prep). Never tag minor ingredients.

The <recipe> block is hidden from the user — your message text is what they see. Don't describe the JSON or tell them to look at it.`

  const messages = [
    ...(history || []),
    { role: 'user' as const, content: message },
  ]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system,
    messages,
  })

  const raw = (response.content[0] as { text: string }).text

  let recipe = null
  const match = raw.match(/<recipe>([\s\S]*?)<\/recipe>/)
  if (match) {
    try { recipe = JSON.parse(match[1]) } catch { /* ignore malformed */ }
  }

  const reply = raw.replace(/<recipe>[\s\S]*?<\/recipe>/g, '').trim()

  return NextResponse.json({ reply, recipe })
}
