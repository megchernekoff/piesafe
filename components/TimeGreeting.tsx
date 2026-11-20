'use client'

export default function TimeGreeting({ name }: { name: string | null }) {
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return <>{greeting}{name ? `, ${name}` : ''}</>
}
