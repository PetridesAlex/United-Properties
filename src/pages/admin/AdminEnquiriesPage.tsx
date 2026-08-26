import {useEffect, useMemo, useState} from 'react'
import toast from 'react-hot-toast'
import {Link} from 'react-router-dom'
import {Mail, Phone, Search} from 'lucide-react'
import {supabase} from '../../lib/supabase/client'
import type {Inquiry} from '../../types/cms'
import '../../components/admin/AdminShell.css'
import './AdminEnquiriesPage.css'

type StatusFilter = 'all' | 'new' | 'contacted' | 'closed'

const STATUS_LABELS: Record<Exclude<StatusFilter, 'all'>, string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
}

function statusClass(status: string) {
  if (status === 'new') return 'is-new'
  if (status === 'contacted') return 'is-contacted'
  return 'is-closed'
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export default function AdminEnquiriesPage() {
  const [rows, setRows] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!supabase) {
        setLoading(false)
        return
      }
      const {data, error} = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', {ascending: false})
        .limit(100)
      if (error) toast.error(error.message)
      if (!cancelled) {
        setRows((data ?? []) as Inquiry[])
        setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const counts = useMemo(() => {
    return {
      all: rows.length,
      new: rows.filter((r) => r.status === 'new').length,
      contacted: rows.filter((r) => r.status === 'contacted').length,
      closed: rows.filter((r) => r.status === 'closed').length,
    }
  }, [rows])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (filter !== 'all' && row.status !== filter) return false
      if (!q) return true
      return [row.full_name, row.email, row.phone, row.property_interest, row.message, row.subject]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [rows, filter, search])

  async function setStatus(id: string, status: string) {
    if (!supabase) return
    const {error} = await supabase.from('inquiries').update({status}).eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    setRows((prev) => prev.map((row) => (row.id === id ? {...row, status} : row)))
    toast.success(
      status === 'contacted'
        ? 'Marked as contacted'
        : status === 'closed'
          ? 'Enquiry closed'
          : 'Enquiry updated',
    )
  }

  return (
    <div className="admin-page enq-admin">
      <header className="admin-page__header enq-admin__header">
        <div>
          <p className="enq-admin__eyebrow">Client inbox</p>
          <h1>Enquiries</h1>
          <p className="admin-page__lede">
            Review website and property enquiries, then mark them contacted or closed.
          </p>
        </div>
        <div className="enq-admin__summary">
          <article>
            <span>New</span>
            <strong>{counts.new}</strong>
          </article>
          <article>
            <span>Open</span>
            <strong>{counts.new + counts.contacted}</strong>
          </article>
          <article>
            <span>Total</span>
            <strong>{counts.all}</strong>
          </article>
        </div>
      </header>

      <div className="enq-admin__toolbar">
        <div className="enq-admin__tabs" role="tablist" aria-label="Enquiry status">
          {(['all', 'new', 'contacted', 'closed'] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={`enq-admin__tab${filter === key ? ' is-active' : ''}`}
              onClick={() => setFilter(key)}
            >
              <span>{key === 'all' ? 'All' : STATUS_LABELS[key]}</span>
              <em>{counts[key]}</em>
            </button>
          ))}
        </div>

        <label className="enq-admin__search" htmlFor="enquiry-search">
          <Search size={16} aria-hidden />
          <span className="visually-hidden">Search enquiries</span>
          <input
            id="enquiry-search"
            placeholder="Search name, email, phone, or message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <section className="enq-admin__panel">
        {loading ? (
          <p className="admin-empty">Loading enquiries…</p>
        ) : visible.length === 0 ? (
          <div className="enq-admin__empty">
            <p>{rows.length === 0 ? 'No enquiries yet.' : 'No enquiries match this view.'}</p>
          </div>
        ) : (
          <ul className="enq-admin__list">
            {visible.map((row) => {
              const expanded = expandedId === row.id
              const longMessage = (row.message || '').length > 160
              return (
                <li key={row.id} className={`enq-admin__card status-${statusClass(row.status)}`}>
                  <div className="enq-admin__card-top">
                    <span className="enq-admin__avatar" aria-hidden>
                      {initials(row.full_name) || 'UP'}
                    </span>
                    <div className="enq-admin__identity">
                      <div className="enq-admin__name-row">
                        <h2>{row.full_name}</h2>
                        <span className={`enq-admin__status ${statusClass(row.status)}`}>
                          {STATUS_LABELS[(row.status as Exclude<StatusFilter, 'all'>)] ||
                            row.status}
                        </span>
                      </div>
                      <p className="enq-admin__when">
                        {new Date(row.created_at).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {row.preferred_contact ? ` · Prefers ${row.preferred_contact}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="enq-admin__contacts">
                    <a className="enq-admin__contact" href={`mailto:${row.email}`}>
                      <Mail size={14} aria-hidden />
                      {row.email}
                    </a>
                    {row.phone ? (
                      <a className="enq-admin__contact" href={`tel:${row.phone}`}>
                        <Phone size={14} aria-hidden />
                        {row.phone}
                      </a>
                    ) : null}
                  </div>

                  <div className="enq-admin__interest">
                    <span>Interest</span>
                    {row.property_id ? (
                      <Link to={`/admin/properties/${row.property_id}/edit`}>Linked property</Link>
                    ) : (
                      <strong>{row.property_interest || row.subject || 'General enquiry'}</strong>
                    )}
                  </div>

                  <div className="enq-admin__message">
                    <p className={expanded || !longMessage ? '' : 'is-clamped'}>{row.message}</p>
                    {longMessage ? (
                      <button
                        type="button"
                        className="enq-admin__more"
                        onClick={() => setExpandedId(expanded ? null : row.id)}
                      >
                        {expanded ? 'Show less' : 'Read more'}
                      </button>
                    ) : null}
                  </div>

                  <div className="enq-admin__actions">
                    <label className="enq-admin__status-field">
                      <span>Status</span>
                      <select
                        value={row.status}
                        onChange={(e) => void setStatus(row.id, e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </label>
                    <a className="admin-btn admin-btn--gold" href={`mailto:${row.email}`}>
                      Reply by email
                    </a>
                    {row.phone ? (
                      <a className="admin-btn admin-btn--ghost" href={`tel:${row.phone}`}>
                        Call
                      </a>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
