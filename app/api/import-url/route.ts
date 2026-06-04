import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
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

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  let html: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; recipe-importer/1.0)' },
      signal: AbortSignal.timeout(10000),
    })
    html = await res.text()
  } catch {
    return NextResponse.json({ error: 'Could not fetch that URL. Try a different one.' }, { status: 422 })
  }

  const $ = cheerio.load(html)
  $('script, style, nav, footer, header, aside, [class*="ad-"], [class*="comment"]').remove()
  const text = ($('main').text() || $('article').text() || $('body').text())
    .replace(/\s+/g, ' ').trim().slice(0, 8000)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Extract the recipe from this webpage text. Return a JSON object with exactly these fields:
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
Return only valid JSON, no markdown, no extra text.

Webpage text:
${text}`,
    }],
  })

  let recipe: Record<string, unknown>
  try {
    recipe = JSON.parse(extractJSON((message.content[0] as { text: string }).text))
  } catch {
    return NextResponse.json({ error: 'Could not parse recipe from that page.' }, { status: 422 })
  }

  await db.execute({
    sql: `INSERT INTO recipes
            (user_id, title, description, ingredients, instructions, source_url, tags, prep_time, cook_time, servings)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      userId,
      recipe.title as string,
      (recipe.description as string) ?? '',
      JSON.stringify(recipe.ingredients ?? []),
      JSON.stringify(recipe.instructions ?? []),
      url,
      JSON.stringify(recipe.tags ?? []),
      (recipe.prep_time as number) ?? null,
      (recipe.cook_time as number) ?? null,
      (recipe.servings as number) ?? null,
    ],
  })

  return NextResponse.json({
    success: true,
    recipe: {
      ...recipe,
      source_url: url,
      ingredients: recipe.ingredients ?? [],
      instructions: recipe.instructions ?? [],
      tags: recipe.tags ?? [],
    },
  })
}
