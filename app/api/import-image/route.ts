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

  const formData = await req.formData()
  const file = formData.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 },
        },
        {
          type: 'text',
          text: `Extract the recipe from this image. It may be a photo of a cookbook page, recipe card, handwritten note, or screenshot.

Return a JSON object with exactly these fields:
{
  "title": "Recipe name",
  "description": "One sentence description",
  "ingredients": ["1 cup flour", "2 eggs", ...],
  "instructions": ["Step 1...", "Step 2...", ...],
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "tags": ["vegetarian", "quick", ...]
}

If any field isn't visible in the image, use null for numbers or [] for arrays.
Return only valid JSON, no markdown, no extra text.`,
        },
      ],
    }],
  })

  let recipe: Record<string, unknown>
  try {
    recipe = JSON.parse(extractJSON((message.content[0] as { text: string }).text))
  } catch {
    return NextResponse.json({ error: 'Could not read a recipe from that image. Try a clearer photo.' }, { status: 422 })
  }

  await db.execute({
    sql: `INSERT INTO recipes
            (user_id, title, description, ingredients, instructions, tags, prep_time, cook_time, servings)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      userId,
      recipe.title as string,
      (recipe.description as string) ?? '',
      JSON.stringify(recipe.ingredients ?? []),
      JSON.stringify(recipe.instructions ?? []),
      JSON.stringify(recipe.tags ?? []),
      (recipe.prep_time as number) ?? null,
      (recipe.cook_time as number) ?? null,
      (recipe.servings as number) ?? null,
    ],
  })

  return NextResponse.json({ success: true, recipe })
}
