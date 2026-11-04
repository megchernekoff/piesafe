import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { gmailId } = await req.json()

  await db.execute({
    sql: 'DELETE FROM email_digests WHERE gmail_id = ? AND user_id = ?',
    args: [gmailId, userId],
  })

  return NextResponse.json({ success: true })
}
