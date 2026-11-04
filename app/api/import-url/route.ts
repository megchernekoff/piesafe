import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { db } from '@/lib/db'

function titleFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const slug = pathname.split('/').filter(Boolean).pop() || ''
    if (slug && !/^\d+$/.test(slug)) {
      return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }
    // Slug is just a number (e.g. /recipe/12345/name/) — try second-to-last
    const parts = pathname.split('/').filter(Boolean)
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!/^\d+$/.test(parts[i])) {
        return parts[i].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      }
    }
  } catch { /* fall through */ }
  return 'Saved recipe'
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  // Try to fetch the page title — fall back to slug from URL
  let title = titleFromUrl(url)
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
    const ogTitle = $('meta[property="og:title"]').attr('content')
    const pageTitle = $('title').text().replace(/\s*[-|].*$/, '').trim()
    const botTitles = /just a moment|just one moment|checking your browser|attention required|access denied|403 forbidden|please wait/i
    const candidate = ogTitle || pageTitle
    if (candidate && !botTitles.test(candidate)) title = candidate
  } catch { /* keep URL-derived title */ }

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
