'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignUpButton, SignInButton, useAuth } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import PieIcon from '@/components/icons/PieIcon'
import LavenderSprig from '@/components/icons/LavenderSprig'

const DIETARY = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free']

interface Dinner {
  title: string
  description: string
  prep_time?: number
  cook_time?: number
  tags?: string[]
}

interface DayPlan {
  day: string
  dinner: Dinner
}

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace('/plan')
  }, [isLoaded, isSignedIn, router])

  const [dietary, setDietary] = useState<string[]>([])
  const [dislikeInput, setDislikeInput] = useState('')
  const [dislikes, setDislikes] = useState<string[]>([])
  const [nights, setNights] = useState(5)
  const [plan, setPlan] = useState<DayPlan[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)

  function toggleDietary(opt: string) {
    setDietary(d => d.includes(opt) ? d.filter(x => x !== opt) : [...d, opt])
  }

  function addDislike() {
    const val = dislikeInput.trim().toLowerCase()
    if (val && !dislikes.includes(val)) setDislikes(d => [...d, val])
    setDislikeInput('')
  }

  async function generate() {
    setLoading(true)
    setPlan(null)
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dietary, dislikes, nights }),
      })
      const data = await res.json()
      if (data.days) setPlan(data.days)
    } catch { /* ignore */ }
    setLoading(false)
  }

  if (!started) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--wheat)', overflow: 'hidden' }}>
        {/* Nav */}
        <nav style={{ padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieIcon size={24} />
            <span className="serif" style={{ fontSize: '1.6rem', fontWeight: 400, color: 'var(--ink)' }}>
              Pie <span style={{ color: 'var(--ochre)' }}>Safe</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <SignInButton mode="modal">
              <button className="btn-secondary" style={{ fontSize: '0.85rem' }}>Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-primary" style={{ fontSize: '0.85rem' }}>Sign up free</button>
            </SignUpButton>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ position: 'relative', background: 'linear-gradient(to bottom, var(--lavender-soft) 0%, var(--wheat) 100%)', padding: '5rem 2rem 4rem', textAlign: 'center' }}>
          <div style={{ position: 'absolute', left: '3%', top: '8%', transform: 'rotate(-15deg)', pointerEvents: 'none' }}>
            <LavenderSprig size={38} opacity={0.4} />
          </div>
          <div style={{ position: 'absolute', right: '3%', top: '8%', transform: 'rotate(15deg) scaleX(-1)', pointerEvents: 'none' }}>
            <LavenderSprig size={38} opacity={0.4} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}><PieIcon size={72} /></div>
          <h1 className="serif" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 300, lineHeight: 1, marginBottom: '1rem', color: 'var(--ink)' }}>
            Dinner,<br />sorted.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--ink-light)', lineHeight: 1.75, marginBottom: '0.5rem', maxWidth: '440px', margin: '0 auto 0.75rem' }}>
            Your AI meal planner — built around your household's tastes.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--lavender)', fontWeight: 600, marginBottom: '2.5rem' }}>
            See it in action — no account needed.
          </p>
          <button className="btn-primary" onClick={() => setStarted(true)}
            style={{ fontSize: '1.05rem', padding: '0.95rem 2.5rem', borderRadius: 10 }}>
            Build my sample meal plan →
          </button>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-light)', marginTop: '0.75rem', fontStyle: 'italic' }}>
            Takes 30 seconds · No sign-up required
          </p>
        </div>

        {/* Feature strip */}
        <div style={{ background: 'var(--lavender)', padding: '2.5rem 2rem', display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          {[
            { emoji: '📖', label: 'Recipe Box', desc: 'Save from any URL or photo' },
            { emoji: '🗓', label: 'Meal Planning', desc: 'AI-powered weekly dinners' },
            { emoji: '✉️', label: 'The Digest', desc: 'Recipes from your newsletters' },
          ].map(f => (
            <div key={f.label} style={{ textAlign: 'center', color: 'var(--parchment)', maxWidth: '160px' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{f.emoji}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', marginBottom: '0.2rem' }}>{f.label}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--wheat)' }}>
      <nav style={{ padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--stone-dark)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieIcon size={22} />
          <span className="serif" style={{ fontSize: '1.4rem', fontWeight: 400, color: 'var(--ink)' }}>
            Pie <span style={{ color: 'var(--ochre)' }}>Safe</span>
          </span>
        </div>
        <SignUpButton mode="modal">
          <button className="btn-primary" style={{ fontSize: '0.85rem' }}>Save this plan — sign up free</button>
        </SignUpButton>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {!plan && !loading && (
          <>
            <h2 className="serif" style={{ fontSize: '2.2rem', fontWeight: 300, marginBottom: '0.5rem' }}>
              Tell us a little about your household
            </h2>
            <p style={{ color: 'var(--ink-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              We'll build a real meal plan around your preferences — right now, no account needed.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '560px' }}>
              <div>
                <div className="section-label">Any dietary restrictions?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {DIETARY.map(opt => (
                    <button key={opt} type="button"
                      onClick={() => toggleDietary(opt)}
                      className={dietary.includes(opt) ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="section-label">Anything you&apos;d never want on the menu?</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                  <input className="input"
                    value={dislikeInput}
                    onChange={e => setDislikeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDislike() } }}
                    placeholder="e.g. cilantro, mushrooms…" style={{ flex: 1 }} />
                  <button type="button" className="btn-secondary" onClick={addDislike}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {dislikes.map(d => (
                    <span key={d} className="tag" style={{ cursor: 'pointer' }}
                      onClick={() => setDislikes(ds => ds.filter(x => x !== d))}>
                      {d} ×
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="section-label">How many nights?</div>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {[3, 4, 5, 6, 7].map(n => (
                    <button key={n} type="button"
                      onClick={() => setNights(n)}
                      className={nights === n ? 'btn-primary' : 'btn-secondary'}
                      style={{ minWidth: '44px', fontSize: '0.9rem', padding: '0.45rem 0.6rem' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn-primary" onClick={generate}
                style={{ fontSize: '1rem', padding: '0.9rem 2rem', alignSelf: 'flex-start' }}>
                Build my plan →
              </button>
            </div>
          </>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <PieIcon size={56} />
            <div className="serif" style={{ fontSize: '1.5rem', fontWeight: 300, margin: '1.5rem 0 0.5rem', color: 'var(--ink)' }}>
              Building your plan…
            </div>
            <p style={{ color: 'var(--ink-light)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              Picking meals{dietary.length ? ` that are ${dietary.join(' and ')}` : ''}{dislikes.length ? `, avoiding ${dislikes.join(', ')}` : ''}…
            </p>
            <Loader2 size={28} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--ochre)' }} />
          </div>
        )}

        {plan && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="serif" style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '0.25rem' }}>
                  Your {plan.length}-night plan
                </h2>
                <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Like what you see? Save it and unlock the full app.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={() => { setPlan(null); generate() }} style={{ fontSize: '0.85rem' }}>
                  ↺ Regenerate
                </button>
                <SignUpButton mode="modal">
                  <button className="btn-primary" style={{ fontSize: '0.85rem' }}>
                    Save this plan — sign up free →
                  </button>
                </SignUpButton>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              {plan.map((day, i) => (
                <div key={i} className="card" style={{ position: 'relative' }}>
                  <div className="day-label">{day.day}</div>
                  <div className="day-meal-title" style={{ marginTop: '0.4rem', marginBottom: '0.5rem' }}>{day.dinner.title}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', lineHeight: 1.5 }}>{day.dinner.description}</p>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {day.dinner.tags?.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                  {(day.dinner.prep_time || day.dinner.cook_time) && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--ink-light)' }}>
                      {(day.dinner.prep_time || 0) + (day.dinner.cook_time || 0)}m total
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--lavender-soft)', border: '1px solid var(--lavender)', borderRadius: 12, padding: '1.5rem 2rem', textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
              <div className="serif" style={{ fontSize: '1.4rem', fontWeight: 300, marginBottom: '0.5rem', color: 'var(--ink)' }}>
                Want to keep this plan?
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', marginBottom: '1.25rem', lineHeight: 1.65 }}>
                Sign up free to save your plan, get a grocery list, import recipes, and generate new plans anytime.
              </p>
              <SignUpButton mode="modal">
                <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2.25rem' }}>
                  Sign up free and save this plan →
                </button>
              </SignUpButton>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-light)', marginTop: '0.6rem' }}>
                Already have an account? <SignInButton mode="modal"><button style={{ background: 'none', border: 'none', color: 'var(--lavender)', cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline' }}>Sign in</button></SignInButton>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
