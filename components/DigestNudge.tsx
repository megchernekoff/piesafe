'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { X } from 'lucide-react'

export default function DigestNudge() {
  const { userId } = useAuth()
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (!userId) return
    if (!localStorage.getItem(`starter-done-${userId}`)) return
    if (localStorage.getItem(`digest-nudge-done-${userId}`)) return

    const find = (retries = 10) => {
      const el = document.querySelector<HTMLElement>('[data-tour="digest"]')
      if (!el) {
        if (retries > 0) setTimeout(() => find(retries - 1), 300)
        return
      }
      const r = el.getBoundingClientRect()
      setPos({ top: r.top + r.height / 2, left: r.right + 10 })
      setVisible(true)
    }
    find()
  }, [userId])

  function dismiss() {
    if (userId) localStorage.setItem(`digest-nudge-done-${userId}`, '1')
    setVisible(false)
  }

  if (!visible || !pos) return null

  return (
    <div style={{
      position: 'fixed',
      top: pos.top,
      left: pos.left,
      transform: 'translateY(-50%)',
      zIndex: 998,
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none',
    }}>
      {/* Arrow pointing left toward the sidebar item */}
      <div style={{
        width: 0, height: 0,
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        borderRight: '7px solid var(--parchment)',
        flexShrink: 0,
      }} />
      <div style={{
        background: 'var(--parchment)',
        border: '1px solid rgba(200,145,26,0.35)',
        borderRadius: 10,
        padding: '0.55rem 0.75rem 0.55rem 0.85rem',
        boxShadow: '0 4px 20px rgba(42,30,16,0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        pointerEvents: 'auto',
        whiteSpace: 'nowrap',
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ink)', lineHeight: 1.4 }}>
          Connect your inbox here
        </span>
        <button onClick={dismiss} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ink-light)', padding: '0.1rem', lineHeight: 1, flexShrink: 0,
        }}>
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
