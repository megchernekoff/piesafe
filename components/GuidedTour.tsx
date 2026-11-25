'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { X } from 'lucide-react'
import PieIcon from '@/components/icons/PieIcon'

type Arrow = 'left' | 'above' | 'below'
interface TargetRect { top: number; left: number; width: number; height: number }

const STEPS: {
  tourId: string
  page: string
  arrow: Arrow
  title: string
  body: string
  hasGift?: boolean
  switchTab?: string
  cta?: { label: string; href: string }
}[] = [
  {
    tourId: 'recipes',
    page: '/recipes',
    arrow: 'left',
    title: 'Your Recipe Box',
    body: 'This is your Recipe Box — the home for every recipe in your collection. Anything you save, import, or create lives here, ready to pull into a meal plan whenever you need it.\n\nWe\'ve added a welcome recipe from the creator to get you started.',
    hasGift: true,
  },
  {
    tourId: 'import-url',
    page: '/recipes',
    arrow: 'below',
    switchTab: 'url',
    title: 'Save from any website',
    body: 'Paste a link from any recipe site — NYT Cooking, Serious Eats, a food blog, anywhere. We\'ll pull the full recipe instantly.',
  },
  {
    tourId: 'import-photo',
    page: '/recipes',
    arrow: 'below',
    switchTab: 'photo',
    title: 'Upload a photo',
    body: 'Have a recipe in a cookbook, on a card, or in a screenshot? Upload a photo and we\'ll read it and save the full recipe for you.',
  },
  {
    tourId: 'import-prompt',
    page: '/recipes',
    arrow: 'below',
    switchTab: 'prompt',
    title: 'Describe any dish',
    body: 'Type something like "quick weeknight pasta with lemon and ricotta" and we\'ll write a full recipe — ingredients, steps, timing, all of it.',
  },
  {
    tourId: 'extension-banner',
    page: '/recipes',
    arrow: 'above',
    title: 'Save from anywhere with one click',
    body: 'Install the Pie Safe Chrome extension and a "Save to Pie Safe" option appears on any page. Right-click any recipe and it\'s in your box instantly — no copy-pasting needed.',
    cta: { label: 'Add to Chrome — it\'s free', href: 'https://chromewebstore.google.com/detail/pie-safe/gmlfjbhjimpojkadhckonigmlappjjmb' },
  },
  {
    tourId: 'plan',
    page: '/plan',
    arrow: 'left',
    title: 'Build your whole week',
    body: 'Generate a full week of dinners built around your household\'s tastes. Hit Generate and you\'ll have a plan in seconds.',
  },
  {
    tourId: 'pin-search',
    page: '/plan',
    arrow: 'below',
    title: 'Pin recipes you already love',
    body: 'Search your Recipe Box and pin any recipe you want in this week\'s plan. It\'ll definitely appear — the rest of the week fills in around it.',
  },
  {
    tourId: 'plan-tweaks',
    page: '/plan',
    arrow: 'above',
    title: 'Tell us what you need',
    body: 'Type anything: "nothing too heavy this week", "use up the pork in the fridge", "one vegetarian night". Your plan adapts around it.',
  },
  {
    tourId: 'digest',
    page: '/digest',
    arrow: 'left',
    title: 'Your inbox, curated',
    body: 'Connect your Gmail and we\'ll scan the food newsletters you subscribe to — NYT Cooking, Bon Appétit, Smitten Kitchen, and more.\n\nSave what catches your eye straight to your Recipe Box.',
  },
]

const GIFT_RECIPE = {
  title: 'Orange Glazed Chicken Breast',
  description: 'A favorite of the Pie Safe founder. Serve over rice — double the glaze if you want extra sauce.',
  ingredients: [
    '4 chicken breast halves (bone in, skin on)',
    '1/2 tsp salt',
    '1/4 cup butter',
    '2 tbsp flour',
    '2 tbsp sugar',
    '1/4 tsp dry ground mustard',
    '1/4 tsp cinnamon',
    '1/16 tsp ginger',
    '1 1/2 cups orange juice',
  ],
  instructions: [
    'Sprinkle chicken with salt and brown lightly in butter. Remove chicken from pan.',
    'Stir flour, sugar, and spices into the pan drippings.',
    'Gradually add orange juice, stirring until bubbling and thickened.',
    'Add chicken breasts back to the pan. Reduce heat, cover, and cook until done — about 1 to 1.5 hours on the stovetop or 1 hour in a 350°F oven.',
    'Serve over rice. Double the glaze (flour, sugar, spices, and orange juice) if you want extra sauce.',
  ],
  prep_time: 10,
  cook_time: 75,
  servings: 4,
  tags: ['chicken', 'gift', 'from the founder'],
}

const CARD_W = 340

export default function GuidedTour() {
  const router = useRouter()
  const { userId } = useAuth()
  const [phase, setPhase] = useState<'welcome' | 'touring'>('welcome')
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState<TargetRect | null>(null)

  const findTarget = useCallback((tourId: string, retries = 6) => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${tourId}"]`)
    if (!el) {
      if (retries > 0) setTimeout(() => findTarget(tourId, retries - 1), 250)
      else setRect(null)
      return
    }
    const r = el.getBoundingClientRect()
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [])

  useEffect(() => {
    if (!userId) return
    if (localStorage.getItem(`tour-complete-${userId}`)) return

    // Check the DB before showing the tour — if the user already has recipes
    // they're established (e.g. reinstalled the PWA, which wipes localStorage).
    fetch('/api/recipes')
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(`tour-complete-${userId}`, '1')
          return
        }
        setVisible(true)
        if (!localStorage.getItem(`tour-gift-sent-${userId}`)) {
          fetch('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(GIFT_RECIPE),
          }).then(() => localStorage.setItem(`tour-gift-sent-${userId}`, '1')).catch(() => {})
        }
      })
      .catch(() => {})
  }, [userId])

  useEffect(() => {
    if (!visible || phase !== 'touring') return
    setRect(null)
    findTarget(STEPS[step].tourId)
  }, [step, visible, phase, findTarget])

  function startTour() {
    setPhase('touring')
    router.push(STEPS[0].page)
  }

  function goTo(n: number) {
    const changing = phase === 'touring' && STEPS[n].page !== STEPS[step].page
    setStep(n)
    if (changing) router.push(STEPS[n].page)
  }

  function complete() {
    if (userId) localStorage.setItem(`tour-complete-${userId}`, '1')
    setVisible(false)
    router.push('/dashboard')
  }

  if (!visible) return null

  if (phase === 'welcome') {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(42,30,16,0.65)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}>
        <div style={{
          background: 'var(--parchment)', borderRadius: 18,
          padding: '2.5rem 2.25rem', textAlign: 'center',
          maxWidth: 420, width: '100%',
          boxShadow: '0 24px 64px rgba(42,30,16,0.35)',
          border: '1px solid rgba(200,145,26,0.25)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <PieIcon size={52} />
          </div>
          <h2 className="serif" style={{ fontSize: '1.9rem', fontWeight: 300, lineHeight: 1.15, marginBottom: '0.85rem' }}>
            Welcome to Pie Safe
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', lineHeight: 1.75, marginBottom: '2rem' }}>
            Your personal recipe box and meal planner — one place for every recipe, every week, and every dinner question answered.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={startTour}
              style={{ fontSize: '0.95rem', padding: '0.8rem' }}>
              Take a quick tour →
            </button>
            <button onClick={complete} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink-light)', fontSize: '0.78rem', padding: '0.4rem',
            }}>
              Skip, I&apos;ll explore on my own
            </button>
          </div>
        </div>
      </div>
    )
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  // Card positioning
  let cardTop = vh / 2
  let cardLeft = vw / 2
  let transform = 'translate(-50%, -50%)'
  let arrowEl: React.ReactNode = null

  if (rect && !isMobile) {
    const PAD = 18
    const arrowSize = 10

    if (current.arrow === 'left') {
      // Tooltip to the right of target
      cardLeft = rect.left + rect.width + PAD + arrowSize
      cardTop = Math.min(Math.max(rect.top + rect.height / 2, 160), vh - 160)
      transform = 'translateY(-50%)'
      arrowEl = (
        <div style={{
          position: 'absolute', left: -arrowSize, top: '50%',
          transform: 'translateY(-50%)',
          width: 0, height: 0,
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid var(--parchment)`,
        }} />
      )
    } else if (current.arrow === 'below') {
      // Tooltip below target
      cardTop = rect.top + rect.height + PAD + arrowSize
      cardLeft = Math.min(Math.max(rect.left + rect.width / 2, CARD_W / 2 + 16), vw - CARD_W / 2 - 16)
      transform = 'translateX(-50%)'
      arrowEl = (
        <div style={{
          position: 'absolute', top: -arrowSize, left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid var(--parchment)`,
        }} />
      )
    } else if (current.arrow === 'above') {
      // Tooltip above target
      cardTop = rect.top - PAD - arrowSize
      cardLeft = Math.min(Math.max(rect.left + rect.width / 2, CARD_W / 2 + 16), vw - CARD_W / 2 - 16)
      transform = 'translate(-50%, -100%)'
      arrowEl = (
        <div style={{
          position: 'absolute', bottom: -arrowSize, left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderTop: `${arrowSize}px solid var(--parchment)`,
        }} />
      )
    }
  }

  return (
    <>
      {/* Spotlight */}
      {rect && !isMobile ? (
        <div style={{
          position: 'fixed',
          top: rect.top - 5, left: rect.left - 5,
          width: rect.width + 10, height: rect.height + 10,
          borderRadius: 10,
          boxShadow: '0 0 0 9999px rgba(42,30,16,0.65)',
          border: '1.5px solid var(--ochre)',
          zIndex: 1000,
          pointerEvents: 'none',
          transition: 'top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease',
        }} />
      ) : (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(42,30,16,0.65)',
          backdropFilter: 'blur(2px)',
          zIndex: 1000,
        }} onClick={complete} />
      )}

      {/* Card */}
      <div style={{
        position: 'fixed',
        top: cardTop, left: cardLeft,
        transform,
        width: isMobile ? 'min(92vw, 380px)' : CARD_W,
        zIndex: 1001,
      }}>
        {arrowEl}
        <div style={{
          background: 'var(--parchment)',
          borderRadius: 14,
          padding: '1.6rem',
          boxShadow: '0 20px 60px rgba(42,30,16,0.3)',
          border: '1px solid rgba(200,145,26,0.25)',
          position: 'relative',
        }}>
          <button onClick={complete} style={{
            position: 'absolute', top: '0.85rem', right: '0.85rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-light)', padding: '0.2rem', lineHeight: 1,
          }}>
            <X size={14} />
          </button>

          <div style={{
            fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--ochre)', marginBottom: '0.3rem',
          }}>
            {step + 1} / {STEPS.length}
          </div>

          <h2 className="serif" style={{
            fontSize: '1.3rem', fontWeight: 300, lineHeight: 1.2,
            color: 'var(--ink)', marginBottom: '0.75rem',
          }}>
            {current.title}
          </h2>

          <p style={{
            fontSize: '0.855rem', color: 'var(--ink-light)',
            lineHeight: 1.75, whiteSpace: 'pre-line',
            marginBottom: (current.hasGift || current.cta) ? '1rem' : '1.1rem',
          }}>
            {current.body}
          </p>

          {current.cta && (
            <a href={current.cta.href} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-block', marginBottom: '1.1rem',
                fontSize: '0.825rem', color: 'var(--ochre)',
                textDecoration: 'none', fontWeight: 600,
              }}
            >
              {current.cta.label} →
            </a>
          )}

          {current.hasGift && (
            <div style={{
              background: 'linear-gradient(135deg, #fdf0d5 0%, #f5e0a8 100%)',
              border: '1px solid var(--ochre)',
              borderRadius: 10, padding: '0.8rem 1rem',
              marginBottom: '1.1rem',
              display: 'flex', alignItems: 'center', gap: '0.7rem',
            }}>
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>🎁</span>
              <div>
                <div style={{
                  fontSize: '0.66rem', fontWeight: 700, color: 'var(--ochre)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.12rem',
                }}>
                  Welcome Gift · From the founder
                </div>
                <div className="serif" style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>
                  {GIFT_RECIPE.title}
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--ink-light)', fontStyle: 'italic', marginTop: '0.1rem' }}>
                  A family favorite, passed along to you.
                </div>
              </div>
            </div>
          )}

          {/* Step dots */}
          <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', marginBottom: '1rem' }}>
            {STEPS.map((_, i) => (
              <div key={i} onClick={() => i < step ? goTo(i) : undefined} style={{
                width: i === step ? 16 : 5, height: 5,
                borderRadius: 3,
                background: i === step ? 'var(--ochre)' : i < step ? 'var(--driftwood)' : 'var(--stone-dark)',
                transition: 'width 0.2s ease',
                cursor: i < step ? 'pointer' : 'default',
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {step > 0 && (
              <button onClick={() => goTo(step - 1)} className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.55rem 0.9rem' }}>
                ←
              </button>
            )}
            <button onClick={isLast ? complete : () => goTo(step + 1)}
              className="btn-primary"
              style={{ flex: 1, fontSize: '0.855rem', padding: '0.6rem' }}>
              {isLast ? 'Start cooking 🥧' : 'Next →'}
            </button>
          </div>

          <button onClick={complete} style={{
            display: 'block', width: '100%', marginTop: '0.6rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-light)', fontSize: '0.73rem', textAlign: 'center',
          }}>
            Skip tour
          </button>
        </div>
      </div>
    </>
  )
}
