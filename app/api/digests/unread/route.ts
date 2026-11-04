import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Returns count of digests newer than the user's last_seen timestamp
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ count: 0 })

  const profileResult = await db.execute({
    sql: 'SELECT digests_last_seen FROM profiles WHERE user_id = ?',
    args: [userId],
  })

  const lastSeen = profileResult.rows[0]?.digests_last_seen as string | null

  const countResult = await db.execute({
    sql: lastSeen
      ? 'SELECT COUNT(*) as count FROM email_digests WHERE user_id = ? AND created_at > ?'
      : 'SELECT COUNT(*) as count FROM email_digests WHERE user_id = ?',
    args: lastSeen ? [userId, lastSeen] : [userId],
  })

  const count = Number(countResult.rows[0]?.count ?? 0)
  return NextResponse.json({ count })
}

// Called when user visits the newsletters page — marks all as seen
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.execute({
    sql: `UPDATE profiles SET digests_last_seen = datetime('now'), updated_at = datetime('now') WHERE user_id = ?`,
    args: [userId],
  })

  return NextResponse.json({ success: true })
}
