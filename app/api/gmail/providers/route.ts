import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await db.execute({
    sql: 'SELECT domain, name, next_page_token FROM gmail_providers WHERE user_id = ? ORDER BY created_at ASC',
    args: [userId],
  })

  return NextResponse.json(result.rows.map(r => ({
    domain: String(r.domain),
    name: String(r.name),
    nextPageToken: r.next_page_token ? String(r.next_page_token) : '',
  })))
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { domain, name } = await req.json()

  await db.execute({
    sql: `INSERT INTO gmail_providers (user_id, domain, name)
          VALUES (?, ?, ?)
          ON CONFLICT (user_id, domain) DO NOTHING`,
    args: [userId, domain, name],
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const domain = new URL(req.url).searchParams.get('domain')
  if (!domain) return NextResponse.json({ error: 'domain required' }, { status: 400 })

  await db.execute({
    sql: 'DELETE FROM gmail_providers WHERE user_id = ? AND domain = ?',
    args: [userId, domain],
  })

  return NextResponse.json({ success: true })
}
