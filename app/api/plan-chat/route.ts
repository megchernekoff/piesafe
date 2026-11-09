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

  // Fetch saved recipes for context
  const recipesResult = await db.execute({
    sql: "SELECT title FROM recipes WHERE user_id = ? AND ingredients != '[]' ORDER BY created_at DESC LIMIT 20",
    args: [userId],
  })
  const savedRecipes = recipesResult.rows.map(r => r.title as string)

  const system = `You are a helpful meal planning assistant. The user has a generated weekly dinner plan and wants to discuss changes or ask questions about it.

Current plan:
${mealSummary}

${savedRecipes.length > 0 ? `Recipes in their Recipe Box (can suggest using these): ${savedRecipes.join(', ')}` : ''}

${plan.rationale ? `Why this plan was chosen: ${plan.rationale}` : ''}

Help the user refine the plan. If they want to swap one day, suggest a specific replacement. Be conversational and concise. Note: "Regenerate entire plan" button will rebuild the whole week — suggest it only for major overhauls.

IMPORTANT: If the user expresses a food dislike or aversion (e.g. "I don't like polenta", "no more mushrooms", "I hate cilantro", "avoid shellfish"), you must:
1. Acknowledge it warmly in your reply
2. Return a JSON block at the very end of your response in this exact format:
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

  // Strip the <preferences> block from the reply
  const reply = raw.replace(/<preferences>[\s\S]*?<\/preferences>/, '').trim()

  return NextResponse.json({ reply, savedDislikes })
}
