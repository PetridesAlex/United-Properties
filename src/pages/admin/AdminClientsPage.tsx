import {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {Mail, Phone, Plus, Search, Trash2, Users} from 'lucide-react'
import toast from 'react-hot-toast'
import {deleteClient, fetchAdminClients} from '../../lib/clients/api'
import {
  CLIENT_SOURCE_LABELS,
  CLIENT_STATUS_LABELS,
  clientInitials,
  formatClientName,
} from '../../lib/clients/types'
import type {Client, ClientSource, ClientStatus} from '../../types/cms'
import '../../components/admin/AdminShell.css'
import './AdminClientsPage.css'

type StatusTab = 'all' | ClientStatus

const TABS: StatusTab[] = ['all', 'active', 'archived']

const TAB_LABELS: Record<StatusTab, string> = {
  all: 'All',
  active: 'Active',
  archived: 'Archived',
}

function formatWhen(iso: string | null) {
  if (!iso) return 'No contact yet'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export default function AdminClientsPage() {
  const [tab, setTab] = useState<StatusTab>('active')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await fetchAdminClients({search})
        if (!cancelled) setRows(data)
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : 'Failed to load clients')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [search])

  const counts = useMemo(() => {
    return {
      all: rows.length,
      active: rows.filter((r) => r.status === 'active').length,
      archived: rows.filter((r) => r.status === 'archived').length,
    }
  }, [rows])

  const visible = useMemo(() => {
    if (tab === 'all') return rows
    return rows.filter((r) => r.status === tab)
  }, [rows, tab])

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteClient(pendingDelete.id)
      setRows((prev) => prev.filter((row) => row.id !== pendingDelete.id))
      toast.success(`${formatClientName(pendingDelete)} deleted`)
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete client')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="admin-page clients-admin">
      <header className="clients-admin__hero">
        <div>
          <p className="clients-admin__eyebrow">
            <Users size={13} aria-hidden />
            CRM
          </p>
          <h1>Clients</h1>
          <p className="clients-admin__lede">
            Contact profiles from website submissions and manual entries — name, email, phone, and
            enquiry history.
          </p>
        </div>
        <Link className="admin-btn admin-btn--gold" to="/admin/clients/new">
          <Plus size={16} aria-hidden />
          Add client
        </Link>
      </header>

      <div className="clients-admin__toolbar">
        <div className="clients-admin__tabs" role="tablist" aria-label="Client status">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`clients-admin__tab${tab === key ? ' is-active' : ''}`}
              onClick={() => setTab(key)}
            >
              {TAB_LABELS[key]}
              <span className="clients-admin__tab-count">{counts[key]}</span>
            </button>
          ))}
        </div>
        <label className="clients-admin__search">
          <Search size={16} aria-hidden />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            aria-label="Search clients"
          />
        </label>
      </div>

      {loading ? <p className="admin-empty">Loading clients…</p> : null}

      {!loading && visible.length === 0 ? (
        <div className="clients-admin__empty">
          <Users size={28} aria-hidden />
          <p>No clients yet. Website enquiries create profiles automatically.</p>
          <Link className="admin-btn admin-btn--gold" to="/admin/clients/new">
            Add client manually
          </Link>
        </div>
      ) : null}

      {!loading && visible.length > 0 ? (
        <ul className="clients-admin__list">
          {visible.map((row) => {
            const name = formatClientName(row)
            return (
              <li key={row.id} className="clients-admin__item">
                <Link to={`/admin/clients/${row.id}/edit`} className="clients-admin__card">
                  <span className="clients-admin__avatar" aria-hidden>
                    {clientInitials(row)}
                  </span>
                  <span className="clients-admin__body">
                    <span className="clients-admin__top">
                      <strong className="clients-admin__name">{name}</strong>
                      <span className={`clients-admin__status clients-admin__status--${row.status}`}>
                        {CLIENT_STATUS_LABELS[(row.status as ClientStatus) || 'active'] ?? row.status}
                      </span>
                    </span>
                    <span className="clients-admin__meta">
                      {row.email ? (
                        <span>
                          <Mail size={13} aria-hidden />
                          {row.email}
                        </span>
                      ) : null}
                      {row.phone ? (
                        <span>
                          <Phone size={13} aria-hidden />
                          {row.phone}
                        </span>
                      ) : null}
                    </span>
                    <span className="clients-admin__foot">
                      <em>
                        {CLIENT_SOURCE_LABELS[(row.source as ClientSource) || 'website'] ?? row.source}
                      </em>
                      <span>Last contact {formatWhen(row.last_contact_at)}</span>
                      <span>
                        {row.enquiry_count ?? 0} enquir
                        {(row.enquiry_count ?? 0) === 1 ? 'y' : 'ies'}
                      </span>
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger clients-admin__delete"
                  aria-label={`Delete ${name}`}
                  onClick={() => setPendingDelete(row)}
                >
                  <Trash2 size={14} aria-hidden />
                  Delete
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {pendingDelete ? (
        <div
          className="clients-admin__overlay"
          role="presentation"
          onClick={() => {
            if (!deleting) setPendingDelete(null)
          }}
        >
          <div
            className="clients-admin__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-client-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-client-title">Delete this client?</h2>
            <p>
              <strong>{formatClientName(pendingDelete)}</strong>
              {pendingDelete.email ? ` — ${pendingDelete.email}` : null}
            </p>
            <p>
              This permanently removes the client profile. Linked enquiries stay in the inbox, but
              they will no longer be attached to this contact. This cannot be undone.
            </p>
            <div className="admin-actions">
              <button
                type="button"
                className="admin-btn admin-btn--danger"
                disabled={deleting}
                onClick={() => void confirmDelete()}
              >
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                disabled={deleting}
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
