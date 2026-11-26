import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tip } = await req.json()
  if (!tip?.trim()) return NextResponse.json({ error: 'Tip is required' }, { status: 400 })
  if (tip.trim().length > 300) return NextResponse.json({ error: 'Tip must be 300 characters or less' }, { status: 400 })

  await db.execute({
    sql: 'INSERT INTO cooking_tips (user_id, tip) VALUES (?, ?)',
    args: [userId, tip.trim()],
  })

  return NextResponse.json({ success: true })
}
