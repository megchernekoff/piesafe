'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Calendar, Home, Settings } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import PieIcon from './icons/PieIcon'

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
      <div className="sidebar-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
        <PieIcon size={40} />
        <span style={{ lineHeight: 1 }}>Pie <span>Safe</span></span>
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
