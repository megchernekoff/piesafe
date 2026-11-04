import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  // Try to fetch the page title — fall back gracefully if blocked
  let title = 'Saved recipe'
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()
    const $ = cheerio.load(html)
    // Try og:title first (cleaner), then <title>
    const ogTitle = $('meta[property="og:title"]').attr('content')
    const pageTitle = $('title').text().replace(/\s*[-|].*$/, '').trim()
    title = ogTitle || pageTitle || 'Saved recipe'
  } catch {
    // Can't fetch the page — save with URL-derived title
    try {
      const hostname = new URL(url).hostname.replace('www.', '')
      title = `Recipe from ${hostname}`
    } catch { /* use default */ }
  }

  await db.execute({
    sql: `INSERT INTO recipes (user_id, title, description, source_url, ingredients, instructions, tags)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      userId,
      title,
      '',
      url,
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
    ],
  })

  return NextResponse.json({ success: true, recipe: { title, source_url: url } })
}
