'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Share2, Check } from 'lucide-react'

interface Profile {
  display_name: string
  household_size: number
  toddler_mode: boolean
  toddler_age: number | null
  dislikes: string[]
  dietary_restrictions: string[]
}

const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']

const DEFAULT: Profile = {
  display_name: '',
  household_size: 2,
  toddler_mode: false,
  toddler_age: null,
  dislikes: [],
  dietary_restrictions: [],
}

function ShareSection() {
  const [copied, setCopied] = useState(false)

  async function invite() {
    const text = "I've been using Pie Safe for meal planning and thought you'd love it — it plans your whole week of dinners and builds the grocery list automatically. Try it: https://pie-safe.com"
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Join me on Pie Safe', text, url: 'https://pie-safe.com' })
        return
      } catch { /* user cancelled or not supported */ }
    }
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{ maxWidth: '540px', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--stone-dark)' }}>
      <div className="section-label" style={{ marginBottom: '0.5rem' }}>Invite a friend</div>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', marginBottom: '1rem', lineHeight: 1.6 }}>
        Know someone who'd love stress-free meal planning? Send them an invite.
      </p>
      <button className="btn-primary" onClick={invite} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        {copied ? <><Check size={14} /> Link copied!</> : <><Share2 size={14} /> Send an invite</>}
      </button>
    </div>
  )
}

export default function PreferencesPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>(DEFAULT)
  const [dislikeInput, setDislikeInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAccount() {
    setDeleting(true)
    await fetch('/api/account', { method: 'DELETE' })
    router.push('/')
  }

  useEffect(() => {
    fetch('/api/preferences')
      .then(r => r.json())
      .then(data => { if (data) setProfile(data) })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function addDislike() {
    const val = dislikeInput.trim().toLowerCase()
    if (val && !profile.dislikes.includes(val)) {
      setProfile(p => ({ ...p, dislikes: [...p.dislikes, val] }))
    }
    setDislikeInput('')
  }

  function toggleDietary(opt: string) {
    setProfile(p => ({
      ...p,
      dietary_restrictions: p.dietary_restrictions.includes(opt)
        ? p.dietary_restrictions.filter(d => d !== opt)
        : [...p.dietary_restrictions, opt],
    }))
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Preferences</h1>
        <p className="page-subtitle">Tell us about your household so we can tailor your meal plans</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div>
          <div className="section-label">Your name</div>
          <input
            className="input"
            value={profile.display_name}
            onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
            placeholder="First name"
          />
        </div>

        <div>
          <div className="section-label">Household size</div>
          <input
            className="input"
            type="number"
            min={1}
            max={12}
            value={profile.household_size}
            onChange={e => setProfile(p => ({ ...p, household_size: parseInt(e.target.value) || 2 }))}
            style={{ maxWidth: '100px' }}
          />
        </div>

        <div>
          <div className="section-label">Dietary restrictions</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {DIETARY_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleDietary(opt)}
                className={profile.dietary_restrictions.includes(opt) ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="section-label">Ingredients to avoid</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              className="input"
              value={dislikeInput}
              onChange={e => setDislikeInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDislike() } }}
              placeholder="e.g. cilantro, mushrooms…"
              style={{ flex: 1 }}
            />
            <button type="button" className="btn-secondary" onClick={addDislike}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {profile.dislikes.map(d => (
              <span
                key={d}
                className="tag"
                style={{ cursor: 'pointer' }}
                onClick={() => setProfile(p => ({ ...p, dislikes: p.dislikes.filter(x => x !== d) }))}
              >
                {d} ×
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="section-label">Toddler in the household?</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              checked={profile.toddler_mode}
              onChange={e => setProfile(p => ({ ...p, toddler_mode: e.target.checked }))}
            />
            Yes — include toddler-friendly adaptations
          </label>
          {profile.toddler_mode && (
            <div style={{ marginTop: '0.75rem' }}>
              <div className="section-label">Age in months</div>
              <input
                className="input"
                type="number"
                min={6}
                max={60}
                value={profile.toddler_age ?? ''}
                onChange={e => setProfile(p => ({ ...p, toddler_age: parseInt(e.target.value) || null }))}
                placeholder="e.g. 18"
                style={{ maxWidth: '100px' }}
              />
            </div>
          )}
        </div>

        <div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save preferences'}
          </button>
        </div>
      </form>

      {/* Share */}
      <ShareSection />

      {/* Danger zone */}
      <div style={{ maxWidth: '540px', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--sand)' }}>
        <div className="section-label" style={{ marginBottom: '0.75rem', color: 'var(--ink-light)' }}>Danger zone</div>
        {!deleteConfirm ? (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            style={{
              background: 'none', border: '1px solid #c0392b', borderRadius: 8,
              color: '#c0392b', fontSize: '0.875rem', padding: '0.5rem 1rem',
              cursor: 'pointer',
            }}
          >
            Delete account
          </button>
        ) : (
          <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10, padding: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              This will permanently delete your account, all recipes, meal plans, and preferences.
              <strong> This cannot be undone.</strong>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  background: '#c0392b', border: 'none', borderRadius: 8,
                  color: '#fff', fontSize: '0.875rem', padding: '0.5rem 1rem',
                  cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Deleting…' : 'Yes, delete everything'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="btn-secondary"
                style={{ fontSize: '0.875rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
