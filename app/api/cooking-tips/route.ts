import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    sql: 'INSERT INTO cooking_tips (user_id, tip, submitter) VALUES (?, ?, ?)',
    args: [userId, tip.trim(), submitter],
  })

  return NextResponse.json({ success: true })
}
