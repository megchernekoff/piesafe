'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

interface TargetRect { top: number; left: number; width: number; height: number }

const STEPS = [
  {
    tourId: 'recipes',
    page: '/recipes',
    title: 'Start with your Recipe Box',
    body: 'Save the recipes you love — paste a URL, upload a photo, or just describe a dish and we\'ll write the full recipe for you.\n\nTo welcome you, we\'ve added a personal recipe from the creator straight to your Recipe Box.',
    hasGift: true,
  },
  {
    tourId: 'plan',
    page: '/plan',
    title: 'Plan your whole week',
    body: 'Once you\'ve saved some favorites, hit Generate and we\'ll build a full week of dinners around your household\'s tastes and preferences.\n\nNo recipes yet? No problem — your meal plan will discover new ones, and anything you love gets added to your Recipe Box automatically.',
    hasGift: false,
  },
  {
    tourId: 'digest',
    page: '/digest',
    title: 'Your inbox, curated',
    body: 'Connect your Gmail and we\'ll scan the food newsletters you already subscribe to — NYT Cooking, Bon Appétit, Smitten Kitchen, and more.\n\nSave what catches your eye straight to your Recipe Box.',
    hasGift: false,
  },
]

const GIFT_RECIPE = {
  title: 'Welcome Gift Recipe',
  description: 'A personal recipe from the Pie Safe creator — full details coming soon.',
  ingredients: [],
  instructions: [],
  tags: ['gift', 'from the creator'],
}

export default function GuidedTour() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState<TargetRect | null>(null)

  const findTarget = useCallback((tourId: string) => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${tourId}"]`)
    if (!el) { setRect(null); return }
    const r = el.getBoundingClientRect()
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('tour-complete')) {
      setVisible(true)
      router.push(STEPS[0].page)
      if (!localStorage.getItem('tour-gift-sent')) {
        fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(GIFT_RECIPE),
        }).then(() => localStorage.setItem('tour-gift-sent', '1')).catch(() => {})
      }
    }
  }, [router])

  useEffect(() => {
    if (!visible) return
    const run = () => findTarget(STEPS[step].tourId)
    const id = setTimeout(run, 120)
    return () => clearTimeout(id)
  }, [step, visible, findTarget])

  function goTo(n: number) {
    setStep(n)
    router.push(STEPS[n].page)
  }

  function complete() {
    localStorage.setItem('tour-complete', '1')
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const cardStyle: React.CSSProperties = rect && !isMobile ? {
    position: 'fixed',
    top: Math.min(Math.max(rect.top + rect.height / 2 - 200, 16), (window.innerHeight) - 460),
    left: rect.left + rect.width + 20,
    width: 360,
    zIndex: 1001,
  } : {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(92vw, 380px)',
    zIndex: 1001,
  }

  return (
    <>
      {/* Spotlight via box-shadow on a positioned frame */}
      {rect && !isMobile ? (
        <div style={{
          position: 'fixed',
          top: rect.top - 5,
          left: rect.left - 5,
          width: rect.width + 10,
          height: rect.height + 10,
          borderRadius: 10,
          boxShadow: '0 0 0 9999px rgba(42,30,16,0.62)',
          border: '1.5px solid var(--ochre)',
          zIndex: 1000,
          pointerEvents: 'none',
          transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
        }} />
      ) : (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(42,30,16,0.62)',
          backdropFilter: 'blur(2px)',
          zIndex: 1000,
        }} onClick={complete} />
      )}

      {/* Card */}
      <div style={cardStyle}>
        {/* Left arrow toward sidebar (desktop) */}
        {rect && !isMobile && (
          <div style={{
            position: 'absolute',
            left: -11,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0, height: 0,
            borderTop: '11px solid transparent',
            borderBottom: '11px solid transparent',
            borderRight: '11px solid var(--parchment)',
            zIndex: 2,
          }} />
        )}

        <div style={{
          background: 'var(--parchment)',
          borderRadius: 14,
          padding: '1.75rem',
          boxShadow: '0 24px 64px rgba(42,30,16,0.32)',
          border: '1px solid rgba(200,145,26,0.25)',
          position: 'relative',
        }}>
          <button onClick={complete} style={{
            position: 'absolute', top: '0.9rem', right: '0.9rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-light)', padding: '0.2rem', lineHeight: 1,
          }}>
            <X size={14} />
          </button>

          <div style={{
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--ochre)', marginBottom: '0.35rem',
          }}>
            Step {step + 1} of {STEPS.length}
          </div>

          <h2 className="serif" style={{
            fontSize: '1.4rem', fontWeight: 300, lineHeight: 1.2,
            color: 'var(--ink)', marginBottom: '0.85rem',
          }}>
            {current.title}
          </h2>

          <p style={{
            fontSize: '0.875rem', color: 'var(--ink-light)',
            lineHeight: 1.75, whiteSpace: 'pre-line',
            marginBottom: current.hasGift ? '1rem' : '1.25rem',
          }}>
            {current.body}
          </p>

          {current.hasGift && (
            <div style={{
              background: 'linear-gradient(135deg, #fdf0d5 0%, #f5e0a8 100%)',
              border: '1px solid var(--ochre)',
              borderRadius: 10,
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🎁</span>
              <div>
                <div style={{
                  fontSize: '0.67rem', fontWeight: 700, color: 'var(--ochre)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.15rem',
                }}>
                  Welcome Gift · From the creator
                </div>
                <div className="serif" style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>
                  {GIFT_RECIPE.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--ink-light)', fontStyle: 'italic', marginTop: '0.1rem' }}>
                  {GIFT_RECIPE.description}
                </div>
              </div>
            </div>
          )}

          {/* Step dots */}
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', marginBottom: '1.1rem' }}>
            {STEPS.map((_, i) => (
              <div key={i} onClick={() => i < step ? goTo(i) : undefined} style={{
                width: i === step ? 20 : 6, height: 6,
                borderRadius: 3,
                background: i === step ? 'var(--ochre)' : i < step ? 'var(--driftwood)' : 'var(--stone-dark)',
                transition: 'width 0.2s ease, background 0.2s ease',
                cursor: i < step ? 'pointer' : 'default',
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {step > 0 && (
              <button onClick={() => goTo(step - 1)} className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.6rem 1rem' }}>
                ← Back
              </button>
            )}
            <button onClick={isLast ? complete : () => goTo(step + 1)} className="btn-primary"
              style={{ flex: 1, fontSize: '0.875rem', padding: '0.65rem' }}>
              {isLast ? 'Start cooking 🥧' : 'Next →'}
            </button>
          </div>

          <button onClick={complete} style={{
            display: 'block', width: '100%', marginTop: '0.65rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-light)', fontSize: '0.75rem', textAlign: 'center',
          }}>
            Skip tour
          </button>
        </div>
      </div>
    </>
  )
}
