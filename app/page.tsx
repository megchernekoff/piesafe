import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { BookOpen, Calendar, ShoppingCart } from 'lucide-react'
import PieIcon from '@/components/icons/PieIcon'
import LavenderSprig from '@/components/icons/LavenderSprig'

const FEATURES = [
  { icon: BookOpen,     title: 'Recipe Library',  desc: 'Save recipes and import any from a URL instantly.' },
  { icon: Calendar,     title: 'Weekly Planner',  desc: 'AI generates a dinner plan tailored to your household.' },
  { icon: ShoppingCart, title: 'Grocery List',    desc: 'Consolidated automatically from your meal plan.' },
]

export default async function LandingPage() {
  const { userId } = await auth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--wheat)', overflow: 'hidden' }}>
      <nav style={{ padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--stone-dark)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <PieIcon size={28} />
          <span className="serif" style={{ fontSize: '1.8rem', fontWeight: 400, color: 'var(--ink)' }}>
            Pie <span style={{ color: 'var(--ochre)' }}>Safe</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {userId ? (
            <Link href="/dashboard">
              <button className="btn-primary">Go to app</button>
            </Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="btn-secondary">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary">Get started</button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative' }}>
        {/* Lavender sprigs — decorative */}
        <div style={{ position: 'absolute', left: '-10px', top: '20px', transform: 'rotate(-15deg)', pointerEvents: 'none' }}>
          <LavenderSprig size={36} opacity={0.35} />
        </div>
        <div style={{ position: 'absolute', left: '60px', top: '60px', transform: 'rotate(-8deg)', pointerEvents: 'none' }}>
          <LavenderSprig size={28} opacity={0.2} />
        </div>
        <div style={{ position: 'absolute', right: '-10px', top: '10px', transform: 'rotate(18deg) scaleX(-1)', pointerEvents: 'none' }}>
          <LavenderSprig size={40} opacity={0.35} />
        </div>
        <div style={{ position: 'absolute', right: '65px', top: '70px', transform: 'rotate(10deg) scaleX(-1)', pointerEvents: 'none' }}>
          <LavenderSprig size={26} opacity={0.2} />
        </div>

        <main style={{ maxWidth: '640px', margin: '0 auto', padding: '6rem 2rem 4rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <PieIcon size={72} />
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', fontWeight: 300, lineHeight: 1.05, marginBottom: '1.25rem', color: 'var(--ink)' }}>
            Dinner,<br />sorted.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--ink-light)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            Your personal recipe library and AI-powered weekly meal planner — built around your household&apos;s tastes.
          </p>
          {userId ? (
            <Link href="/dashboard">
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2.25rem' }}>
                Go to your kitchen
              </button>
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2.25rem' }}>
                Start planning for free
              </button>
            </SignUpButton>
          )}
        </main>
      </div>

      {/* Feature cards */}
      <section style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 2rem 6rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card">
            <Icon size={20} style={{ color: 'var(--ochre)', marginBottom: '0.75rem' }} />
            <h3 style={{ marginBottom: '0.4rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', lineHeight: 1.65 }}>{desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
