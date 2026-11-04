import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'

const anthropic = new Anthropic()

export const SUPPORTED_PROVIDERS = [
  { name: 'NYT Cooking',        domain: 'nytimes.com',          from: '{nytdirect@nytimes.com OR cooking-recommendations@nytimes.com}', senderName: 'NYT Cooking', keywords: ['nyt', 'new york times', 'nytimes', 'cooking'] },
  { name: 'Serious Eats',       domain: 'seriouseats.com',       from: 'newsletters@seriouseats.com',          keywords: ['serious eats', 'seriouseats'] },
  { name: 'Bon Appétit',        domain: 'bonappetit.com',        from: 'newsletter@bonappetit.com',            keywords: ['bon appetit', 'bonappetit', 'bon appétit'] },
  { name: 'Food52',             domain: 'food52.com',            from: 'hello@food52.com',                     keywords: ['food52'] },
  { name: 'Half Baked Harvest', domain: 'halfbakedharvest.com',  from: 'newsletter@halfbakedharvest.com',      keywords: ['half baked harvest', 'halfbakedharvest'] },
  { name: 'Smitten Kitchen',    domain: 'smittenkitchen.com',    from: 'email@smittenkitchen.com',             keywords: ['smitten kitchen', 'smittenkitchen'] },
  { name: 'The Kitchn',         domain: 'thekitchn.com',         from: 'newsletter@thekitchn.com',             keywords: ['the kitchn', 'kitchn'] },
  { name: 'Epicurious',         domain: 'epicurious.com',        from: 'digest@epicurious.com',                keywords: ['epicurious'] },
  { name: 'Budget Bytes',       domain: 'budgetbytes.com',       from: 'hello@budgetbytes.com',                keywords: ['budget bytes', 'budgetbytes'] },
  { name: 'King Arthur Baking', domain: 'kingarthurbaking.com',  from: 'newsletter@kingarthurbaking.com',      keywords: ['king arthur', 'king arthur baking'] },
  { name: 'Simply Recipes',     domain: 'simplyrecipes.com',     from: 'newsletter@simplyrecipes.com',         keywords: ['simply recipes', 'simplyrecipes'] },
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

function extractBody(payload: Record<string, unknown>): string {
  if (payload.body && (payload.body as Record<string, unknown>).data) {
    return decodeBase64((payload.body as Record<string, string>).data)
  }
  if (payload.parts) {
    for (const part of payload.parts as Record<string, unknown>[]) {
      const text = extractBody(part)
      if (text) return text
    }
  }
  return ''
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

  // Fetch already-scanned gmail IDs to avoid duplicates
  const existing = await db.execute({
    sql: 'SELECT gmail_id FROM email_digests WHERE user_id = ?',
    args: [userId],
  })
  const seenIds = new Set(existing.rows.map(r => r.gmail_id as string))

  // Find the specific from address for this provider if we have it
  const provider = SUPPORTED_PROVIDERS.find(p => p.domain === domain)
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

    const body = extractBody(msgData.payload ?? {})
    const cleanText = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000)

    if (!cleanText || cleanText.length < 100) {
      // Still save the email, just with no recipes
      await db.execute({
        sql: `INSERT INTO email_digests (user_id, gmail_id, sender, subject, date, summary)
              VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        args: [userId, msg.id, from, subject, date, '[]'],
      })
      digests.push({ id: msg.id, gmail_id: msg.id, sender: from, subject, date, summary: [], saved: 0 })
      continue
    }

    const claudeRes = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
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

    let summary: { title: string; description: string }[] = []
    try {
      const raw = (claudeRes.content[0] as { text: string }).text
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) summary = JSON.parse(match[0])
    } catch { summary = [] }

    await db.execute({
      sql: `INSERT INTO email_digests (user_id, gmail_id, sender, subject, date, summary)
            VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
      args: [userId, msg.id, from, subject, date, JSON.stringify(summary)],
    })

    digests.push({ id: msg.id, gmail_id: msg.id, sender: from, subject, date, summary, saved: 0 })
  }

  return NextResponse.json({ digests, nextPageToken })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await db.execute({
    sql: 'SELECT * FROM email_digests WHERE user_id = ? ORDER BY date DESC',
    args: [userId],
  })

  return NextResponse.json(result.rows.map(r => ({
    id: String(r.id ?? ''),
    gmail_id: String(r.gmail_id ?? ''),
    sender: String(r.sender ?? ''),
    subject: String(r.subject ?? ''),
    date: String(r.date ?? ''),
    summary: JSON.parse((r.summary as string) || '[]'),
    saved: Number(r.saved ?? 0),
  })))
}
