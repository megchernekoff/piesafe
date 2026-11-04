import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const userId = searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/recipes?gmail=error`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/gmail/callback`,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()
  if (!tokens.access_token) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/recipes?gmail=error`)
  }

  // Get the user's Gmail address
  const profileRes = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const profile = await profileRes.json()
  const email = profile.emailAddress ?? null

  const expiry = Date.now() + (tokens.expires_in ?? 3600) * 1000

  await db.execute({
    sql: `INSERT INTO gmail_tokens (user_id, access_token, refresh_token, expiry, email)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT (user_id) DO UPDATE SET
            access_token  = excluded.access_token,
            refresh_token = CASE WHEN excluded.refresh_token != '' THEN excluded.refresh_token ELSE refresh_token END,
            expiry        = excluded.expiry,
            email         = excluded.email,
            updated_at    = datetime('now')`,
    args: [userId, tokens.access_token, tokens.refresh_token ?? '', expiry, email],
  })

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/recipes?gmail=connected`)
}
