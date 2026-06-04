'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Calendar, Home, Settings } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

const NAV = [
  { href: '/dashboard', icon: Home,     label: 'Home' },
  { href: '/recipes',   icon: BookOpen, label: 'Recipes' },
  { href: '/plan',      icon: Calendar, label: 'Meal Plan' },
  { href: '/preferences', icon: Settings, label: 'Preferences' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        Pie <span>Safe</span>
      </div>
      {NAV.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href} style={{ textDecoration: 'none' }}>
          <button className={`nav-item${path === href ? ' active' : ''}`}>
            <Icon size={15} />
            {label}
          </button>
        </Link>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <UserButton />
      </div>
    </nav>
  )
}
