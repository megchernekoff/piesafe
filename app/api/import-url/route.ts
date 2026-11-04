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

// Pull JSON-LD recipe structured data — most food sites embed this
function extractStructuredRecipe(html: string): Record<string, unknown> | null {
  const $ = cheerio.load(html)
  const scripts = $('script[type="application/ld+json"]').toArray()
  for (const el of scripts) {
    try {
      const json = JSON.parse($(el).html() || '')
      // May be a single object or an array
      const items = Array.isArray(json) ? json : [json]
      for (const item of items) {
        if (item['@type'] === 'Recipe') return item
        // Sometimes nested inside @graph
        if (item['@graph']) {
          const recipe = item['@graph'].find((n: Record<string, unknown>) => n['@type'] === 'Recipe')
          if (recipe) return recipe
        }
      }
    } catch { /* skip malformed blocks */ }
  }
  return null
}

function parseStructuredRecipe(data: Record<string, unknown>) {
  const toMinutes = (val: unknown): number | null => {
    if (!val) return null
    // ISO 8601 duration e.g. PT30M or PT1H30M
    const str = String(val)
    const hours = str.match(/(\d+)H/)?.[1]
    const mins = str.match(/(\d+)M/)?.[1]
    return (parseInt(hours || '0') * 60) + parseInt(mins || '0') || null
  }

  const toArray = (val: unknown): string[] => {
    if (!val) return []
    if (Array.isArray(val)) return val.map(v => typeof v === 'object' ? (v as Record<string,string>).text || JSON.stringify(v) : String(v))
    return [String(val)]
  }

  return {
    title: String(data.name || ''),
    description: String((data.description as string) || ''),
    ingredients: toArray(data.recipeIngredient),
    instructions: toArray(
      Array.isArray(data.recipeInstructions)
        ? data.recipeInstructions.map((s: Record<string,string>) => s.text || s)
        : data.recipeInstructions
    ),
    prep_time: toMinutes(data.prepTime),
    cook_time: toMinutes(data.cookTime),
    servings: parseInt(String(data.recipeYield || data.yield || '0')) || null,
    tags: toArray(data.keywords).flatMap((k: string) => k.split(',')).map((k: string) => k.trim()).filter(Boolean),
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  let html: string
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(10000),
    })
    html = await res.text()
  } catch {
    return NextResponse.json({ error: 'Could not fetch that URL. Try a different one.' }, { status: 422 })
  }

  // Try structured data first — faster and more reliable
  const structured = extractStructuredRecipe(html)
  if (structured) {
    const recipe = parseStructuredRecipe(structured)
    if (recipe.title && recipe.ingredients.length > 0) {
      await db.execute({
        sql: `INSERT INTO recipes
                (user_id, title, description, ingredients, instructions, source_url, tags, prep_time, cook_time, servings)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          userId,
          recipe.title,
          recipe.description,
          JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.instructions),
          url,
          JSON.stringify(recipe.tags),
          recipe.prep_time,
          recipe.cook_time,
          recipe.servings,
        ],
      })
      return NextResponse.json({ success: true, recipe: { ...recipe, source_url: url } })
    }
  }

  // Fall back to Claude parsing the page text
  const $ = cheerio.load(html)
  $('script, style, nav, footer, header, aside, [class*="ad-"], [class*="comment"]').remove()
  const text = ($('main').text() || $('article').text() || $('body').text())
    .replace(/\s+/g, ' ').trim().slice(0, 8000)

  if (text.length < 200) {
    return NextResponse.json({ error: 'This site blocked the import. Try copying the recipe URL from a different site, or use the photo import instead.' }, { status: 422 })
  }

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
    return NextResponse.json({ error: 'Could not find a recipe at that URL. Try the photo import instead.' }, { status: 422 })
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
    recipe: { ...recipe, source_url: url, ingredients: recipe.ingredients ?? [], instructions: recipe.instructions ?? [], tags: recipe.tags ?? [] },
  })
}
