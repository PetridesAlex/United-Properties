import {useEffect, useMemo, useState} from 'react'
import toast from 'react-hot-toast'
import {Link} from 'react-router-dom'
import {Clock3, Home, Inbox, Mail, MessageSquare, Phone, Search} from 'lucide-react'
import {WhatsAppBrandIcon} from '../../components/Navbar/SocialBrandIcons'
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

function prefersChannel(preferred: string | null, channel: 'email' | 'phone' | 'whatsapp') {
  if (!preferred) return false
  const value = preferred.toLowerCase()
  if (channel === 'email') return value.includes('email') || value.includes('mail')
  if (channel === 'phone') return value.includes('phone') || value.includes('call')
  if (channel === 'whatsapp') return value.includes('whatsapp') || value.includes('whats')
  return false
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return null
}

function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('357') && digits.length >= 11) {
    return `+357 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }
  if (digits.length >= 10) {
    return phone.trim().startsWith('+') ? phone.trim() : `+${digits}`
  }
  return phone.trim()
}

function formatPreferredContact(value: string | null) {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized.includes('whatsapp') || normalized.includes('whats')) return 'WhatsApp'
  if (normalized.includes('email') || normalized.includes('mail')) return 'Email'
  if (normalized.includes('phone') || normalized.includes('call')) return 'Phone call'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function telHref(phone: string) {
  const trimmed = phone.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('tel:')) return trimmed
  const normalized = trimmed.replace(/[^\d+]/g, '')
  return normalized.startsWith('+') ? `tel:${normalized}` : `tel:${normalized}`
}

function whatsAppDigits(phone: string) {
  return phone.replace(/\D/g, '')
}

function whatsAppHref(phone: string, row: Inquiry) {
  const digits = whatsAppDigits(phone)
  if (!digits) return ''
  const interest = row.property_interest || row.subject || 'your enquiry'
  const firstName = row.full_name.trim().split(/\s+/)[0] || row.full_name
  const text = `Hi ${firstName}, thank you for contacting United Properties about ${interest}. `
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

function replyMailto(row: Inquiry) {
  const interest = row.property_interest || row.subject || 'your enquiry'
  const firstName = row.full_name.trim().split(/\s+/)[0] || row.full_name
  const subject = `Re: ${interest} — United Properties`
  const body = [
    `Hi ${firstName},`,
    '',
    `Thank you for contacting United Properties regarding ${interest}.`,
    '',
    row.message ? `Your message:\n"${row.message}"` : '',
    row.message ? '' : '',
    'Kind regards,',
    'United Properties',
  ]
    .filter((line, index, arr) => !(line === '' && arr[index + 1] === ''))
    .join('\n')

  return `mailto:${row.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
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
      <header className="enq-admin__hero">
        <p className="enq-admin__eyebrow">
          <Inbox size={13} strokeWidth={2} aria-hidden />
          Client inbox
        </p>

        <div className="enq-admin__hero-main">
          <div className="enq-admin__hero-title">
            <h1>Enquiries</h1>
            <p className="enq-admin__lede">
              Review website and property enquiries, then mark them contacted or closed.
            </p>
          </div>

          <div className="enq-admin__summary" aria-label="Inbox summary">
            <article className="enq-admin__summary-card enq-admin__summary-card--new">
              <span className="enq-admin__summary-label">New</span>
              <strong>{counts.new}</strong>
            </article>
            <article className="enq-admin__summary-card enq-admin__summary-card--open">
              <span className="enq-admin__summary-label">Open</span>
              <strong>{counts.new + counts.contacted}</strong>
            </article>
            <article className="enq-admin__summary-card enq-admin__summary-card--total">
              <span className="enq-admin__summary-label">Total</span>
              <strong>{counts.all}</strong>
            </article>
          </div>
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
              const relativeTime = formatRelativeTime(row.created_at)
              const fullDate = new Date(row.created_at).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              const preferredLabel = formatPreferredContact(row.preferred_contact)
              const interestLabel = row.property_interest || row.subject || 'General enquiry'
              const phoneDisplay = row.phone ? formatPhoneDisplay(row.phone) : null

              return (
                <li key={row.id} className={`enq-admin__card status-${statusClass(row.status)}`}>
                  <div className="enq-admin__card-header">
                    <div className="enq-admin__profile">
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
                        <div className="enq-admin__meta">
                          {relativeTime ? (
                            <span className="enq-admin__meta-chip enq-admin__meta-chip--time">
                              <Clock3 size={12} aria-hidden />
                              {relativeTime}
                            </span>
                          ) : null}
                          <span className="enq-admin__meta-date">{fullDate}</span>
                          {preferredLabel ? (
                            <span className="enq-admin__meta-chip enq-admin__meta-chip--pref">
                              Prefers {preferredLabel}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="enq-admin__contact-hub">
                    <a
                      className={`enq-admin__hub-btn enq-admin__hub-btn--email${
                        prefersChannel(row.preferred_contact, 'email') ? ' is-preferred' : ''
                      }`}
                      href={replyMailto(row)}
                    >
                      <span className="enq-admin__hub-icon" aria-hidden>
                        <Mail size={18} strokeWidth={1.85} />
                      </span>
                      <span className="enq-admin__hub-copy">
                        <strong>Email</strong>
                        <small>{row.email}</small>
                      </span>
                    </a>

                    {row.phone ? (
                      <>
                        <a
                          className={`enq-admin__hub-btn enq-admin__hub-btn--phone${
                            prefersChannel(row.preferred_contact, 'phone') ? ' is-preferred' : ''
                          }`}
                          href={telHref(row.phone)}
                        >
                          <span className="enq-admin__hub-icon" aria-hidden>
                            <Phone size={18} strokeWidth={1.85} />
                          </span>
                          <span className="enq-admin__hub-copy">
                            <strong>Call</strong>
                            <small>{phoneDisplay}</small>
                          </span>
                        </a>

                        <a
                          className={`enq-admin__hub-btn enq-admin__hub-btn--whatsapp${
                            prefersChannel(row.preferred_contact, 'whatsapp') ? ' is-preferred' : ''
                          }`}
                          href={whatsAppHref(row.phone, row)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span className="enq-admin__hub-icon" aria-hidden>
                            <WhatsAppBrandIcon size={18} className="" aria-hidden />
                          </span>
                          <span className="enq-admin__hub-copy">
                            <strong>WhatsApp</strong>
                            <small>Message {row.full_name.split(/\s+/)[0]}</small>
                          </span>
                        </a>
                      </>
                    ) : null}
                  </div>

                  <div className="enq-admin__interest-banner">
                    <span className="enq-admin__interest-icon" aria-hidden>
                      <Home size={16} strokeWidth={1.85} />
                    </span>
                    <div className="enq-admin__interest-copy">
                      <span>Interest</span>
                      {row.property_id ? (
                        <Link to={`/admin/properties/${row.property_id}/edit`}>Linked property</Link>
                      ) : (
                        <strong>{interestLabel}</strong>
                      )}
                    </div>
                    {row.client_id ? (
                      <Link className="enq-admin__client-link" to={`/admin/clients/${row.client_id}/edit`}>
                        View client profile
                      </Link>
                    ) : null}
                  </div>

                  {row.message ? (
                    <div className="enq-admin__message">
                      <div className="enq-admin__message-head">
                        <MessageSquare size={14} aria-hidden />
                        <span>Message</span>
                      </div>
                      <blockquote className={expanded || !longMessage ? '' : 'is-clamped'}>
                        {row.message}
                      </blockquote>
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
                  ) : null}

                  <div className="enq-admin__footer">
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
                    <div className="enq-admin__footer-actions">
                      <a className="admin-btn admin-btn--gold" href={replyMailto(row)}>
                        <Mail size={15} aria-hidden />
                        Reply
                      </a>
                      {row.phone ? (
                        <a
                          className="admin-btn admin-btn--ghost enq-admin__btn-whatsapp"
                          href={whatsAppHref(row.phone, row)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <WhatsAppBrandIcon size={15} className="" aria-hidden />
                          WhatsApp
                        </a>
                      ) : null}
                    </div>
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
