import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Delete in order: non-cascading tables first, then profiles (cascades to recipes + meal_plans)
  await db.batch([
    { sql: 'DELETE FROM meal_plan_days WHERE user_id = ?', args: [userId] },
    { sql: 'DELETE FROM email_digests WHERE user_id = ?', args: [userId] },
    { sql: 'DELETE FROM gmail_providers WHERE user_id = ?', args: [userId] },
    { sql: 'DELETE FROM gmail_tokens WHERE user_id = ?', args: [userId] },
    { sql: 'DELETE FROM profiles WHERE user_id = ?', args: [userId] },
  ])

  const clerk = await clerkClient()
  await clerk.users.deleteUser(userId)

  return NextResponse.json({ success: true })
}
