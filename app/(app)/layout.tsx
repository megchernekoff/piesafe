import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { db } from '@/lib/db'

async function getUnreadDigestCount(userId: string): Promise<number> {
  try {
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
    return Number(countResult.rows[0]?.count ?? 0)
  } catch { return 0 }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  const user = await currentUser()
  if (!user || !userId) redirect('/sign-in')

  const unreadDigests = await getUnreadDigestCount(userId)

  return (
    <div className="app-shell">
      <Sidebar unreadDigests={unreadDigests} />
      <main className="main-content">{children}</main>
    </div>
  )
}
