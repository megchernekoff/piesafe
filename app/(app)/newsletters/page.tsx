'use client'
import { useState, useEffect, useRef } from 'react'
import { Mail, Loader2, BookmarkPlus, Check, Unlink, Search } from 'lucide-react'

interface Provider { name: string; domain: string; keywords: string[] }
interface DigestRecipe { title: string; description: string }
interface Digest {
  id: string
  gmail_id: string
  sender: string
  subject: string
  date: string
  summary: DigestRecipe[]
  saved: number
}

const SUPPORTED_PROVIDERS: Provider[] = [
  { name: 'NYT Cooking',        domain: 'nytimes.com',          keywords: ['nyt', 'new york times', 'nytimes', 'cooking'] },
  { name: 'Serious Eats',       domain: 'seriouseats.com',       keywords: ['serious eats', 'seriouseats'] },
  { name: 'Bon Appétit',        domain: 'bonappetit.com',        keywords: ['bon appetit', 'bonappetit', 'bon appétit'] },
  { name: 'Food52',             domain: 'food52.com',            keywords: ['food52'] },
  { name: 'Half Baked Harvest', domain: 'halfbakedharvest.com',  keywords: ['half baked harvest'] },
  { name: 'Smitten Kitchen',    domain: 'smittenkitchen.com',    keywords: ['smitten kitchen'] },
  { name: 'The Kitchn',         domain: 'thekitchn.com',         keywords: ['kitchn'] },
  { name: 'Epicurious',         domain: 'epicurious.com',        keywords: ['epicurious'] },
  { name: 'Budget Bytes',       domain: 'budgetbytes.com',       keywords: ['budget bytes'] },
  { name: 'King Arthur Baking', domain: 'kingarthurbaking.com',  keywords: ['king arthur'] },
  { name: 'Simply Recipes',     domain: 'simplyrecipes.com',     keywords: ['simply recipes'] },
]

function matchProviders(q: string): Provider[] {
  if (!q.trim()) return SUPPORTED_PROVIDERS
  const lower = q.toLowerCase()
  return SUPPORTED_PROVIDERS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.keywords.some(k => k.includes(lower) || lower.includes(k))
  )
}

function senderName(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</)?.[1]?.trim()
  return match || from.split('@')[0]
}

export default function NewslettersPage() {
  const [connected, setConnected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [digests, setDigests] = useState<Digest[]>([])
  const [selected, setSelected] = useState<Record<string, number[]>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [scanning, setScanning] = useState<string | null>(null) // domain being scanned
  const [toast, setToast] = useState('')

  // Search input state
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const matches = matchProviders(query)
  const hasExactMatch = matches.length > 0
  const isTyping = query.trim().length > 0

  useEffect(() => {
    fetch('/api/gmail/scan')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) setConnected(null)
        else { setConnected('connected'); setDigests(data) }
      })
      .catch(() => setConnected(null))
      .finally(() => setLoading(false))

    const params = new URLSearchParams(window.location.search)
    if (params.get('gmail') === 'connected') {
      setConnected('connected')
      window.history.replaceState({}, '', '/newsletters')
    }
    if (params.get('gmail') === 'error') {
      setToast('Could not connect Gmail — please try again.')
      window.history.replaceState({}, '', '/newsletters')
    }
  }, [])

  async function scanProvider(provider: Provider) {
    setQuery('')
    setShowDropdown(false)
    setScanning(provider.domain)
    const res = await fetch('/api/gmail/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: provider.domain, providerName: provider.name }),
    })
    const data = await res.json()
    if (data.error) {
      setToast(data.error)
    } else {
      const newDigests: Digest[] = data.digests ?? []
      setDigests(prev => {
        const existingIds = prev.map(d => d.gmail_id)
        const fresh = newDigests.filter(d => !existingIds.includes(d.gmail_id))
        return [...fresh, ...prev]
      })
      if (newDigests.length === 0) setToast(`No recent ${provider.name} emails found in your inbox.`)
      else setToast(`Found ${newDigests.length} ${provider.name} newsletter${newDigests.length > 1 ? 's' : ''}!`)
    }
    setScanning(null)
    setTimeout(() => setToast(''), 4000)
  }

  async function disconnect() {
    await fetch('/api/gmail/disconnect', { method: 'POST' })
    setConnected(null)
    setDigests([])
    setSelected({})
    setSavedIds([])
  }

  function toggleRecipe(digestId: string, idx: number) {
    setSelected(prev => {
      const current = prev[digestId] ?? []
      const next = current.includes(idx) ? current.filter(i => i !== idx) : [...current, idx]
      return { ...prev, [digestId]: next }
    })
  }

  function toggleAll(digest: Digest) {
    const all = digest.summary.map((_, i) => i)
    const current = selected[digest.gmail_id] ?? []
    setSelected(prev => ({ ...prev, [digest.gmail_id]: current.length === digest.summary.length ? [] : all }))
  }

  async function saveSelected(digest: Digest) {
    const indices = selected[digest.gmail_id] ?? []
    if (indices.length === 0) return
    setSaving(digest.gmail_id)
    const recipes = digest.summary.filter((_, i) => indices.includes(i))
    await fetch('/api/gmail/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ digestId: digest.gmail_id, recipes }),
    })
    setSavedIds(prev => [...prev, digest.gmail_id])
    setSaving(null)
    setToast(`${recipes.length} recipe${recipes.length > 1 ? 's' : ''} saved to your Recipe Box!`)
    setTimeout(() => setToast(''), 3000)
  }

  if (loading) return <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}

      <div className="page-header">
        <h1 className="page-title">Newsletters</h1>
        <p className="page-subtitle">Recipe emails from your inbox, your way</p>
      </div>

      {!connected ? (
        <div className="card" style={{ maxWidth: '480px' }}>
          <Mail size={28} style={{ color: 'var(--ochre)', marginBottom: '1rem' }} />
          <h3 className="serif" style={{ fontSize: '1.4rem', fontWeight: 300, marginBottom: '0.5rem' }}>
            Connect your Gmail
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
            Search for a newsletter you subscribe to and we&apos;ll pull the recipes from it.
            Read-only access. You choose what gets saved.
          </p>
          <a href="/api/gmail/connect">
            <button className="btn-primary"><Mail size={14} /> Connect Gmail</button>
          </a>
        </div>
      ) : (
        <>
          {/* Provider search */}
          <div style={{ maxWidth: '480px', marginBottom: '2rem', position: 'relative' }}>
            <div className="section-label" style={{ marginBottom: '0.6rem' }}>Search for a newsletter</div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-light)', pointerEvents: 'none' }} />
              <input
                ref={inputRef}
                className="input"
                style={{ paddingLeft: '2rem' }}
                placeholder="e.g. NYT Cooking, Serious Eats, Bon Appétit…"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              />
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--parchment)', border: '1px solid var(--stone-dark)', borderRadius: 8, boxShadow: '0 4px 16px rgba(44,30,16,0.1)', zIndex: 50, overflow: 'hidden', marginTop: 4 }}>
                {hasExactMatch ? (
                  matches.map(p => (
                    <button key={p.domain}
                      onMouseDown={() => scanProvider(p)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.7rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--ink)', textAlign: 'left', fontFamily: 'Nunito, sans-serif' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--lavender-soft)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                      <span>{p.name}</span>
                      {scanning === p.domain && <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--lavender)' }} />}
                    </button>
                  ))
                ) : (
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--ink-light)', fontStyle: 'italic' }}>
                    &ldquo;{query}&rdquo; isn&apos;t available yet — check back soon!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supported providers hint */}
          {!isTyping && digests.length === 0 && (
            <div style={{ maxWidth: '480px', marginBottom: '2rem' }}>
              <div className="section-label" style={{ marginBottom: '0.6rem' }}>Supported newsletters</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {SUPPORTED_PROVIDERS.map(p => (
                  <button key={p.domain} className="btn-secondary"
                    onClick={() => scanProvider(p)}
                    disabled={scanning === p.domain}
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}>
                    {scanning === p.domain
                      ? <Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} />
                      : p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Disconnect */}
          <button className="btn-ghost" onClick={disconnect} style={{ color: 'var(--ink-light)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            <Unlink size={12} /> Disconnect Gmail
          </button>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '680px' }}>
            {digests.map(digest => {
              const isSaved = savedIds.includes(digest.gmail_id) || digest.saved === 1
              const selectedIndices = selected[digest.gmail_id] ?? []
              return (
                <div key={digest.gmail_id} className="card" style={{ opacity: isSaved ? 0.7 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ochre)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                        {senderName(digest.sender)}
                      </div>
                      <div className="serif" style={{ fontSize: '1.1rem', fontWeight: 400 }}>{digest.subject}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--ink-light)', marginTop: '0.15rem' }}>
                        {new Date(digest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    {isSaved
                      ? <span style={{ fontSize: '0.78rem', color: 'var(--olive)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={12} /> Saved</span>
                      : <button className="btn-ghost" onClick={() => toggleAll(digest)} style={{ fontSize: '0.75rem' }}>
                          {selectedIndices.length === digest.summary.length ? 'Deselect all' : 'Select all'}
                        </button>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {digest.summary.map((recipe, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: isSaved ? 'default' : 'pointer', padding: '0.5rem 0.6rem', borderRadius: 8, background: selectedIndices.includes(i) ? 'var(--lavender-soft)' : 'transparent', transition: 'background 0.1s' }}>
                        {!isSaved && (
                          <input type="checkbox" checked={selectedIndices.includes(i)}
                            onChange={() => toggleRecipe(digest.gmail_id, i)}
                            style={{ marginTop: '0.2rem', accentColor: 'var(--lavender)' }} />
                        )}
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{recipe.title}</div>
                          {recipe.description && <div style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: '0.1rem' }}>{recipe.description}</div>}
                        </div>
                      </label>
                    ))}
                  </div>

                  {!isSaved && selectedIndices.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--stone-dark)' }}>
                      <button className="btn-primary" onClick={() => saveSelected(digest)} disabled={saving === digest.gmail_id} style={{ fontSize: '0.82rem' }}>
                        {saving === digest.gmail_id
                          ? <><Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                          : <><BookmarkPlus size={13} /> Save {selectedIndices.length} recipe{selectedIndices.length > 1 ? 's' : ''} to Recipe Box</>}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
