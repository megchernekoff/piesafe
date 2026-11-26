'use client'
import { useEffect, useState } from 'react'
import { Send, Check } from 'lucide-react'

export default function FunFact() {
  const [tip, setTip] = useState<{ tip: string; source: string } | null>(null)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch('/api/cooking-tips').then(r => r.json()).then(data => { if (data) setTip(data) }).catch(() => {})
  }, [])

  async function submit() {
    if (!input.trim() || submitting) return
    setSubmitting(true)
    await fetch('/api/cooking-tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tip: input.trim() }),
    })
    setSubmitting(false)
    setSubmitted(true)
    setInput('')
  }

  if (!tip) return null

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '1rem' }}>🥄</span>
        <div className="section-label">Food for Thought</div>
      </div>
      <div style={{
        background: 'var(--parchment)',
        border: '1px solid var(--stone-dark)',
        borderRadius: 12,
        padding: '1rem 1.1rem',
      }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-light)', lineHeight: 1.65, marginBottom: '0.4rem' }}>{tip.tip}</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--ink-light)', opacity: 0.6, fontStyle: 'italic', marginBottom: '1rem' }}>— {tip.source}</p>

        {submitted ? (
          <p style={{ fontSize: '0.78rem', color: 'var(--olive)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Check size={13} /> Thanks — we'll add it to the collection!
          </p>
        ) : (
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-light)', marginBottom: '0.4rem' }}>Have a tip of your own?</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <textarea
                  className="textarea"
                  value={input}
                  onChange={e => setInput(e.target.value.slice(0, 300))}
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) submit() }}
                  placeholder="Share a cooking tip…"
                  style={{ fontSize: '0.82rem', minHeight: '60px', resize: 'none' }}
                />
                <div style={{ fontSize: '0.68rem', color: 'var(--ink-light)', textAlign: 'right', marginTop: '0.2rem' }}>
                  {input.length}/300
                </div>
              </div>
              <button className="btn-primary" onClick={submit}
                disabled={submitting || !input.trim()}
                style={{ padding: '0.65rem 0.85rem', flexShrink: 0, marginBottom: '1.4rem' }}>
                <Send size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
