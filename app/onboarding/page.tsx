'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PieIcon from '@/components/icons/PieIcon'

const DIETARY = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']

const LOADING_MESSAGES = [
  'Learning your preferences…',
  'Picking recipes your household will love…',
  'Balancing the week…',
  'Building your grocery list…',
  'Almost ready…',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<'welcome' | 'prefs' | 'generating'>('welcome')
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [householdSize, setHouseholdSize] = useState(2)
  const [dietary, setDietary] = useState<string[]>([])
  const [dislikes, setDislikes] = useState<string[]>([])
  const [dislikeInput, setDislikeInput] = useState('')
  const [toddlerMode, setToddlerMode] = useState(false)
  const [toddlerAge, setToddlerAge] = useState('')

  function toggleDietary(opt: string) {
    setDietary(d => d.includes(opt) ? d.filter(x => x !== opt) : [...d, opt])
  }

  function addDislike() {
    const val = dislikeInput.trim().toLowerCase()
    if (val && !dislikes.includes(val)) setDislikes(d => [...d, val])
    setDislikeInput('')
  }

  async function save() {
    setStep('generating')

    // Cycle through loading messages
    let msgIdx = 0
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length
      setLoadingMsg(msgIdx)
    }, 2200)

    // Save preferences
    await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: displayName,
        household_size: householdSize,
        dietary_restrictions: dietary,
        dislikes,
        toddler_mode: toddlerMode,
        toddler_age: toddlerAge ? parseInt(toddlerAge) : null,
      }),
    })

    // Auto-generate their first meal plan
    try {
      await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweaks: '', nights: 5 }),
      })
    } catch { /* if it fails, still move on */ }

    clearInterval(interval)
    router.push('/plan')
  }

  if (step === 'welcome') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--wheat)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '480px', padding: '2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <PieIcon size={64} />
          </div>
          <div className="serif" style={{ fontSize: '2.5rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '1rem' }}>
            Welcome to Pie <span style={{ color: 'var(--ochre)' }}>Safe</span>
          </div>
          <p style={{ color: 'var(--ink-light)', lineHeight: 1.75, marginBottom: '0.75rem' }}>
            Your personal meal planner, recipe box, and kitchen companion.
          </p>
          <p style={{ color: 'var(--ink-light)', lineHeight: 1.75, marginBottom: '2rem', fontSize: '0.9rem' }}>
            Answer a few quick questions and we&apos;ll build your first week of dinners automatically — tailored to your household.
          </p>
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }} onClick={() => setStep('prefs')}>
            Let&apos;s go →
          </button>
        </div>
      </div>
    )
  }

  if (step === 'generating') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--wheat)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <PieIcon size={56} />
          </div>
          <div className="serif" style={{ fontSize: '1.6rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--ink)' }}>
            Building your first meal plan
          </div>
          <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '2rem', minHeight: '2.5rem', transition: 'opacity 0.3s' }}>
            {LOADING_MESSAGES[loadingMsg]}
          </p>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--wheat)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>
        <div className="serif" style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '0.25rem' }}>
          Tell us about your household
        </div>
        <p style={{ color: 'var(--ink-light)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          This shapes every meal plan and recipe suggestion. You can change it anytime.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div>
            <div className="section-label">Your first name</div>
            <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Meg" autoFocus />
          </div>

          <div>
            <div className="section-label">How many people are you feeding?</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button key={n} type="button"
                  onClick={() => setHouseholdSize(n)}
                  className={householdSize === n ? 'btn-primary' : 'btn-secondary'}
                  style={{ minWidth: '44px', padding: '0.45rem 0.6rem', fontSize: '0.9rem' }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="section-label">Any dietary restrictions?</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>Select all that apply.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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
            <div className="section-label">Ingredients to avoid</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>
              Anything you&apos;d never want on the menu — dislikes, aversions, allergies.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input className="input"
                value={dislikeInput}
                onChange={e => setDislikeInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDislike() } }}
                placeholder="e.g. cilantro, mushrooms, blue cheese…"
                style={{ flex: 1 }} />
              <button type="button" className="btn-secondary" onClick={addDislike}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {dislikes.map(d => (
                <span key={d} className="tag" style={{ cursor: 'pointer' }}
                  onClick={() => setDislikes(ds => ds.filter(x => x !== d))}>
                  {d} ×
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="section-label">Any toddlers at the table?</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              <input type="checkbox" checked={toddlerMode} onChange={e => setToddlerMode(e.target.checked)} />
              Yes — include toddler-friendly adaptations in every meal
            </label>
            {toddlerMode && (
              <div style={{ marginTop: '0.75rem' }}>
                <div className="section-label">Age in months</div>
                <input className="input" type="number" min={6} max={60}
                  value={toddlerAge}
                  onChange={e => setToddlerAge(e.target.value)}
                  placeholder="e.g. 18"
                  style={{ maxWidth: '100px' }} />
              </div>
            )}
          </div>

          <div style={{ paddingTop: '0.5rem' }}>
            <button className="btn-primary" onClick={save}
              style={{ fontSize: '1rem', padding: '0.9rem 2rem' }}>
              Build my first meal plan →
            </button>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-light)', marginTop: '0.6rem', fontStyle: 'italic' }}>
              Takes about 30 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
