import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipe, message, history, image } = await req.json()

  const hasIngredients = recipe.ingredients?.length > 0

  const system = `You are a knowledgeable, friendly cooking assistant helping someone with a specific recipe.

${hasIngredients ? `Here is the recipe they are looking at:

**${recipe.title}**
${recipe.description ? `${recipe.description}\n` : ''}
${recipe.servings ? `Serves: ${recipe.servings}` : ''}
${recipe.prep_time ? `Prep: ${recipe.prep_time} minutes` : ''}
${recipe.cook_time ? `Cook: ${recipe.cook_time} minutes` : ''}

Ingredients:
${recipe.ingredients.map((i: string) => `- ${i}`).join('\n')}

Instructions:
${recipe.instructions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}` : `The recipe "${recipe.title}" is saved as a link only — no ingredients are stored yet.`}

You can help with two things:
1. Answer questions about the recipe (substitutions, technique, timing, etc.)
2. Make changes to the recipe when asked — rename it, add or remove ingredients, adjust steps, change servings. When the user asks to make a change, confirm what you changed ("Done — I've renamed it to Trader Joe's Salmon"). The user will then click "Save changes to recipe" and the update will be applied.

If a screenshot is uploaded, extract the full recipe details from it. When extracting a recipe from an image, ALWAYS include the full recipe as a JSON object at the end wrapped in <recipe>{"title":"...","description":"...","ingredients":[...],"instructions":[...],"prep_time":15,"cook_time":30,"servings":4,"tags":[]}</recipe> tags.

Be warm, practical, and concise.`

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

  const reply = (response.content[0] as { text: string }).text

  return NextResponse.json({ reply })
}
