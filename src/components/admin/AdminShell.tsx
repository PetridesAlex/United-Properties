import {useEffect, useMemo, useState} from 'react'
import {Link, NavLink, Outlet, useLocation, useNavigate} from 'react-router-dom'
import {
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  Image as ImageIcon,
  Inbox,
  Menu,
  Plus,
  Settings,
  Share2,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import {resolveAdminDisplay} from '../../lib/auth/displayName'
import {useAgentQuote} from '../../lib/admin/agentQuotes'
import {supabase} from '../../lib/supabase/client'
import './AdminShell.css'

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  accent?: boolean
  badgeKey?: 'enquiries'
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const MOBILE_NAV_LEFT = [
  {to: '/admin', label: 'Home', icon: LayoutDashboard, end: true},
  {to: '/admin/properties', label: 'Listings', icon: Building2},
] as const

const MOBILE_NAV_RIGHT = [
  {to: '/admin/enquiries', label: 'Inbox', icon: Inbox, badgeKey: 'enquiries' as const},
] as const

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true},
      {to: '/admin/calendar', label: 'Calendar', icon: CalendarDays},
    ],
  },
  {
    label: 'Inventory',
    items: [
      {to: '/admin/properties', label: 'Properties', icon: Building2},
      {to: '/admin/properties/new', label: 'Add Property', icon: Plus, accent: true},
    ],
  },
  {
    label: 'Website',
    items: [
      {to: '/admin/content', label: 'Website Content', icon: FileText},
      {to: '/admin/media', label: 'Media', icon: ImageIcon},
    ],
  },
  {
    label: 'Clients & channels',
    items: [
      {to: '/admin/enquiries', label: 'Enquiries', icon: Inbox, badgeKey: 'enquiries'},
      {to: '/admin/bazaraki', label: 'Bazaraki', icon: Share2},
    ],
  },
  {
    label: 'System',
    items: [{to: '/admin/settings', label: 'Settings', icon: Settings}],
  },
]

function roleLabel(role?: string | null) {
  if (!role) return 'Staff'
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function useCyprusClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return useMemo(() => {
    const hour = Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Nicosia',
        hour: 'numeric',
        hour12: false,
      }).format(now),
    )

    return {
      greeting: greetingForHour(hour),
      time: new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Nicosia',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now),
      date: new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Nicosia',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(now),
      timezone: 'Cyprus · EET/EEST',
    }
  }, [now])
}

export default function AdminShell() {
  const {profile, signOut} = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [newEnquiries, setNewEnquiries] = useState(0)
  const [navOpen, setNavOpen] = useState(false)
  const clock = useCyprusClock()
  const agentQuote = useAgentQuote(7200)

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [navOpen])

  useEffect(() => {
    let cancelled = false
    async function loadBadge() {
      if (!supabase) return
      const {count, error} = await supabase
        .from('inquiries')
        .select('*', {count: 'exact', head: true})
        .eq('status', 'new')
      if (!cancelled && !error) setNewEnquiries(count ?? 0)
    }
    void loadBadge()
    const id = window.setInterval(() => void loadBadge(), 60000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  async function onLogout() {
    await signOut()
    navigate('/admin/login', {replace: true})
  }

  const display = resolveAdminDisplay(profile)
  const displayName = profile?.full_name?.trim() || display.firstName
  const firstName = display.firstName
  const shownRole = display.roleLabel || roleLabel(profile?.role)
  const initials = displayName
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

  return (
    <div className={`admin-shell${navOpen ? ' is-nav-open' : ''}`}>
      <header className="admin-shell__mobile-top">
        <div className="admin-shell__mobile-topbar">
          <button
            type="button"
            className="admin-shell__icon-btn"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            {navOpen ? <X size={22} strokeWidth={1.85} /> : <Menu size={22} strokeWidth={1.85} />}
          </button>

          <Link to="/admin" className="admin-shell__mobile-brand" onClick={() => setNavOpen(false)}>
            <img
              src="/images/logo/United_Properties_v2.1.svg"
              alt="United Properties"
              className="admin-shell__mobile-logo"
            />
          </Link>

          <Link
            to="/admin/properties/new"
            className="admin-shell__mobile-add"
            aria-label="Add property"
            onClick={() => setNavOpen(false)}
          >
            <Plus size={20} strokeWidth={2.1} />
          </Link>
        </div>

        <div className="admin-shell__mobile-greeting" aria-label="Signed in user">
          <span className="admin-shell__mobile-avatar" aria-hidden>
            {initials || 'UP'}
          </span>
          <div className="admin-shell__mobile-greeting-copy">
            <span className="admin-shell__mobile-greeting-label">
              <span className="admin-shell__mobile-live-dot" aria-hidden />
              Quote of the day
            </span>
            <p key={agentQuote.tick} className="admin-shell__mobile-quote" aria-live="polite">
              {agentQuote.quote}
            </p>
          </div>
          <button
            type="button"
            className={`admin-shell__mobile-calendar${location.pathname.startsWith('/admin/calendar') ? ' is-active' : ''}`}
            aria-label={location.pathname.startsWith('/admin/calendar') ? 'Close calendar' : 'Open calendar'}
            aria-pressed={location.pathname.startsWith('/admin/calendar')}
            onClick={() => {
              setNavOpen(false)
              if (location.pathname.startsWith('/admin/calendar')) {
                navigate('/admin')
              } else {
                navigate('/admin/calendar')
              }
            }}
          >
            {location.pathname.startsWith('/admin/calendar') ? (
              <X size={18} strokeWidth={1.9} aria-hidden />
            ) : (
              <CalendarDays size={18} strokeWidth={1.9} aria-hidden />
            )}
          </button>
        </div>
      </header>

      <button
        type="button"
        className="admin-shell__backdrop"
        aria-label="Close menu"
        tabIndex={navOpen ? 0 : -1}
        onClick={() => setNavOpen(false)}
      />

      <aside className="admin-shell__sidebar">
        <div className="admin-shell__drawer-head">
          <p className="admin-shell__drawer-title">Menu</p>
          <button
            type="button"
            className="admin-shell__icon-btn admin-shell__drawer-close"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            <X size={20} strokeWidth={1.85} />
          </button>
        </div>

        <div className="admin-shell__brand">
          <Link to="/admin" className="admin-shell__brand-link" onClick={() => setNavOpen(false)}>
            <img
              src="/images/logo/United_Properties_v2.1.svg"
              alt="United Properties"
              className="admin-shell__logo"
            />
          </Link>
        </div>

        <div className="admin-shell__welcome">
          <div className="admin-shell__welcome-head">
            <span className="admin-shell__welcome-avatar" aria-hidden>
              {initials || 'UP'}
            </span>
            <div className="admin-shell__welcome-copy">
              <p className="admin-shell__welcome-greeting">
                <Sparkles size={13} aria-hidden />
                {clock.greeting},
              </p>
              <p className="admin-shell__welcome-name">{firstName}</p>
              <p className="admin-shell__welcome-sub">{shownRole}</p>
            </div>
          </div>

          <div className="admin-shell__clock" aria-live="polite">
            <div className="admin-shell__clock-icon" aria-hidden>
              <Clock3 size={15} strokeWidth={1.85} />
            </div>
            <div className="admin-shell__clock-copy">
              <time className="admin-shell__clock-time">{clock.time}</time>
              <span className="admin-shell__clock-date">{clock.date}</span>
              <span className="admin-shell__clock-zone">{clock.timezone}</span>
            </div>
          </div>

          <div className="admin-shell__insights">
            <span className="admin-shell__status-pill">
              <span className="admin-shell__status-dot" aria-hidden />
              CRM online
            </span>
            {newEnquiries > 0 ? (
              <Link className="admin-shell__insight-chip" to="/admin/enquiries">
                <Inbox size={13} aria-hidden />
                {newEnquiries} new {newEnquiries === 1 ? 'enquiry' : 'enquiries'}
              </Link>
            ) : (
              <span className="admin-shell__insight-chip admin-shell__insight-chip--muted">
                Inbox clear
              </span>
            )}
          </div>
        </div>

        <nav className="admin-shell__nav" aria-label="Admin">
          {NAV_GROUPS.map((group) => (
            <div className="admin-shell__group" key={group.label}>
              <p className="admin-shell__group-label">{group.label}</p>
              <div className="admin-shell__group-links">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setNavOpen(false)}
                    className={({isActive}) =>
                      [
                        'admin-shell__link',
                        isActive ? 'is-active' : '',
                        item.accent ? 'is-accent' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')
                    }
                  >
                    <span className="admin-shell__link-icon" aria-hidden>
                      <item.icon size={17} strokeWidth={1.85} />
                    </span>
                    <span className="admin-shell__link-label">{item.label}</span>
                    {item.badgeKey === 'enquiries' && newEnquiries > 0 ? (
                      <span className="admin-shell__badge" aria-label={`${newEnquiries} new enquiries`}>
                        {newEnquiries > 99 ? '99+' : newEnquiries}
                      </span>
                    ) : null}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="admin-shell__footer">
          <a className="admin-shell__site-link" href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={14} aria-hidden />
            View live website
          </a>

          <div className="admin-shell__user-card">
            <span className="admin-shell__avatar" aria-hidden>
              {initials || 'UP'}
            </span>
            <div className="admin-shell__user-meta">
              <p className="admin-shell__user-name">{displayName}</p>
              <p className="admin-shell__user-role">
                <span className="admin-shell__user-live" aria-hidden />
                {shownRole}
              </p>
            </div>
            <span className="admin-shell__user-status">Online</span>
          </div>

          <button type="button" className="admin-shell__logout" onClick={() => void onLogout()}>
            <LogOut size={16} aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-shell__main">
        <Outlet />
      </div>

      <nav className="admin-shell__bottom-nav" aria-label="Quick navigation">
        <div className="admin-shell__bottom-track">
          {MOBILE_NAV_LEFT.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({isActive}) =>
                ['admin-shell__bottom-link', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
              }
            >
              <span className="admin-shell__bottom-icon" aria-hidden>
                <item.icon size={20} strokeWidth={1.85} />
              </span>
              <span className="admin-shell__bottom-label">{item.label}</span>
            </NavLink>
          ))}

          <NavLink
            to="/admin/properties/new"
            className={({isActive}) =>
              ['admin-shell__bottom-fab', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
            }
            aria-label="Add property"
          >
            <Plus size={24} strokeWidth={2.15} />
          </NavLink>

          {MOBILE_NAV_RIGHT.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({isActive}) =>
                ['admin-shell__bottom-link', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
              }
            >
              <span className="admin-shell__bottom-icon" aria-hidden>
                <item.icon size={20} strokeWidth={1.85} />
              </span>
              <span className="admin-shell__bottom-label">{item.label}</span>
              {item.badgeKey === 'enquiries' && newEnquiries > 0 ? (
                <span className="admin-shell__bottom-badge" aria-label={`${newEnquiries} new enquiries`}>
                  {newEnquiries > 9 ? '9+' : newEnquiries}
                </span>
              ) : null}
            </NavLink>
          ))}

          <button
            type="button"
            className={`admin-shell__bottom-link admin-shell__bottom-menu${navOpen ? ' is-active' : ''}`}
            aria-label="Open full menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            <span className="admin-shell__bottom-icon" aria-hidden>
              <Menu size={20} strokeWidth={1.85} />
            </span>
            <span className="admin-shell__bottom-label">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
