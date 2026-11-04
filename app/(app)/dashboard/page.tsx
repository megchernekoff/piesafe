import { auth } from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Calendar, ShoppingCart } from 'lucide-react'
import { db } from '@/lib/db'
import LavenderSprig from '@/components/icons/LavenderSprig'
import PieIcon from '@/components/icons/PieIcon'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const profileResult = await db.execute({
    sql: 'SELECT user_id FROM profiles WHERE user_id = ?',
    args: [userId],
  })
  if (profileResult.rows.length === 0) redirect('/onboarding')

  const user = await currentUser()
  const name = user?.firstName ?? 'there'

  return (
    <div>
      <div className="page-header" style={{ position: 'relative' }}>
        {/* Decorative lavender */}
        <div style={{ position: 'absolute', right: '2rem', top: '-1rem', transform: 'rotate(8deg)', pointerEvents: 'none' }}>
          <LavenderSprig size={30} opacity={0.2} />
        </div>
        <div style={{ position: 'absolute', right: '5rem', top: '0.5rem', transform: 'rotate(14deg)', pointerEvents: 'none' }}>
          <LavenderSprig size={22} opacity={0.12} />
        </div>
        <h1 className="page-title">Hi, {name}</h1>
        <p className="page-subtitle">What are you cooking this week?</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', maxWidth: '700px' }}>
        <Link href="/recipes" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <BookOpen size={20} style={{ color: 'var(--ochre)', marginBottom: '0.75rem' }} />
            <h3>Recipe Box</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>Browse and save recipes</p>
          </div>
        </Link>
        <Link href="/plan" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <Calendar size={20} style={{ color: 'var(--ochre)', marginBottom: '0.75rem' }} />
            <h3>Meal Plan</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>Generate this week&apos;s dinners</p>
          </div>
        </Link>
        <Link href="/plan" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <ShoppingCart size={20} style={{ color: 'var(--ochre)', marginBottom: '0.75rem' }} />
            <h3>Grocery List</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>This week&apos;s shopping list</p>
          </div>
        </Link>
      </div>

      {/* Pie illustration at the bottom */}
      <div style={{ marginTop: '4rem', display: 'flex', alignItems: 'center', gap: '1.5rem', opacity: 0.15, pointerEvents: 'none' }}>
        <PieIcon size={56} />
        <LavenderSprig size={28} />
        <LavenderSprig size={22} />
      </div>
    </div>
  )
}
