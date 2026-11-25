'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Calendar, Home, Settings, Mail, Share2 } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import PieIcon from './icons/PieIcon'
import InstallBanner from './InstallBanner'

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
          <Link key={href} href={href} style={{ textDecoration: 'none' }}
            data-tour={href === '/recipes' ? 'recipes' : href === '/plan' ? 'plan' : href === '/digest' ? 'digest' : undefined}>
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
          <button className="nav-item" style={{ width: '100%', marginBottom: '0.25rem' }}
            onClick={async () => {
              const text = "I've been using Pie Safe for meal planning and thought you'd love it. You can use it to import recipes from anywhere and make meal plans for the week. Give it a try! https://pie-safe.com"
              if (typeof navigator.share === 'function') {
                try { await navigator.share({ title: 'Join me on Pie Safe', text, url: 'https://pie-safe.com' }); return } catch { /* cancelled */ }
              }
              navigator.clipboard.writeText(text)
            }}>
            <Share2 size={15} />
            <span style={{ flex: 1 }}>Invite a friend</span>
          </button>
          <InstallBanner />
          <div style={{ marginTop: '0.75rem' }}>
            <UserButton />
          </div>
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
