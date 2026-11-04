import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'

const anthropic = new Anthropic()

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

async function refreshToken(userId: string, refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) return null
  const expiry = Date.now() + (data.expires_in ?? 3600) * 1000
  await db.execute({
    sql: 'UPDATE gmail_tokens SET access_token = ?, expiry = ?, updated_at = datetime(\'now\') WHERE user_id = ?',
    args: [data.access_token, expiry, userId],
  })
  return data.access_token as string
}

export async function POST(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const after = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)

  // Get all users with Gmail connected and saved providers
  const tokensResult = await db.execute('SELECT * FROM gmail_tokens')
  let totalNew = 0

  for (const tokenRow of tokensResult.rows) {
    const userId = tokenRow.user_id as string
    let accessToken = tokenRow.access_token as string
    const expiry = tokenRow.expiry as number

    // Refresh if needed
    if (Date.now() > expiry - 60000) {
      const fresh = await refreshToken(userId, tokenRow.refresh_token as string)
      if (!fresh) continue
      accessToken = fresh
    }

    // Get this user's saved providers
    const providersResult = await db.execute({
      sql: 'SELECT domain, name FROM gmail_providers WHERE user_id = ?',
      args: [userId],
    })

    // Get already-seen IDs
    const seenResult = await db.execute({
      sql: 'SELECT gmail_id FROM email_digests WHERE user_id = ?',
      args: [userId],
    })
    const seenIds = new Set(seenResult.rows.map(r => r.gmail_id as string))

    for (const provider of providersResult.rows) {
      const domain = provider.domain as string
      const name = provider.name as string
      const query = `from:${domain} after:${after}`

      try {
        const searchRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=5`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const searchData = await searchRes.json()
        const messages: { id: string }[] = (searchData.messages ?? []).filter((m: { id: string }) => !seenIds.has(m.id))

        for (const msg of messages) {
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          const msgData = await msgRes.json()
          const headers: { name: string; value: string }[] = msgData.payload?.headers ?? []
          const subject = headers.find(h => h.name === 'Subject')?.value ?? '(no subject)'
          const from = headers.find(h => h.name === 'From')?.value ?? name
          const date = headers.find(h => h.name === 'Date')?.value ?? new Date().toISOString()

          const body = extractBody(msgData.payload ?? {})
          const cleanText = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000)

          let summary: { title: string; description: string }[] = []
          if (cleanText.length >= 100) {
            const claudeRes = await anthropic.messages.create({
              model: 'claude-sonnet-4-6',
              max_tokens: 512,
              messages: [{
                role: 'user',
                content: `Extract recipes from this newsletter. Return JSON array: [{"title":"...","description":"..."}] or []. Subject: ${subject}\n\n${cleanText}`,
              }],
            })
            try {
              const raw = (claudeRes.content[0] as { text: string }).text
              const match = raw.match(/\[[\s\S]*\]/)
              if (match) summary = JSON.parse(match[0])
            } catch { summary = [] }
          }

          await db.execute({
            sql: `INSERT INTO email_digests (user_id, gmail_id, sender, subject, date, summary)
                  VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
            args: [userId, msg.id, from, subject, date, JSON.stringify(summary)],
          })
          seenIds.add(msg.id)
          totalNew++
        }
      } catch (e) {
        console.error(`Cron scan failed for user ${userId} domain ${domain}:`, e)
      }
    }
  }

  console.log(`Weekly cron: scanned ${tokensResult.rows.length} users, found ${totalNew} new emails`)
  return NextResponse.json({ success: true, users: tokensResult.rows.length, newEmails: totalNew })
}
