import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const result = await db.execute(
    "SELECT tip, source, submitter FROM cooking_tips WHERE curated = 1 ORDER BY created_at ASC"
  )
  if (result.rows.length === 0) return NextResponse.json(null)

  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const row = result.rows[seed % result.rows.length]

  const source = row.source
    ? String(row.source)
    : row.submitter
    ? `Submitted by ${row.submitter}`
    : 'Pie Safe community'

  return NextResponse.json({ tip: row.tip, source })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tip } = await req.json()
  if (!tip?.trim()) return NextResponse.json({ error: 'Tip is required' }, { status: 400 })
  if (tip.trim().length > 300) return NextResponse.json({ error: 'Tip must be 300 characters or less' }, { status: 400 })

  const user = await currentUser()
  const firstName = user?.firstName ?? ''
  const lastInitial = user?.lastName ? user.lastName.charAt(0).toUpperCase() + '.' : ''
  const submitter = [firstName, lastInitial].filter(Boolean).join(' ') || 'Anonymous'

  await db.execute({
    sql: 'INSERT INTO cooking_tips (user_id, tip, submitter, curated) VALUES (?, ?, ?, 0)',
    args: [userId, tip.trim(), submitter],
  })

  return NextResponse.json({ success: true })
}
