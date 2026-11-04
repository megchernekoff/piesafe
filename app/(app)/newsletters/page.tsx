'use client'
import { useState, useEffect } from 'react'
import { Mail, RefreshCw, Loader2, BookmarkPlus, Check, Unlink } from 'lucide-react'

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

function senderName(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</)?.[1]?.trim()
  return match || from.split('@')[0]
}

export default function NewslettersPage() {
  const [connected, setConnected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [digests, setDigests] = useState<Digest[]>([])
  // selected: { [gmail_id]: number[] } — indices of checked recipes
  const [selected, setSelected] = useState<Record<string, number[]>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/gmail/scan')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setConnected(null)
        } else {
          setConnected('connected')
          setDigests(data)
        }
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

  async function scan() {
    setScanning(true)
    const res = await fetch('/api/gmail/scan', { method: 'POST' })
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
      if (newDigests.length === 0) setToast('No new recipe newsletters found.')
      else setToast(`Found ${newDigests.length} new newsletter${newDigests.length > 1 ? 's' : ''}!`)
    }
    setScanning(false)
    setTimeout(() => setToast(''), 3000)
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
      const next = current.includes(idx)
        ? current.filter(i => i !== idx)
        : [...current, idx]
      return { ...prev, [digestId]: next }
    })
  }

  function toggleAll(digest: Digest) {
    const all = digest.summary.map((_, i) => i)
    const current = selected[digest.gmail_id] ?? []
    const isAll = current.length === digest.summary.length
    setSelected(prev => ({ ...prev, [digest.gmail_id]: isAll ? [] : all }))
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

  if (loading) return (
    <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
  )

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
            We&apos;ll scan for recipe newsletters — Serious Eats, NYT Cooking, Bon Appétit, and more.
            Read-only access. You choose what gets saved.
          </p>
          <a href="/api/gmail/connect">
            <button className="btn-primary"><Mail size={14} /> Connect Gmail</button>
          </a>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
            <button className="btn-primary" onClick={scan} disabled={scanning}>
              {scanning
                ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Scanning…</>
                : <><RefreshCw size={14} /> Check for new newsletters</>}
            </button>
            <button className="btn-ghost" onClick={disconnect} style={{ color: 'var(--ink-light)', fontSize: '0.8rem' }}>
              <Unlink size={12} /> Disconnect Gmail
            </button>
          </div>

          {digests.length === 0 && !scanning && (
            <div className="empty-state">
              <Mail size={40} />
              <h3>No newsletters yet</h3>
              <p>Hit &ldquo;Check for new newsletters&rdquo; to scan your inbox.</p>
            </div>
          )}

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
                      : (
                        <button className="btn-ghost" onClick={() => toggleAll(digest)} style={{ fontSize: '0.75rem' }}>
                          {selectedIndices.length === digest.summary.length ? 'Deselect all' : 'Select all'}
                        </button>
                      )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {digest.summary.map((recipe, i) => (
                      <label key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        cursor: isSaved ? 'default' : 'pointer',
                        padding: '0.5rem 0.6rem', borderRadius: 8,
                        background: selectedIndices.includes(i) ? 'var(--lavender-soft)' : 'transparent',
                        transition: 'background 0.1s',
                      }}>
                        {!isSaved && (
                          <input type="checkbox"
                            checked={selectedIndices.includes(i)}
                            onChange={() => toggleRecipe(digest.gmail_id, i)}
                            style={{ marginTop: '0.2rem', accentColor: 'var(--lavender)' }} />
                        )}
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{recipe.title}</div>
                          {recipe.description && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: '0.1rem' }}>{recipe.description}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {!isSaved && selectedIndices.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--stone-dark)' }}>
                      <button className="btn-primary" onClick={() => saveSelected(digest)}
                        disabled={saving === digest.gmail_id}
                        style={{ fontSize: '0.82rem' }}>
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
