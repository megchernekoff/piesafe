import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { db } from '@/lib/db'

const BOT_TITLES = /just a moment|just one moment|checking your browser|attention required|access denied|403 forbidden|please wait/i

function titleFromUrl(url: string): string {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean)
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!/^\d+$/.test(parts[i])) {
        return parts[i].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      }
    }
  } catch { /* fall through */ }
  return 'Saved recipe'
}

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
    } catch { /* skip malformed */ }
  }
  return null
}

function toMinutes(val: unknown): number | null {
  if (!val) return null
  const str = String(val)
  const hours = str.match(/(\d+)H/)?.[1]
  const mins = str.match(/(\d+)M/)?.[1]
  return (parseInt(hours || '0') * 60) + parseInt(mins || '0') || null
}

function toArray(val: unknown): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.map(v =>
    typeof v === 'object' ? (v as Record<string, string>).text || JSON.stringify(v) : String(v)
  ).filter(Boolean)
  return String(val).split('\n').filter(Boolean)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  let title = titleFromUrl(url)
  let html = ''

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

    const $ = cheerio.load(html)
    const ogTitle = $('meta[property="og:title"]').attr('content')
    const pageTitle = $('title').text().replace(/\s*[-|].*$/, '').trim()
    const candidate = ogTitle || pageTitle
    if (candidate && !BOT_TITLES.test(candidate)) title = candidate
  } catch { /* keep URL-derived title, proceed with empty html */ }

  // Try JSON-LD structured data — works even on paywalled sites that expose it for SEO
  if (html) {
    const structured = extractJsonLd(html)
    if (structured) {
      const ingredients = toArray(structured.recipeIngredient)
      const instructions = toArray(
        Array.isArray(structured.recipeInstructions)
          ? structured.recipeInstructions.map((s: Record<string, string>) => s.text || s)
          : structured.recipeInstructions
      )
      const recipeName = String(structured.name || title).trim()
      const description = String(structured.description || '').trim()
      const tags = toArray(structured.keywords)
        .flatMap((k: string) => k.split(','))
        .map((k: string) => k.trim())
        .filter(Boolean)

      if (recipeName && ingredients.length >= 2) {
        await db.execute({
          sql: `INSERT INTO recipes (user_id, title, description, source_url, ingredients, instructions, tags, prep_time, cook_time, servings)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            userId, recipeName, description, url,
            JSON.stringify(ingredients),
            JSON.stringify(instructions),
            JSON.stringify(tags),
            toMinutes(structured.prepTime),
            toMinutes(structured.cookTime),
            parseInt(String(structured.recipeYield || '0')) || null,
          ],
        })
        return NextResponse.json({ success: true, full: true, recipe: { title: recipeName, source_url: url } })
      }
    }
  }

  // Fall back to saving as bookmark with title + URL
  await db.execute({
    sql: `INSERT INTO recipes (user_id, title, source_url, ingredients, instructions, tags)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [userId, title, url, JSON.stringify([]), JSON.stringify([]), JSON.stringify([])],
  })

  return NextResponse.json({ success: true, full: false, recipe: { title, source_url: url } })
}
