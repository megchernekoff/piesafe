import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import PieIcon from '@/components/icons/PieIcon'
import LavenderSprig from '@/components/icons/LavenderSprig'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--wheat)', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieIcon size={24} />
          <span className="serif" style={{ fontSize: '1.6rem', fontWeight: 400, color: 'var(--ink)' }}>
            Pie <span style={{ color: 'var(--ochre)' }}>Safe</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <SignInButton mode="modal">
            <button className="btn-secondary" style={{ fontSize: '0.85rem' }}>Sign in</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn-primary" style={{ fontSize: '0.85rem' }}>Get started</button>
          </SignUpButton>
        </div>
      </nav>

      {/* Hero — lavender field */}
      <div style={{ background: 'linear-gradient(to bottom, var(--lavender-soft) 0%, var(--wheat) 100%)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* Lavender sprigs */}
        {[
          { left: '2%',  top: '5%',  size: 44, opacity: 0.5,  rotate: -18 },
          { left: '8%',  top: '30%', size: 32, opacity: 0.3,  rotate: -8  },
          { left: '14%', top: '60%', size: 26, opacity: 0.2,  rotate: -22 },
          { right: '2%',  top: '5%',  size: 44, opacity: 0.5, rotate: 18, flipX: true },
          { right: '8%',  top: '30%', size: 32, opacity: 0.3, rotate: 8,  flipX: true },
          { right: '14%', top: '60%', size: 26, opacity: 0.2, rotate: 22, flipX: true },
        ].map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: s.left,
            right: (s as {right?: string}).right,
            top: s.top,
            transform: `rotate(${s.rotate}deg)${(s as {flipX?: boolean}).flipX ? ' scaleX(-1)' : ''}`,
            pointerEvents: 'none',
          }}>
            <LavenderSprig size={s.size} opacity={s.opacity} />
          </div>
        ))}

        {/* Pie centred over headline */}
        <div style={{ marginBottom: '1rem' }}>
          <PieIcon size={80} />
        </div>

        <h1 className="serif" style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', fontWeight: 300, lineHeight: 1, marginBottom: '1.25rem', color: 'var(--ink)' }}>
          Dinner,<br />sorted.
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--ink-light)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '440px', fontStyle: 'italic' }}>
          A personal recipe box and AI meal planner built around your household&apos;s tastes.
        </p>

        <SignUpButton mode="modal">
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem', borderRadius: 10 }}>
            Start for free
          </button>
        </SignUpButton>
      </div>

      {/* Feature strip */}
      <div style={{ background: 'var(--lavender)', padding: '3rem 2rem', display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
        {[
          { emoji: '📖', label: 'Recipe Box',    desc: 'Save from any URL or photo' },
          { emoji: '🗓',  label: 'Meal Planning', desc: 'AI-powered weekly dinners' },
          { emoji: '✉️', label: 'The Digest',    desc: 'Recipes from your newsletters' },
        ].map(f => (
          <div key={f.label} style={{ textAlign: 'center', color: 'var(--parchment)', maxWidth: '180px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.emoji}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.25rem' }}>{f.label}</div>
            <div style={{ fontSize: '0.82rem', opacity: 0.75, lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
