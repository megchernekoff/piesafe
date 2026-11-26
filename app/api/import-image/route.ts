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
  const files = formData.getAll('images') as File[]
  if (files.length === 0) return NextResponse.json({ error: 'No images provided' }, { status: 400 })

  const imageBlocks = await Promise.all(
    files.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      return { type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType, data: base64 } }
    })
  )

  const pageNote = files.length > 1
    ? `These ${files.length} images are consecutive pages of the same recipe. Combine them into one complete recipe.`
    : 'This image may be a photo of a cookbook page, recipe card, handwritten note, or screenshot.'

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        ...imageBlocks,
        {
          type: 'text',
          text: `Extract the recipe from ${files.length > 1 ? 'these images' : 'this image'}. ${pageNote}

Return a JSON object with exactly these fields:
{
  "title": "Recipe name",
  "description": "One sentence description",
  "ingredients": ["1 cup flour", "2 eggs", ...],
  "instructions": ["Step 1...", "Step 2...", ...],
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "tags": ["vegetarian", "quick", ...],
  "notes": "Any margin notes, annotations, personal tips, or handwritten additions visible in the image — verbatim or paraphrased. null if none."
}

If any field isn't visible, use null for numbers or [] for arrays.
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

  const dupe = await db.execute({
    sql: 'SELECT id, title FROM recipes WHERE user_id = ? AND LOWER(title) = LOWER(?)',
    args: [userId, recipe.title as string],
  })
  if (dupe.rows.length > 0) {
    return NextResponse.json(
      { duplicate: true, existing: { id: dupe.rows[0].id, title: dupe.rows[0].title } },
      { status: 409 }
    )
  }

  await db.execute({
    sql: `INSERT INTO recipes
            (user_id, title, description, ingredients, instructions, tags, prep_time, cook_time, servings, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      (recipe.notes as string) ?? null,
    ],
  })

  return NextResponse.json({ success: true, recipe })
}
