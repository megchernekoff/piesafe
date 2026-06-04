'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DIETARY = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<'welcome' | 'prefs'>('welcome')
  const [displayName, setDisplayName] = useState('')
  const [householdSize, setHouseholdSize] = useState(2)
  const [dietary, setDietary] = useState<string[]>([])
  const [dislikes, setDislikes] = useState<string[]>([])
  const [dislikeInput, setDislikeInput] = useState('')
  const [toddlerMode, setToddlerMode] = useState(false)
  const [toddlerAge, setToddlerAge] = useState('')
  const [saving, setSaving] = useState(false)

  function toggleDietary(opt: string) {
    setDietary(d => d.includes(opt) ? d.filter(x => x !== opt) : [...d, opt])
  }

  function addDislike() {
    const val = dislikeInput.trim().toLowerCase()
    if (val && !dislikes.includes(val)) setDislikes(d => [...d, val])
    setDislikeInput('')
  }

  async function save() {
    setSaving(true)
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
    router.push('/dashboard')
  }

  if (step === 'welcome') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--warm-white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '480px', padding: '2rem', textAlign: 'center' }}>
          <div className="serif" style={{ fontSize: '2.5rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '1rem' }}>
            Welcome to Pie <span style={{ color: 'var(--clay)' }}>Safe</span>
          </div>
          <p style={{ color: 'var(--ink-light)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Let&apos;s set up your household profile so we can plan meals your whole family will love.
            This takes about a minute.
          </p>
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }} onClick={() => setStep('prefs')}>
            Let&apos;s go
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>
        <div className="serif" style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '0.5rem' }}>
          Your household
        </div>
        <p style={{ color: 'var(--ink-light)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          You can update these any time from Preferences.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div>
            <div className="section-label">Your first name</div>
            <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Meg" />
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
            <div className="section-label">Ingredients to avoid</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>
              Food aversions, strong dislikes, anything you never want on the menu.
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
              Yes — include toddler-friendly adaptations
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

          <button className="btn-primary" onClick={save} disabled={saving}
            style={{ fontSize: '1rem', padding: '0.8rem 2rem', alignSelf: 'flex-start' }}>
            {saving ? 'Saving…' : 'Take me to my kitchen →'}
          </button>
        </div>
      </div>
    </div>
  )
}
