import {useEffect, useState} from 'react'
import {Link, NavLink, Outlet, useNavigate} from 'react-router-dom'
import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Image as ImageIcon,
  Inbox,
  Plus,
  Settings,
  Share2,
  ExternalLink,
} from 'lucide-react'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
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

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true}],
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

export default function AdminShell() {
  const {profile, signOut} = useAdminAuth()
  const navigate = useNavigate()
  const [newEnquiries, setNewEnquiries] = useState(0)

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

  const displayName = profile?.full_name?.trim() || profile?.email || 'Staff'
  const initials = displayName
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">
          <Link to="/admin" className="admin-shell__brand-link">
            <img
              src="/images/logo/United_Properties_v2.1.svg"
              alt="United Properties"
              className="admin-shell__logo"
            />
          </Link>
          <div className="admin-shell__brand-copy">
            <span className="admin-shell__eyebrow">United Properties</span>
            <strong>Command Centre</strong>
            <p>Private staff CMS</p>
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
              <p className="admin-shell__user-role">{roleLabel(profile?.role)}</p>
            </div>
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
    </div>
  )
}
