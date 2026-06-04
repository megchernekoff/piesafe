import { initializeSchema } from '@/lib/db'
import { NextResponse } from 'next/server'

// POST /api/setup — run once after first deploy to create DB tables.
// Safe to call repeatedly (CREATE TABLE IF NOT EXISTS).
export async function POST() {
  try {
    await initializeSchema()
    return NextResponse.json({ success: true, message: 'Schema initialized' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
