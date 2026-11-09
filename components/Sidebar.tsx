'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Calendar, Home, Settings, Mail } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import PieIcon from './icons/PieIcon'

const NAV = [
  { href: '/dashboard',   icon: Home,     label: 'Home' },
  { href: '/recipes',     icon: BookOpen, label: 'Recipes' },
  { href: '/plan',        icon: Calendar, label: 'Meal Plan' },
  { href: '/digest',      icon: Mail,     label: 'Digest' },
  { href: '/preferences', icon: Settings, label: 'Preferences' },
]

export default function Sidebar({ unreadDigests = 0 }: { unreadDigests?: number }) {
  const path = usePathname()
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
          <PieIcon size={40} />
          <span style={{ lineHeight: 1 }}>Pie <span>Safe</span></span>
        </div>
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <button className={`nav-item${path === href ? ' active' : ''}`}>
              <Icon size={15} />
              <span style={{ flex: 1 }}>{label}</span>
              {href === '/digest' && unreadDigests > 0 && path !== href && (
                <span style={{
                  background: 'var(--ochre)',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  lineHeight: 1.4,
                  minWidth: '18px',
                  textAlign: 'center',
                }}>
                  {unreadDigests > 9 ? '9+' : unreadDigests}
                </span>
              )}
            </button>
          </Link>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <UserButton />
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="bottom-nav">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none', flex: 1 }}>
            <div className={`bottom-nav-item${path === href ? ' active' : ''}`}
              style={{ position: 'relative' }}>
              <Icon size={22} />
              {href === '/digest' && unreadDigests > 0 && path !== href && (
                <span style={{
                  position: 'absolute',
                  top: 2, right: '20%',
                  background: 'var(--ochre)',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  padding: '0.05rem 0.35rem',
                  lineHeight: 1.4,
                }}>
                  {unreadDigests > 9 ? '9+' : unreadDigests}
                </span>
              )}
              <span>{label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </>
  )
}
