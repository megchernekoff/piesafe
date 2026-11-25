'use client'
import { useEffect, useState } from 'react'
import { X, Share } from 'lucide-react'

type Platform = 'android' | 'ios' | null

export default function InstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => Promise<void> } | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone) return
    if (localStorage.getItem('install-banner-dismissed')) return

    const ua = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isAndroid = /Android/i.test(ua)

    if (isIOS) setPlatform('ios')
    if (isAndroid) setPlatform('android')

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as Event & { prompt: () => Promise<void> })
      if (isAndroid) setPlatform('android')
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('install-banner-dismissed', '1')
    setDismissed(true)
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    setDismissed(true)
  }

  if (dismissed || !platform) return null

  return (
    <div style={{
      margin: '0.75rem 0 0',
      background: 'var(--lavender-soft)',
      border: '1px solid rgba(107,92,138,0.2)',
      borderRadius: 10,
      padding: '0.65rem 0.75rem',
      fontSize: '0.78rem',
      color: 'var(--ink)',
      lineHeight: 1.5,
      position: 'relative',
    }}>
      <button onClick={dismiss} style={{
        position: 'absolute', top: 6, right: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--ink-light)', padding: 2,
      }}>
        <X size={12} />
      </button>

      {platform === 'android' && deferredPrompt ? (
        <>
          <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Add to home screen</div>
          <button onClick={install} className="btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem', width: '100%' }}>
            Install Pie Safe
          </button>
        </>
      ) : platform === 'ios' ? (
        <>
          <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Add to home screen</div>
          <span>Tap <Share size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> then <strong>Add to Home Screen</strong></span>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Add to home screen</div>
          <span style={{ color: 'var(--ink-light)' }}>Open in your mobile browser and use the share or menu button to install.</span>
        </>
      )}
    </div>
  )
}
