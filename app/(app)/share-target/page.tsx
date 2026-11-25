'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Suspense } from 'react'

function ShareTargetInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Saving…')

  useEffect(() => {
    const sharedUrl = params.get('url') || params.get('text') || ''

    if (!sharedUrl) {
      setStatus('error')
      setMessage('Nothing was shared. Try again.')
      return
    }

    async function process() {
      try {
        const res = await fetch('/api/import-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: sharedUrl }),
        })
        const data = await res.json()

        if (!res.ok) {
          setStatus('error')
          setMessage(data.error || 'Could not import that link.')
          return
        }

        const title = data.recipe?.title || 'Post'
        if (data.full) {
          setMessage(`Saved "${title}" with full recipe!`)
        } else {
          setMessage(`Saved "${title}" as a bookmark — open it to add details.`)
        }
        setStatus('success')
        setTimeout(() => router.push('/recipes'), 2500)
      } catch {
        setStatus('error')
        setMessage('Something went wrong — try again.')
      }
    }

    process()
  }, [params, router])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem', textAlign: 'center', padding: '0 1.5rem' }}>
      {status === 'loading' && (
        <Loader2 size={40} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--lavender)' }} />
      )}
      {status === 'success' && <CheckCircle size={40} style={{ color: 'var(--olive)' }} />}
      {status === 'error' && <AlertCircle size={40} style={{ color: 'var(--terracotta)' }} />}
      <p style={{ fontSize: '1rem', color: 'var(--ink-light)', maxWidth: '300px', lineHeight: 1.6 }}>{message}</p>
      {status === 'error' && (
        <button className="btn-secondary" onClick={() => router.push('/recipes')}>
          Go to Recipes
        </button>
      )}
    </div>
  )
}

export default function ShareTargetPage() {
  return (
    <Suspense>
      <ShareTargetInner />
    </Suspense>
  )
}
