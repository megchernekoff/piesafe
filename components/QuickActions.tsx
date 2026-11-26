'use client'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Link2, Sparkles, CalendarDays } from 'lucide-react'

export default function QuickActions() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const tiles = [
    {
      icon: Camera, label: 'Add photo',
      onClick: () => fileInputRef.current?.click(),
    },
    { icon: Link2,       label: 'From URL',    onClick: () => router.push('/recipes?tab=url') },
    { icon: Sparkles,    label: 'From prompt', onClick: () => router.push('/recipes?tab=prompt') },
    { icon: CalendarDays,label: 'Meal plan',   onClick: () => router.push('/plan') },
  ]

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
        style={{ display: 'none' }} onChange={handlePhoto} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
        {tiles.map(({ icon: Icon, label, onClick }) => (
          <button key={label} onClick={onClick} style={{
            background: 'var(--parchment)',
            border: '1px solid var(--stone-dark)',
            borderRadius: 12,
            padding: '1rem 0.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            cursor: 'pointer',
          }}>
            <Icon size={22} style={{ color: 'var(--lavender)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-light)', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
          </button>
        ))}
      </div>
    </>
  )
}
