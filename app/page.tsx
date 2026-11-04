import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { BookOpen, Calendar, ShoppingCart } from 'lucide-react'

const FEATURES = [
  { icon: BookOpen,     title: 'Recipe Library',  desc: 'Save recipes and import any from a URL instantly.' },
  { icon: Calendar,     title: 'Weekly Planner',  desc: 'AI generates a 7-day dinner plan tailored to your household.' },
  { icon: ShoppingCart, title: 'Grocery List',    desc: 'Consolidated automatically from your meal plan.' },
]

export default async function LandingPage() {
  const { userId } = await auth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--wheat)' }}>
      <nav style={{ padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--stone-dark)' }}>
        <span className="serif" style={{ fontSize: '1.8rem', fontWeight: 300, color: 'var(--ink)' }}>
          Pie <span style={{ color: 'var(--ochre)' }}>Safe</span>
        </span>
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

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '7rem 2rem 4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 4.5rem)', fontWeight: 300, lineHeight: 1.1, marginBottom: '1.25rem' }}>
          Dinner, sorted.
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--ink-light)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
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
