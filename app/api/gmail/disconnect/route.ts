import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.execute({ sql: 'DELETE FROM gmail_tokens WHERE user_id = ?', args: [userId] })
  await db.execute({ sql: 'DELETE FROM email_digests WHERE user_id = ?', args: [userId] })

  return NextResponse.json({ success: true })
}
