'use client'
import { useState, useEffect } from 'react'
import { X, Puzzle } from 'lucide-react'

export default function ExtensionBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('extension-banner-dismissed')) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem('extension-banner-dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      background: 'var(--lavender-soft)',
      border: '1px solid var(--lavender)',
      borderRadius: 10,
      padding: '0.85rem 1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1.5rem',
      maxWidth: '700px',
    }}>
      <Puzzle size={16} style={{ color: 'var(--lavender)', flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: '0.875rem', lineHeight: 1.5 }}>
        <strong>Save recipes from anywhere</strong> — install the Pie Safe Chrome extension to add any recipe to your box in one click.{' '}
        <a
          href="https://github.com/megchernekoff/piesafe"
          target="_blank"
          rel="noopener"
          style={{ color: 'var(--lavender)', textDecoration: 'underline' }}
        >
          How to install →
        </a>
      </div>
      <button onClick={dismiss} className="btn-ghost" style={{ padding: '0.2rem', flexShrink: 0, opacity: 0.5 }}>
        <X size={14} />
      </button>
    </div>
  )
}
