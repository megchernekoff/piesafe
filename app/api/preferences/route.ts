import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await db.execute({ sql: 'SELECT * FROM profiles WHERE user_id = ?', args: [userId] })
  if (result.rows.length === 0) return NextResponse.json(null)

  const row = result.rows[0]
  return NextResponse.json({
    ...row,
    toddler_mode: row.toddler_mode === 1,
    dislikes: JSON.parse(row.dislikes as string),
    dietary_restrictions: JSON.parse(row.dietary_restrictions as string),
  })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { display_name, household_size, toddler_mode, toddler_age, dislikes, dietary_restrictions } = await req.json()

  await db.execute({
    sql: `INSERT INTO profiles (user_id, display_name, household_size, toddler_mode, toddler_age, dislikes, dietary_restrictions)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (user_id) DO UPDATE SET
            display_name         = excluded.display_name,
            household_size       = excluded.household_size,
            toddler_mode         = excluded.toddler_mode,
            toddler_age          = excluded.toddler_age,
            dislikes             = excluded.dislikes,
            dietary_restrictions = excluded.dietary_restrictions,
            updated_at           = datetime('now')`,
    args: [
      userId,
      display_name ?? null,
      household_size ?? 2,
      toddler_mode ? 1 : 0,
      toddler_age ?? null,
      JSON.stringify(dislikes ?? []),
      JSON.stringify(dietary_restrictions ?? []),
    ],
  })

  return NextResponse.json({ success: true })
}
