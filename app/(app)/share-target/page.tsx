'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function ShareTargetPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Reading your post…')

  useEffect(() => {
    async function process() {
      try {
        const cache = await caches.open('share-target-v1')
        const stored = await cache.match('shared-media')
        if (!stored) {
          setStatus('error')
          setMessage('No image found — try sharing again.')
          return
        }

        const blob = await stored.blob()
        await cache.delete('shared-media')

        setMessage('Extracting recipe…')

        const form = new FormData()
        form.append('image', blob, 'shared.jpg')

        const res = await fetch('/api/import-image', { method: 'POST', body: form })
        const data = await res.json()

        if (!res.ok) {
          setStatus('error')
          setMessage(data.error || 'Could not read a recipe from that image.')
          return
        }

        setStatus('success')
        setMessage(`Saved "${data.recipe?.title || 'recipe'}" to your box!`)
        setTimeout(() => router.push('/recipes'), 2000)
      } catch {
        setStatus('error')
        setMessage('Something went wrong — try again.')
      }
    }

    process()
  }, [router])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem', textAlign: 'center' }}>
      {status === 'loading' && (
        <Loader2 size={40} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--lavender)' }} />
      )}
      {status === 'success' && <CheckCircle size={40} style={{ color: 'var(--olive)' }} />}
      {status === 'error' && <AlertCircle size={40} style={{ color: 'var(--terracotta)' }} />}
      <p style={{ fontSize: '1rem', color: 'var(--ink-light)', maxWidth: '280px', lineHeight: 1.6 }}>{message}</p>
      {status === 'error' && (
        <button className="btn-secondary" onClick={() => router.push('/recipes')}>
          Go to Recipes
        </button>
      )}
    </div>
  )
}
