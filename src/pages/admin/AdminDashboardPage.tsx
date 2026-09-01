import {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Home,
  Inbox,
  KeyRound,
  Layers3,
  MapPin,
  Plus,
  Share2,
  Sparkles,
  Star,
  Tag,
  Users,
} from 'lucide-react'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import {resolveAdminDisplay} from '../../lib/auth/displayName'
import {listUpcomingAppointments} from '../../lib/appointments/storage'
import {APPOINTMENT_TYPE_LABELS} from '../../lib/appointments/types'
import {useAgentQuote} from '../../lib/admin/agentQuotes'
import {fetchRecentClients} from '../../lib/clients/api'
import {clientInitials, formatClientName} from '../../lib/clients/types'
import {countPropertiesByTab, fetchAdminProperties} from '../../lib/properties/api'
import {validatePropertyForBazaraki} from '../../lib/integrations/bazaraki/validatePropertyForBazaraki'
import {supabase} from '../../lib/supabase/client'
import type {Client, Property, PropertyStatus} from '../../types/cms'
import {PROPERTY_STATUS_LABELS} from '../../types/cms'
import '../../components/admin/AdminShell.css'
import './AdminDashboardPage.css'

function statusBadgeClass(status: PropertyStatus) {
  if (status === 'for_sale') return 'admin-badge--sale'
  if (status === 'for_rent') return 'admin-badge--rent'
  if (status === 'sold') return 'admin-badge--sold'
  return 'admin-badge--rented'
}

function thumb(property: Property) {
  const images = [...(property.property_images ?? [])].sort((a, b) => a.position - b.position)
  return images.find((i) => i.is_featured)?.image_url || images[0]?.image_url || ''
}

function attentionReasons(property: Property) {
  const reasons: string[] = []
  if (!property.published) reasons.push('Draft')
  if (!property.property_images?.length) reasons.push('Missing images')
  if (!property.description && !property.short_description) reasons.push('Missing description')
  if (!property.price) reasons.push('Missing price')
  return reasons
}

const INVENTORY_STATS = [
  {label: 'Total', key: 'all', icon: Layers3, tone: 'total'},
  {label: 'For Sale', key: 'for_sale', icon: Tag, tone: 'sale'},
  {label: 'For Rent', key: 'for_rent', icon: KeyRound, tone: 'rent'},
  {label: 'Sold', key: 'sold', icon: CheckCircle2, tone: 'sold'},
  {label: 'Rented', key: 'rented', icon: Home, tone: 'rented'},
  {label: 'Featured', key: 'featured', icon: Star, tone: 'featured'},
] as const

export default function AdminDashboardPage() {
  const {profile} = useAdminAuth()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [recent, setRecent] = useState<Property[]>([])
  const [attention, setAttention] = useState<Property[]>([])
  const [bazarakiReady, setBazarakiReady] = useState(0)
  const [bazarakiError, setBazarakiError] = useState(0)
  const [newEnquiries, setNewEnquiries] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null)
  const [upcomingMeetings, setUpcomingMeetings] = useState(() => listUpcomingAppointments(5))
  const [recentClients, setRecentClients] = useState<Client[]>([])

  useEffect(() => {
    setUpcomingMeetings(listUpcomingAppointments(5))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [nextCounts, list, enquiryCount, clients] = await Promise.all([
          countPropertiesByTab(),
          fetchAdminProperties({pageSize: 8, tab: 'all'}),
          supabase
            ? supabase
                .from('inquiries')
                .select('*', {count: 'exact', head: true})
                .eq('status', 'new')
            : Promise.resolve({count: 0, error: null}),
          fetchRecentClients(5).catch(() => [] as Client[]),
        ])
        if (cancelled) return

        setCounts(nextCounts)
        setRecent(list.rows)
        setNewEnquiries(enquiryCount.count ?? 0)
        setRecentClients(clients)

        const needingAttention = list.rows.filter((p) => attentionReasons(p).length > 0)
        setAttention(needingAttention.slice(0, 6))

        const flagged = list.rows.filter((p) => p.publish_to_bazaraki)
        let ready = 0
        let bad = 0
        for (const p of flagged) {
          const v = validatePropertyForBazaraki(p)
          if (v.ready) ready += 1
          else bad += 1
        }
        setBazarakiReady(ready)
        setBazarakiError(bad)
        setRefreshedAt(new Date())
        setError('')
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    const id = window.setInterval(() => void load(), 60000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const display = useMemo(() => resolveAdminDisplay(profile), [profile])
  const firstName = display.firstName
  const agentQuote = useAgentQuote(7200)

  const spotlight = [
    {
      label: 'Active listings',
      value: counts.active ?? 0,
      hint: 'Live on Buy / Rent',
      to: '/admin/properties?tab=active',
      icon: Home,
    },
    {
      label: 'Drafts',
      value: counts.drafts ?? 0,
      hint: 'Awaiting publish',
      to: '/admin/properties',
      icon: Building2,
    },
    {
      label: 'New enquiries',
      value: newEnquiries,
      hint: 'Need a reply',
      to: '/admin/enquiries',
      icon: Inbox,
    },
    {
      label: 'Bazaraki issues',
      value: bazarakiError,
      hint: `${bazarakiReady} ready`,
      to: '/admin/bazaraki',
      icon: Share2,
    },
  ]

  return (
    <div className="admin-page dash-admin">
      <header className="dash-admin__hero">
        <div>
          <p className="dash-admin__eyebrow">United Properties CMS</p>
          <h1 className="dash-admin__welcome" aria-label={`Welcome, ${firstName}`}>
            <span className="dash-admin__wave" aria-hidden="true">
              👋
            </span>
            <span className="dash-admin__welcome-text">
              Welcome, <em>{firstName}</em>
            </span>
          </h1>
          {refreshedAt ? (
            <p className="dash-admin__freshness">
              Updated {refreshedAt.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}
              {loading ? ' · Refreshing…' : ' · Live'}
            </p>
          ) : null}
        </div>
        <div className="dash-admin__hero-actions">
          <Link className="admin-btn admin-btn--gold" to="/admin/properties/new">
            <Plus size={16} aria-hidden />
            Add Property
          </Link>
          <Link className="admin-btn admin-btn--ghost" to="/admin/calendar">
            <CalendarDays size={16} aria-hidden />
            Calendar
            {upcomingMeetings.length > 0 ? (
              <span className="dash-admin__pill">{upcomingMeetings.length}</span>
            ) : null}
          </Link>
          <Link className="admin-btn admin-btn--ghost" to="/admin/enquiries">
            <Inbox size={16} aria-hidden />
            Enquiries
            {newEnquiries > 0 ? <span className="dash-admin__pill">{newEnquiries}</span> : null}
          </Link>
        </div>
      </header>

      <aside className="dash-admin__quote" aria-label="Quote of the day">
        <span className="dash-admin__quote-label">
          <span className="dash-admin__quote-dot" aria-hidden />
          Quote of the day
        </span>
        <p key={agentQuote.tick} className="dash-admin__quote-text" aria-live="polite">
          {agentQuote.quote}
        </p>
      </aside>

      {upcomingMeetings.length > 0 ? (
        <section className="dash-admin__meetings" aria-label="Upcoming appointments">
          <div className="dash-admin__meetings-head">
            <div>
              <p className="dash-admin__stats-eyebrow">
                <span className="dash-admin__meetings-live" aria-hidden />
                Schedule
              </p>
              <h2 className="dash-admin__stats-title">Upcoming meetings</h2>
            </div>
            <Link to="/admin/calendar" className="dash-admin__meetings-open">
              Open calendar
              <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>
          <ul className="dash-admin__meetings-list">
            {upcomingMeetings.map((row) => {
              const when = new Date(`${row.date}T12:00:00`)
              const dayNum = new Intl.DateTimeFormat('en-GB', {day: 'numeric'}).format(when)
              const monthShort = new Intl.DateTimeFormat('en-GB', {month: 'short'}).format(when)
              const weekday = new Intl.DateTimeFormat('en-GB', {weekday: 'short'}).format(when)
              return (
                <li key={row.id}>
                  <Link to="/admin/calendar" className={`dash-admin__meeting-card dash-admin__meeting-card--${row.type}`}>
                    <span className="dash-admin__meeting-date" aria-hidden>
                      <span className="dash-admin__meeting-day">{dayNum}</span>
                      <span className="dash-admin__meeting-mon">{monthShort}</span>
                    </span>
                    <span className="dash-admin__meeting-body">
                      <span className="dash-admin__meeting-top">
                        <span className="dash-admin__meeting-weekday">{weekday}</span>
                        <span className={`dash-admin__meeting-type dash-admin__meeting-type--${row.type}`}>
                          {APPOINTMENT_TYPE_LABELS[row.type]}
                        </span>
                      </span>
                      <strong className="dash-admin__meeting-title">{row.title}</strong>
                      <span className="dash-admin__meeting-meta">
                        <span>
                          <Clock3 size={13} aria-hidden />
                          {row.startTime}
                          {row.endTime ? ` – ${row.endTime}` : ''}
                        </span>
                        {row.location ? (
                          <span>
                            <MapPin size={13} aria-hidden />
                            {row.location}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {recentClients.length > 0 ? (
        <section className="dash-admin__clients" aria-label="Recent clients">
          <div className="dash-admin__meetings-head">
            <div>
              <p className="dash-admin__stats-eyebrow">
                <Users size={13} aria-hidden />
                CRM
              </p>
              <h2 className="dash-admin__stats-title">Recent clients</h2>
            </div>
            <Link to="/admin/clients" className="dash-admin__meetings-open">
              Open clients
              <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>
          <ul className="dash-admin__clients-list">
            {recentClients.map((row) => (
              <li key={row.id}>
                <Link to={`/admin/clients/${row.id}/edit`} className="dash-admin__client-card">
                  <span className="dash-admin__client-avatar" aria-hidden>
                    {clientInitials(row)}
                  </span>
                  <span className="dash-admin__client-body">
                    <strong>{formatClientName(row)}</strong>
                    <span>{row.email || row.phone || 'No contact yet'}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {error ? <p className="admin-login__error">{error}</p> : null}

      <section className="dash-admin__spotlight" aria-label="Key metrics">
        {spotlight.map((item) => (
          <Link key={item.label} to={item.to} className="dash-admin__spotlight-card">
            <span className="dash-admin__spotlight-icon" aria-hidden>
              <item.icon size={18} />
            </span>
            <span className="dash-admin__spotlight-label">{item.label}</span>
            <strong className="dash-admin__spotlight-value">{item.value}</strong>
            <span className="dash-admin__spotlight-hint">{item.hint}</span>
          </Link>
        ))}
      </section>

      <section className="dash-admin__stats-wrap" aria-label="Inventory breakdown">
        <div className="dash-admin__stats-head">
          <div>
            <p className="dash-admin__stats-eyebrow">Portfolio</p>
            <h2 className="dash-admin__stats-title">Inventory breakdown</h2>
          </div>
          <Link to="/admin/properties" className="dash-admin__stats-link">
            Open inventory <ArrowUpRight size={14} aria-hidden />
          </Link>
        </div>
        <div className="dash-admin__stats">
          {INVENTORY_STATS.map((item) => (
            <Link
              key={item.key}
              to="/admin/properties"
              className={`dash-admin__stat dash-admin__stat--${item.tone}`}
            >
              <span className="dash-admin__stat-icon" aria-hidden>
                <item.icon size={16} strokeWidth={1.85} />
              </span>
              <span className="dash-admin__stat-copy">
                <span className="dash-admin__stat-label">{item.label}</span>
                <strong>{counts[item.key] ?? 0}</strong>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="dash-admin__grid">
        <section className="dash-admin__panel">
          <div className="dash-admin__panel-head">
            <div>
              <h2>Recently updated</h2>
              <p>Latest changes across your inventory.</p>
            </div>
            <Link to="/admin/properties">
              View all <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="dash-admin__empty">
              <p>No properties yet.</p>
              <Link className="admin-btn admin-btn--gold" to="/admin/properties/new">
                Create first listing
              </Link>
            </div>
          ) : (
            <ul className="dash-admin__recent">
              {recent.slice(0, 5).map((p) => {
                const image = thumb(p)
                return (
                  <li key={p.id}>
                    <Link to={`/admin/properties/${p.id}/edit`} className="dash-admin__recent-row">
                      <span className="dash-admin__recent-media">
                        {image ? <img src={image} alt="" /> : <span>UP</span>}
                      </span>
                      <span className="dash-admin__recent-copy">
                        <em>{p.reference_number}</em>
                        <strong>{p.title}</strong>
                        <span>
                          {[p.area, p.city].filter(Boolean).join(', ') || 'Location TBC'}
                        </span>
                      </span>
                      <span className="dash-admin__recent-side">
                        <span className={`admin-badge ${statusBadgeClass(p.status)}`}>
                          {PROPERTY_STATUS_LABELS[p.status]}
                        </span>
                        <time dateTime={p.updated_at}>
                          {new Date(p.updated_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </time>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section
          className={`dash-admin__panel dash-admin__panel--attention${attention.length ? ' has-items' : ''}`}
        >
          <div className="dash-admin__panel-head">
            <div>
              <p className="dash-admin__panel-eyebrow">Action required</p>
              <h2>Needs attention</h2>
              <p>Listings that are incomplete or unpublished.</p>
            </div>
            {attention.length === 0 ? (
              <span className="dash-admin__ok">
                <CheckCircle2 size={14} aria-hidden /> All clear
              </span>
            ) : (
              <span className="dash-admin__warn">
                <AlertTriangle size={14} aria-hidden /> {attention.length} item
                {attention.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {attention.length === 0 ? (
            <div className="dash-admin__empty dash-admin__empty--soft">
              <CheckCircle2 size={22} aria-hidden />
              <p>All recent properties look complete.</p>
            </div>
          ) : (
            <ul className="dash-admin__attention">
              {attention.map((p, index) => {
                const image = thumb(p)
                const reasons = attentionReasons(p)
                return (
                  <li key={p.id}>
                    <Link to={`/admin/properties/${p.id}/edit`} className="dash-admin__attention-row">
                      <span className="dash-admin__attention-rank" aria-hidden>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="dash-admin__attention-media">
                        {image ? <img src={image} alt="" /> : <span>UP</span>}
                      </span>
                      <span className="dash-admin__attention-copy">
                        <em>{p.reference_number || 'Draft listing'}</em>
                        <strong>{p.title}</strong>
                        <span>
                          {[p.area, p.city].filter(Boolean).join(', ') || 'Location TBC'}
                        </span>
                      </span>
                      <span className="dash-admin__chips">
                        {reasons.map((reason) => (
                          <em
                            key={reason}
                            className={
                              reason === 'Draft'
                                ? 'is-draft'
                                : reason.startsWith('Missing')
                                  ? 'is-missing'
                                  : ''
                            }
                          >
                            {reason}
                          </em>
                        ))}
                      </span>
                      <ArrowUpRight className="dash-admin__attention-arrow" size={16} aria-hidden />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="dash-admin__panel dash-admin__panel--wide">
        <div className="dash-admin__panel-head">
          <div>
            <h2>Quick actions</h2>
            <p>Common workflows for the team.</p>
          </div>
        </div>
        <div className="dash-admin__actions">
          <Link to="/admin/properties/new" className="dash-admin__action">
            <Plus size={18} aria-hidden />
            <span>
              <strong>Add property</strong>
              <em>Create a new sale or rental listing</em>
            </span>
          </Link>
          <Link to="/admin/content" className="dash-admin__action">
            <Sparkles size={18} aria-hidden />
            <span>
              <strong>Edit website copy</strong>
              <em>Update homepage, about, and contact text</em>
            </span>
          </Link>
          <Link to="/admin/bazaraki" className="dash-admin__action">
            <Share2 size={18} aria-hidden />
            <span>
              <strong>Bazaraki readiness</strong>
              <em>
                {bazarakiReady} ready · {bazarakiError} need fixes
              </em>
            </span>
          </Link>
          <Link to="/admin/enquiries" className="dash-admin__action">
            <Inbox size={18} aria-hidden />
            <span>
              <strong>Review enquiries</strong>
              <em>
                {newEnquiries > 0 ? `${newEnquiries} new waiting` : 'Inbox is clear'}
              </em>
            </span>
          </Link>
        </div>
      </section>
    </div>
  )
}
