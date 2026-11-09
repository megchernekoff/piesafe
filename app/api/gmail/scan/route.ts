import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import * as cheerio from 'cheerio'
import { db } from '@/lib/db'

const anthropic = new Anthropic()

export const SUPPORTED_PROVIDERS = [
  { name: 'NYT Cooking',        domain: 'nytimes.com',          from: '{nytdirect@nytimes.com OR cooking-recommendations@nytimes.com}', senderName: 'NYT Cooking', keywords: ['nyt', 'new york times', 'nytimes', 'cooking'] },
  { name: 'Serious Eats',       domain: 'seriouseats.com',       from: 'newsletters@seriouseats.com',          keywords: ['serious eats', 'seriouseats'] },
  { name: 'Bon Appétit',        domain: 'newsletter.bonappetit.com', from: 'email@newsletter.bonappetit.com',   keywords: ['bon appetit', 'bonappetit', 'bon appétit'] },
  { name: 'Food52',             domain: 'food52.com',            from: 'hello@food52.com',                     keywords: ['food52'] },
  { name: 'Half Baked Harvest', domain: 'halfbakedharvest.com',  from: 'newsletter@halfbakedharvest.com',      keywords: ['half baked harvest', 'halfbakedharvest'] },
  { name: 'Smitten Kitchen',    domain: 'substack.com',          from: 'smittenkitchen@substack.com',          keywords: ['smitten kitchen', 'smittenkitchen'] },
  { name: 'The Kitchn',         domain: 'thekitchn.com',         from: 'newsletter@thekitchn.com',             keywords: ['the kitchn', 'kitchn'] },
  { name: 'Epicurious',         domain: 'epicurious.com',        from: 'digest@epicurious.com',                keywords: ['epicurious'] },
  { name: 'Budget Bytes',       domain: 'budgetbytes.com',       from: 'hello@budgetbytes.com',                keywords: ['budget bytes', 'budgetbytes'] },
  { name: 'King Arthur Baking', domain: 'kingarthurbaking.com',  from: 'newsletter@kingarthurbaking.com',      keywords: ['king arthur', 'king arthur baking'] },
  { name: 'Simply Recipes',     domain: 'simplyrecipes.com',     from: 'newsletter@simplyrecipes.com',         keywords: ['simply recipes', 'simplyrecipes'] },
  { name: 'What to Cook',       domain: 'substack.com',          from: 'whattocook@substack.com',              keywords: ['what to cook', 'caro chambers', 'whattocook'] },
  { name: 'The Lost Kitchen',   domain: 'findthelostkitchen.com', from: 'frontdesk@findthelostkitchen.com',     keywords: ['lost kitchen', 'findthelostkitchen'] },
  { name: 'Ina Garten',         domain: 'substack.com',          from: 'inagarten@substack.com',               keywords: ['ina garten', 'barefoot contessa', 'inagarten'] },
]

async function refreshIfNeeded(userId: string, tokens: { access_token: string; refresh_token: string; expiry: number }) {
  if (Date.now() < tokens.expiry - 60000) return tokens.access_token

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Token refresh failed')

  const expiry = Date.now() + (data.expires_in ?? 3600) * 1000
  await db.execute({
    sql: 'UPDATE gmail_tokens SET access_token = ?, expiry = ?, updated_at = datetime(\'now\') WHERE user_id = ?',
    args: [data.access_token, expiry, userId],
  })
  return data.access_token as string
}

function decodeBase64(str: string): string {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
}

// Extract specific MIME type part from email payload
function extractMimePart(payload: Record<string, unknown>, mimeType: string): string {
  const mime = (payload.mimeType as string) || ''
  if (mime === mimeType && payload.body && (payload.body as Record<string, unknown>).data) {
    return decodeBase64((payload.body as Record<string, string>).data)
  }
  if (payload.parts) {
    for (const part of payload.parts as Record<string, unknown>[]) {
      const result = extractMimePart(part, mimeType)
      if (result) return result
    }
  }
  return ''
}

// Get HTML body preferentially, fall back to plain text
function extractBody(payload: Record<string, unknown>): string {
  return extractMimePart(payload, 'text/html') || extractMimePart(payload, 'text/plain')
}

function extractRecipeLinks(html: string, domain: string): string[] {
  const links: string[] = []

  // Strategy 1: find direct recipe URLs embedded anywhere in the HTML (including inside redirect URLs)
  const recipePattern = new RegExp(`https?://[\\w.-]*${domain.replace('.', '\\.')}/recipes/[\\w-]+`, 'g')
  const directMatches = html.match(recipePattern) || []
  for (const match of directMatches) {
    try {
      const u = new URL(match)
      const clean = `${u.origin}${u.pathname}`
      if (!links.includes(clean)) links.push(clean)
    } catch { /* skip */ }
  }

  // Strategy 2: also check <a href> tags for any domain links with recipe in path
  const $ = cheerio.load(html)
  $('a[href]').each((_: number, el: ReturnType<typeof $>[0]) => {
    const href = $(el as Parameters<typeof $>[0]).attr('href') || ''
    try {
      const u = new URL(href)
      if (u.hostname.includes(domain) && u.pathname.includes('recipe')) {
        const clean = `${u.origin}${u.pathname}`
        if (!links.includes(clean)) links.push(clean)
      }
    } catch { /* skip */ }
  })

  return [...new Set(links)].slice(0, 5)
}

// Search NYT Cooking for a recipe by title and return its URL
async function searchNytRecipeUrl(title: string): Promise<string | null> {
  try {
    const searchUrl = `https://cooking.nytimes.com/search?q=${encodeURIComponent(title)}`
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()
    // Find first recipe URL in search results
    const match = html.match(/https?:\/\/cooking\.nytimes\.com\/recipes\/[\w-]+/)
    return match ? match[0] : null
  } catch { return null }
}

async function fetchJsonLd(url: string): Promise<{ title: string; description: string; ingredients: string[]; instructions: string[]; tags: string[]; prep_time: number | null; cook_time: number | null; servings: number | null } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()
    const $ = cheerio.load(html)
    for (const el of $('script[type="application/ld+json"]').toArray()) {
      try {
        const json = JSON.parse($(el).html() || '')
        const items = Array.isArray(json) ? json : [json]
        for (const item of items) {
          const r = item['@type'] === 'Recipe' ? item : item['@graph']?.find((n: Record<string, unknown>) => n['@type'] === 'Recipe')
          if (!r) continue
          const toArr = (v: unknown): string[] => {
            if (!v) return []
            if (Array.isArray(v)) return v.map((x: unknown) => typeof x === 'object' ? (x as Record<string, string>).text || '' : String(x)).filter(Boolean)
            return [String(v)]
          }
          const toMin = (v: unknown) => {
            if (!v) return null
            const s = String(v); const h = s.match(/(\d+)H/)?.[1]; const m = s.match(/(\d+)M/)?.[1]
            return (parseInt(h||'0')*60)+parseInt(m||'0')||null
          }
          const ingredients = toArr(r.recipeIngredient)
          if (ingredients.length < 2) continue
          return {
            title: String(r.name || '').trim(),
            description: String(r.description || '').trim(),
            ingredients,
            instructions: toArr(Array.isArray(r.recipeInstructions) ? r.recipeInstructions.map((s: Record<string,string>) => s.text||s) : r.recipeInstructions),
            tags: toArr(r.keywords).flatMap((k: string) => k.split(',')).map((k: string) => k.trim()).filter(Boolean),
            prep_time: toMin(r.prepTime),
            cook_time: toMin(r.cookTime),
            servings: parseInt(String(r.recipeYield||'0'))||null,
          }
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return null
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { domain, providerName, pageToken = '' } = await req.json()
  if (!domain) return NextResponse.json({ error: 'domain required' }, { status: 400 })

  const tokenResult = await db.execute({
    sql: 'SELECT * FROM gmail_tokens WHERE user_id = ?',
    args: [userId],
  })
  if (tokenResult.rows.length === 0) return NextResponse.json({ connected: false })

  const tokenRow = tokenResult.rows[0]
  let accessToken: string
  try {
    accessToken = await refreshIfNeeded(userId, {
      access_token: tokenRow.access_token as string,
      refresh_token: tokenRow.refresh_token as string,
      expiry: tokenRow.expiry as number,
    })
  } catch {
    return NextResponse.json({ error: 'Gmail token expired — please reconnect.' }, { status: 401 })
  }

  // Fetch all seen gmail IDs (including dismissed/saved) so they never resurface
  const existing = await db.execute({
    sql: 'SELECT gmail_id FROM email_digests WHERE user_id = ?',
    args: [userId],
  })
  const seenIds = new Set(existing.rows.map(r => r.gmail_id as string))

  // Find provider by name first (handles multiple providers on same domain like Substack)
  const provider = SUPPORTED_PROVIDERS.find(p => p.name === providerName)
    || SUPPORTED_PROVIDERS.find(p => p.domain === domain)
  const fromQuery = provider?.from ? `from:${provider.from}` : `from:${domain}`

  const after = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
  const query = `${fromQuery} after:${after}`
  console.log(`Scanning Gmail: "${query}"`)
  void providerName

  const pageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=3${pageToken ? `&pageToken=${pageToken}` : ''}`

  const searchRes = await fetch(pageUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
  const searchData = await searchRes.json()
  const messages: { id: string }[] = searchData.messages ?? []
  const nextPageToken: string = searchData.nextPageToken ?? ''
  console.log(`Gmail search returned ${messages.length} messages, nextPageToken: ${nextPageToken ? 'yes' : 'none'}`)

  const newMessages = messages.filter(m => !seenIds.has(m.id))
  if (newMessages.length === 0) return NextResponse.json({ digests: [], nextPageToken })

  const digests = []

  for (const msg of newMessages) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const msgData = await msgRes.json()

    const headers: { name: string; value: string }[] = msgData.payload?.headers ?? []
    const subject = headers.find(h => h.name === 'Subject')?.value ?? '(no subject)'
    const from = headers.find(h => h.name === 'From')?.value ?? ''
    const date = headers.find(h => h.name === 'Date')?.value ?? ''

    // If provider requires a specific sender display name, enforce it
    if (provider?.senderName) {
      const displayName = from.split('<')[0].replace(/"/g, '').trim()
      if (!displayName.toLowerCase().includes(provider.senderName.toLowerCase())) {
        console.log(`Skipping non-matching sender: "${displayName}" (expected "${provider.senderName}")`)
        continue
      }
    }

    const rawHtml = extractBody(msgData.payload ?? {})
    const fullText = rawHtml
      .replace(/<[^>]*>/g, ' ')
      .replace(/&#\d+;/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const skipChars = fullText.length > 6000 ? Math.floor(fullText.length * 0.15) : 0
    const cleanText = fullText.slice(skipChars, skipChars + 8000)

    // Try fetching full recipes via JSON-LD from links in the email
    const recipeLinks = extractRecipeLinks(rawHtml, domain)
    // Smarter text extraction: prioritize content after the first 20% of the email
    // (Substack emails have long preambles before the actual recipes)
    const debugInfo = { htmlLength: rawHtml.length, textLen: fullText.length, skipChars, windowStart: cleanText.slice(0, 150), recipeLinks, jsonLdResults: [] as string[], claudeRaw: '' }
    const fullRecipes: { title: string; description: string; url: string; ingredients: string[]; instructions: string[]; tags: string[]; prep_time: number | null; cook_time: number | null; servings: number | null }[] = []

    for (const link of recipeLinks) {
      const recipe = await fetchJsonLd(link)
      debugInfo.jsonLdResults.push(recipe ? `✓ ${recipe.title} (${recipe.ingredients.length} ingredients)` : `✗ no recipe at ${link}`)
      if (recipe) fullRecipes.push({ ...recipe, url: link })
    }

    // Build a map of anchor text → href for matching recipe titles to links
    const $ = cheerio.load(rawHtml)
    const anchorMap: { text: string; href: string }[] = []
    $('a[href]').each((_: number, el: ReturnType<typeof $>[0]) => {
      const href = $(el as Parameters<typeof $>[0]).attr('href') || ''
      const text = $(el as Parameters<typeof $>[0]).text().trim()
      if (href.startsWith('http') && text.length > 3) anchorMap.push({ text, href })
    })

    let summary: { title: string; description: string; url?: string; ingredients?: string[]; instructions?: string[]; tags?: string[]; prep_time?: number | null; cook_time?: number | null; servings?: number | null }[] = []

    if (fullRecipes.length > 0) {
      // We got full recipes from JSON-LD — use those
      summary = fullRecipes.map(r => ({
        title: r.title,
        description: r.description,
        url: r.url,
        ingredients: r.ingredients,
        instructions: r.instructions,
        tags: r.tags,
        prep_time: r.prep_time,
        cook_time: r.cook_time,
        servings: r.servings,
      }))
    } else if (cleanText && cleanText.length >= 100) {
      // Fall back to Claude parsing the email text
      const claudeRes = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `This is a recipe newsletter email. Extract a list of the recipes or dishes mentioned.
Return a JSON array of objects, one per recipe found:
[{ "title": "Recipe name", "description": "One short sentence about it" }]
If no recipes are mentioned, return [].
Return only valid JSON.

Email subject: ${subject}
Email text:
${cleanText}`,
        }],
      })
      try {
        const raw = (claudeRes.content[0] as { text: string }).text
        debugInfo.claudeRaw = raw.slice(0, 300)
        const match = raw.match(/\[[\s\S]*\]/)
        if (match) {
          const parsed = JSON.parse(match[0])
          summary = parsed.map((recipe: { title: string; description: string }) => {
            const titleLower = recipe.title.toLowerCase()
            const matched = anchorMap.find(a =>
              a.text.toLowerCase().includes(titleLower.slice(0, 20)) ||
              titleLower.includes(a.text.toLowerCase().slice(0, 20))
            )
            return { ...recipe, url: matched?.href ?? null }
          })
        }
      } catch (e) { summary = []; debugInfo.claudeRaw = 'ERROR: ' + String(e) }
    }

    await db.execute({
      sql: `INSERT INTO email_digests (user_id, gmail_id, sender, subject, date, summary)
            VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
      args: [userId, msg.id, from, subject, date, JSON.stringify(summary)],
    })

    digests.push({ id: msg.id, gmail_id: msg.id, sender: from, subject, date, summary, saved: 0, _debug: debugInfo })
  }

  // Persist the nextPageToken keyed by name so multiple providers on same domain don't share it
  await db.execute({
    sql: 'UPDATE gmail_providers SET next_page_token = ? WHERE user_id = ? AND name = ?',
    args: [nextPageToken || null, userId, providerName],
  })

  return NextResponse.json({ digests, nextPageToken })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await db.execute({
    sql: 'SELECT * FROM email_digests WHERE user_id = ? AND saved = 0 AND dismissed = 0 ORDER BY date DESC',
    args: [userId],
  })

  return NextResponse.json(result.rows
    .map(r => ({
      id: String(r.id ?? ''),
      gmail_id: String(r.gmail_id ?? ''),
      sender: String(r.sender ?? ''),
      subject: String(r.subject ?? ''),
      date: String(r.date ?? ''),
      summary: JSON.parse((r.summary as string) || '[]'),
      saved: 0,
    })))
}
