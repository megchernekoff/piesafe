import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipe, message, history } = await req.json()

  const system = `You are a knowledgeable, friendly cooking assistant helping someone with a specific recipe.

Here is the recipe they are looking at:

**${recipe.title}**
${recipe.description ? `${recipe.description}\n` : ''}
${recipe.servings ? `Serves: ${recipe.servings}` : ''}
${recipe.prep_time ? `Prep: ${recipe.prep_time} minutes` : ''}
${recipe.cook_time ? `Cook: ${recipe.cook_time} minutes` : ''}

Ingredients:
${recipe.ingredients.map((i: string) => `- ${i}`).join('\n')}

Instructions:
${recipe.instructions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

Answer questions about this recipe specifically. Be practical, conversational, and concise. If asked about substitutions, explain how they'll affect the dish. If asked about technique, be clear and encouraging.`

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

  const reply = (response.content[0] as { text: string }).text

  return NextResponse.json({ reply })
}
