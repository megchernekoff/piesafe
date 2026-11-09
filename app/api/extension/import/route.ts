import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import Anthropic from '@anthropic-ai/sdk'
import { verifyToken } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

const anthropic = new Anthropic()

function extractJsonLd(html: string) {
  const $ = cheerio.load(html)
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    try {
      const json = JSON.parse($(el).html() || '')
      const items = Array.isArray(json) ? json : [json]
      for (const item of items) {
        if (item['@type'] === 'Recipe') return item
        if (Array.isArray(item['@graph'])) {
          const r = item['@graph'].find((n: Record<string, unknown>) => n['@type'] === 'Recipe')
          if (r) return r
        }
      }
    } catch { /* skip */ }
  }
  return null
}

function toArr(val: unknown): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.map(v =>
    typeof v === 'object' ? (v as Record<string, string>).text || JSON.stringify(v) : String(v)
  ).filter(Boolean)
  return String(val).split('\n').filter(Boolean)
}

function toMin(val: unknown): number | null {
  if (!val) return null
  const s = String(val)
  const h = s.match(/(\d+)H/)?.[1]; const m = s.match(/(\d+)M/)?.[1]
  return (parseInt(h || '0') * 60) + parseInt(m || '0') || null
}

function extractJSON(text: string): string {
  const block = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (block) return block[1]
  const obj = text.match(/\{[\s\S]*\}/)
  if (obj) return obj[0]
  return text
}

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('x-pie-safe-session')
  if (!token) return null
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! })
    return payload.sub ?? null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })

  const { html, url, preview, recipe: savedRecipe } = await req.json()

  // Saving a previewed recipe
  if (!preview && savedRecipe) {
    const hasFullRecipe = savedRecipe.ingredients?.length > 0
    await db.execute({
      sql: `INSERT INTO recipes (user_id, title, description, source_url, ingredients, instructions, tags, prep_time, cook_time, servings)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        userId,
        savedRecipe.title,
        savedRecipe.description ?? '',
        url,
        JSON.stringify(hasFullRecipe ? savedRecipe.ingredients : []),
        JSON.stringify(hasFullRecipe ? savedRecipe.instructions : []),
        JSON.stringify(savedRecipe.tags ?? []),
        savedRecipe.prep_time ?? null,
        savedRecipe.cook_time ?? null,
        savedRecipe.servings ?? null,
      ],
    })
    return NextResponse.json({ success: true })
  }

  if (!html) return NextResponse.json({ error: 'No HTML provided' }, { status: 400 })

  // Try JSON-LD first
  const structured = extractJsonLd(html)
  if (structured) {
    const ingredients = toArr(structured.recipeIngredient)
    const instructions = toArr(
      Array.isArray(structured.recipeInstructions)
        ? structured.recipeInstructions.map((s: Record<string, string>) => s.text || s)
        : structured.recipeInstructions
    )
    const title = String(structured.name || '').trim()
    if (title && ingredients.length >= 2) {
      return NextResponse.json({
        title,
        description: String(structured.description || '').trim(),
        ingredients,
        instructions,
        tags: toArr(structured.keywords).flatMap((k: string) => k.split(',')).map((k: string) => k.trim()).filter(Boolean),
        prep_time: toMin(structured.prepTime),
        cook_time: toMin(structured.cookTime),
        servings: parseInt(String(structured.recipeYield || '0')) || null,
        _html: html,
      })
    }
  }

  // Fall back to Claude
  const $ = cheerio.load(html)
  $('script, style, nav, footer, header, aside').remove()
  const text = ($('main').text() || $('article').text() || $('body').text())
    .replace(/\s+/g, ' ').trim().slice(0, 6000)

  // No readable content — save as title+URL bookmark
  if (text.length < 100) {
    const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text().replace(/\s*[-|].*$/, '').trim()
    return NextResponse.json({ title: ogTitle || 'Saved recipe', description: '', ingredients: [], instructions: [], tags: [], _html: html })
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Extract the recipe from this page. Return JSON:
{"title":"...","description":"...","ingredients":["..."],"instructions":["..."],"prep_time":15,"cook_time":30,"servings":4,"tags":["..."]}
Return only valid JSON.

Page text:
${text}`,
    }],
  })

  try {
    const parsed = JSON.parse(extractJSON((message.content[0] as { text: string }).text))
    return NextResponse.json({ ...parsed, _html: html })
  } catch {
    return NextResponse.json({ error: 'Could not parse a recipe from this page.' }, { status: 422 })
  }
}
