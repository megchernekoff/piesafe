'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Link2, Sparkles, Loader2, Check, X } from 'lucide-react'

type Panel = 'url' | 'prompt' | null

export default function QuickActions() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [panel, setPanel] = useState<Panel>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  function openPanel(p: Panel) {
    setPanel(prev => prev === p ? null : p)
    setInput('')
    setResult(null)
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        sessionStorage.setItem('quick-camera-photo', JSON.stringify({ data: ev.target?.result, name: file.name, type: file.type }))
      } catch { /* storage full */ }
      router.push('/recipes?tab=photo&fromCamera=1')
    }
    reader.readAsDataURL(file)
  }

  async function submit() {
    if (!input.trim() || loading) return
    setLoading(true)
    setResult(null)
    try {
      if (panel === 'url') {
        const res = await fetch('/api/import-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: input.trim() }),
        })
        const data = await res.json()
        if (data.duplicate) {
          setResult({ ok: false, message: `You already have "${data.existing.title}" saved.` })
        } else if (data.error) {
          setResult({ ok: false, message: data.error })
        } else {
          setResult({ ok: true, message: `Saved "${data.recipe?.title || 'recipe'}" to your box!` })
          setInput('')
        }
      } else if (panel === 'prompt') {
        const res = await fetch('/api/recipes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input.trim() }),
        })
        const data = await res.json()
        if (data.duplicate) {
          setResult({ ok: false, message: `You already have "${data.existing.title}" saved.` })
        } else if (data.error) {
          setResult({ ok: false, message: data.error })
        } else {
          setResult({ ok: true, message: `Saved "${data.recipe?.title || 'recipe'}" to your box!` })
          setInput('')
        }
      }
    } catch {
      setResult({ ok: false, message: 'Something went wrong — try again.' })
    }
    setLoading(false)
  }

  const tiles = [
    { id: null as Panel,     icon: Camera,    label: 'Add photo',   action: () => fileInputRef.current?.click() },
    { id: 'url' as Panel,    icon: Link2,     label: 'From URL',    action: () => openPanel('url') },
    { id: 'prompt' as Panel, icon: Sparkles,  label: 'From prompt', action: () => openPanel('prompt') },
  ]

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
        style={{ display: 'none' }} onChange={handlePhoto} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: panel ? '0.75rem' : 0 }}>
        {tiles.map(({ id, icon: Icon, label, action }) => (
          <button key={label} onClick={action} style={{
            background: panel === id && id !== null ? 'var(--lavender)' : 'var(--parchment)',
            border: `1px solid ${panel === id && id !== null ? 'var(--lavender)' : 'var(--stone-dark)'}`,
            borderRadius: 12,
            padding: '1rem 0.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            cursor: 'pointer',
          }}>
            <Icon size={22} style={{ color: panel === id && id !== null ? 'white' : 'var(--lavender)' }} />
            <span style={{ fontSize: '0.72rem', color: panel === id && id !== null ? 'rgba(255,255,255,0.85)' : 'var(--ink-light)', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
          </button>
        ))}
      </div>

      {panel && (
        <div style={{ background: 'var(--parchment)', border: '1px solid var(--stone-dark)', borderRadius: 12, padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {panel === 'url' ? (
              <input className="input" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="Paste a recipe URL…"
                style={{ flex: 1, fontSize: '0.875rem' }} autoFocus />
            ) : (
              <textarea className="textarea" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) submit() }}
                placeholder="Describe the recipe you want…"
                style={{ flex: 1, fontSize: '0.875rem', minHeight: '64px', resize: 'none' }} autoFocus />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button className="btn-primary" onClick={submit} disabled={loading || !input.trim()}
                style={{ padding: '0.65rem 0.85rem' }}>
                {loading ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : '→'}
              </button>
              <button className="btn-ghost" onClick={() => { setPanel(null); setInput(''); setResult(null) }}
                style={{ padding: '0.65rem 0.85rem' }}>
                <X size={14} />
              </button>
            </div>
          </div>
          {result && (
            <p style={{ fontSize: '0.8rem', marginTop: '0.6rem', color: result.ok ? 'var(--olive)' : 'var(--terracotta)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {result.ok && <Check size={13} />}
              {result.message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
