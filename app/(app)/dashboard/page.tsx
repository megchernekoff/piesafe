import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Mail, ChevronRight, Clock } from 'lucide-react'
import { db } from '@/lib/db'
import LavenderSprig from '@/components/icons/LavenderSprig'
import ExtensionBanner from '@/components/ExtensionBanner'

function timeGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const profileResult = await db.execute({
    sql: 'SELECT user_id, digests_last_seen FROM profiles WHERE user_id = ?',
    args: [userId],
  })
  if (profileResult.rows.length === 0) redirect('/onboarding')

  const user = await currentUser()
  const name = user?.firstName ?? null
  const lastSeen = profileResult.rows[0]?.digests_last_seen as string | null

  // Fetch everything in parallel
  const [unreadResult, planResult, recipesResult] = await Promise.all([
    db.execute({
      sql: lastSeen
        ? 'SELECT COUNT(*) as count FROM email_digests WHERE user_id = ? AND created_at > ? AND saved = 0 AND dismissed = 0'
        : 'SELECT COUNT(*) as count FROM email_digests WHERE user_id = ? AND saved = 0 AND dismissed = 0',
      args: lastSeen ? [userId, lastSeen] : [userId],
    }),
    db.execute({
      sql: 'SELECT id FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      args: [userId],
    }),
    db.execute({
      sql: 'SELECT title, description, tags, prep_time, cook_time FROM recipes WHERE user_id = ? ORDER BY created_at DESC LIMIT 4',
      args: [userId],
    }),
  ])

  const unreadDigests = Number(unreadResult.rows[0]?.count ?? 0)
  const hasPlan = planResult.rows.length > 0

  // Load today's dinner if plan exists
  let todayDinner: { title: string; description: string; tags: string[] } | null = null
  if (hasPlan) {
    const planId = planResult.rows[0].id as string
    const today = new Date()
    // Map day of week to day_number (Mon=1 ... Sun=7), use day 1 as fallback
    const dow = today.getDay()
    const dayNum = dow === 0 ? 7 : dow
    const dayResult = await db.execute({
      sql: 'SELECT dinner FROM meal_plan_days WHERE plan_id = ? AND day_number = ?',
      args: [planId, dayNum],
    })
    if (dayResult.rows.length > 0) {
      try {
        const d = JSON.parse(dayResult.rows[0].dinner as string)
        if (d.title) todayDinner = { title: d.title, description: d.description, tags: d.tags ?? [] }
      } catch { /* ignore */ }
    }
  }

  const recentRecipes = recipesResult.rows.map(r => ({
    title: r.title as string,
    description: r.description as string,
    tags: JSON.parse((r.tags as string) || '[]') as string[],
    prep_time: r.prep_time as number | null,
    cook_time: r.cook_time as number | null,
  }))

  return (
    <div style={{ maxWidth: '760px' }}>

      {/* Greeting */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, transform: 'rotate(8deg)', pointerEvents: 'none' }}>
          <LavenderSprig size={28} opacity={0.18} />
        </div>
        <h1 className="page-title">
          {timeGreeting()}{name ? `, ${name}` : ''}
        </h1>
        <p className="page-subtitle">Here&apos;s where things stand</p>
      </div>

      <ExtensionBanner />

      {/* Digest alert */}
      {unreadDigests > 0 && (
        <Link href="/digest" style={{ textDecoration: 'none', display: 'block', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--lavender-soft)', border: '1px solid var(--lavender)', borderRadius: 10, padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mail size={15} style={{ color: 'var(--lavender)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--ink)', flex: 1 }}>
              <strong>{unreadDigests} new newsletter{unreadDigests > 1 ? 's' : ''}</strong> in your Digest
            </span>
            <ChevronRight size={15} style={{ color: 'var(--lavender)', opacity: 0.6 }} />
          </div>
        </Link>
      )}

      {/* Tonight's dinner */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-label" style={{ marginBottom: '0.6rem' }}>Tonight</div>
        {todayDinner ? (
          <Link href="/plan" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h3 className="serif" style={{ fontSize: '1.4rem', fontWeight: 300, marginBottom: '0.3rem' }}>{todayDinner.title}</h3>
                {todayDinner.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', lineHeight: 1.55 }}>{todayDinner.description}</p>
                )}
                <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {todayDinner.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--ochre)', flexShrink: 0, marginTop: '0.25rem' }} />
            </div>
          </Link>
        ) : (
          <Link href="/plan" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', fontStyle: 'italic' }}>
                  No plan yet — generate this week&apos;s dinners in about 30 seconds.
                </p>
              </div>
              <button className="btn-primary" style={{ fontSize: '0.82rem', flexShrink: 0 }}>Generate plan →</button>
            </div>
          </Link>
        )}
      </div>

      {/* Recent recipes */}
      {recentRecipes.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div className="section-label">Recently saved</div>
            <Link href="/recipes" style={{ fontSize: '0.78rem', color: 'var(--lavender)', textDecoration: 'none' }}>See all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {recentRecipes.map((r, i) => (
              <Link key={i} href="/recipes" style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', padding: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', lineHeight: 1.3 }}>{r.title}</div>
                  {r.description && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-light)', lineHeight: 1.45, marginBottom: '0.5rem' }}>
                      {r.description.slice(0, 70)}{r.description.length > 70 ? '…' : ''}
                    </div>
                  )}
                  {(r.prep_time || r.cook_time) && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-light)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={10} />
                      {(r.prep_time || 0) + (r.cook_time || 0)}m
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for new users with no recipes */}
      {recentRecipes.length === 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="section-label" style={{ marginBottom: '0.6rem' }}>Your recipe box</div>
          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', lineHeight: 1.6 }}>
                Save recipes from any website, upload a photo of a cookbook page, or describe what you want and let Claude create one.
              </p>
            </div>
            <Link href="/recipes" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <button className="btn-secondary" style={{ fontSize: '0.82rem' }}>Add recipes →</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
