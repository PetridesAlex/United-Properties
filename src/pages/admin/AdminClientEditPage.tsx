import {useEffect, useState, type FormEvent} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {
  ArrowLeft,
  Clock3,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
  UserRound,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {WhatsAppBrandIcon} from '../../components/Navbar/SocialBrandIcons'
import AdminFormSection from '../../components/admin/AdminFormSection'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import {
  archiveClient,
  createClient,
  deleteClient,
  fetchClientById,
  fetchClientInquiries,
  restoreClient,
  updateClient,
} from '../../lib/clients/api'
import {
  CLIENT_SOURCE_LABELS,
  CLIENT_STATUS_LABELS,
  clientInitials,
  emptyClient,
  formatClientName,
} from '../../lib/clients/types'
import type {Client, ClientSource, ClientStatus, Inquiry} from '../../types/cms'
import '../../components/admin/AdminShell.css'
import './AdminClientEditPage.css'

function telHref(phone: string) {
  const trimmed = phone.trim()
  if (!trimmed) return ''
  const normalized = trimmed.replace(/[^\d+]/g, '')
  return normalized.startsWith('+') ? `tel:${normalized}` : `tel:${normalized}`
}

function whatsAppHref(phone: string, firstName: string) {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  const text = `Hi ${firstName}, thank you for contacting United Properties. `
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

function replyMailto(email: string, firstName: string) {
  const subject = 'United Properties'
  const body = [`Hi ${firstName},`, '', 'Kind regards,', 'United Properties'].join('\n')
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function AdminClientEditPage() {
  const {id} = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const {user} = useAdminAuth()

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [client, setClient] = useState<Client | null>(null)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [draft, setDraft] = useState(() => emptyClient())

  useEffect(() => {
    if (isNew) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const row = await fetchClientById(id!)
        if (!row) {
          toast.error('Client not found')
          navigate('/admin/clients', {replace: true})
          return
        }
        if (cancelled) return
        setClient(row)
        setDraft({
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email ?? '',
          phone: row.phone ?? '',
          notes: row.notes ?? '',
          source: row.source,
          status: row.status,
          last_contact_at: row.last_contact_at,
        })
        setInquiries(await fetchClientInquiries(row.id))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load client')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id, isNew, navigate])

  async function onSave(event: FormEvent) {
    event.preventDefault()
    if (!draft.first_name.trim()) {
      toast.error('First name is required')
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        const created = await createClient(
          {
            ...draft,
            email: draft.email || null,
            phone: draft.phone || null,
            notes: draft.notes || null,
          },
          user?.id,
        )
        toast.success('Client created')
        navigate(`/admin/clients/${created.id}/edit`, {replace: true})
      } else {
        const updated = await updateClient(id!, {
          ...draft,
          email: draft.email || null,
          phone: draft.phone || null,
          notes: draft.notes || null,
          last_contact_at: client?.last_contact_at ?? draft.last_contact_at,
        })
        setClient(updated)
        toast.success('Client saved')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function onArchiveToggle() {
    if (!id || isNew) return
    try {
      const updated =
        client?.status === 'archived' ? await restoreClient(id) : await archiveClient(id)
      setClient(updated)
      setDraft((prev) => ({...prev, status: updated.status}))
      toast.success(updated.status === 'archived' ? 'Client archived' : 'Client restored')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function onDelete() {
    if (!id || isNew || !client) return
    const name = formatClientName(client)
    if (
      !window.confirm(
        `Delete ${name}? Linked enquiries stay in the inbox but will no longer be attached to this contact.`,
      )
    ) {
      return
    }
    setDeleting(true)
    try {
      await deleteClient(id)
      toast.success(`${name} deleted`)
      navigate('/admin/clients', {replace: true})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete client')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <p className="admin-empty">Loading client…</p>

  const displayName = formatClientName({
    first_name: draft.first_name || client?.first_name || '',
    last_name: draft.last_name || client?.last_name || '',
  })
  const firstName = draft.first_name.trim().split(/\s+/)[0] || 'there'
  const email = (draft.email || '').trim()
  const phone = (draft.phone || '').trim()

  return (
    <div className="admin-page client-edit">
      <header className="client-edit__hero">
        <div className="client-edit__hero-bar">
          <Link className="client-edit__back" to="/admin/clients">
            <ArrowLeft size={17} strokeWidth={2} aria-hidden />
            <span>Clients</span>
          </Link>
          {!isNew && client ? (
            <span
              className={`client-edit__status-pill client-edit__status-pill--${client.status}`}
            >
              {CLIENT_STATUS_LABELS[(client.status as ClientStatus) || 'active'] ?? client.status}
            </span>
          ) : null}
        </div>

        <div className="client-edit__identity">
          <span className="client-edit__avatar" aria-hidden>
            {clientInitials({
              first_name: draft.first_name || 'C',
              last_name: draft.last_name || '',
            })}
          </span>
          <div>
            <p className="client-edit__eyebrow">
              <UserRound size={13} aria-hidden />
              {isNew ? 'New client' : 'Client profile'}
            </p>
            <h1>{isNew ? 'Add client' : displayName}</h1>
            {!isNew && client ? (
              <p className="client-edit__sub">
                {CLIENT_SOURCE_LABELS[(client.source as ClientSource) || 'website'] ?? client.source}
                {client.last_contact_at
                  ? ` · Last contact ${new Intl.DateTimeFormat('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(client.last_contact_at))}`
                  : null}
                {client.enquiry_count != null ? ` · ${client.enquiry_count} enquiries` : null}
              </p>
            ) : (
              <p className="client-edit__sub">Save contact details for follow-ups and history.</p>
            )}
          </div>
        </div>

        {!isNew && (email || phone) ? (
          <div className="client-edit__contact-hub">
            {email ? (
              <a className="client-edit__contact-btn" href={replyMailto(email, firstName)}>
                <Mail size={15} aria-hidden />
                Email
              </a>
            ) : null}
            {phone ? (
              <a className="client-edit__contact-btn" href={telHref(phone)}>
                <Phone size={15} aria-hidden />
                Call
              </a>
            ) : null}
            {phone ? (
              <a
                className="client-edit__contact-btn client-edit__contact-btn--wa"
                href={whatsAppHref(phone, firstName)}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppBrandIcon size={15} className="" />
                WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}
      </header>

      <form className="admin-form client-edit__form" onSubmit={onSave}>
        <AdminFormSection
          eyebrow="Contact"
          title="Profile details"
          lede="First name, last name, email, and phone for this client."
        >
          <div className="admin-form__grid">
            <label className="admin-field">
              <span>First name</span>
              <input
                value={draft.first_name}
                onChange={(e) => setDraft((prev) => ({...prev, first_name: e.target.value}))}
                required
                autoComplete="given-name"
              />
            </label>
            <label className="admin-field">
              <span>Last name</span>
              <input
                value={draft.last_name}
                onChange={(e) => setDraft((prev) => ({...prev, last_name: e.target.value}))}
                autoComplete="family-name"
              />
            </label>
            <label className="admin-field">
              <span>Email</span>
              <input
                type="email"
                value={draft.email ?? ''}
                onChange={(e) => setDraft((prev) => ({...prev, email: e.target.value}))}
                autoComplete="email"
              />
            </label>
            <label className="admin-field">
              <span>Phone</span>
              <input
                type="tel"
                value={draft.phone ?? ''}
                onChange={(e) => setDraft((prev) => ({...prev, phone: e.target.value}))}
                autoComplete="tel"
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>Internal notes</span>
              <textarea
                rows={4}
                value={draft.notes ?? ''}
                onChange={(e) => setDraft((prev) => ({...prev, notes: e.target.value}))}
                placeholder="Preferences, budget, follow-up reminders…"
              />
            </label>
          </div>
        </AdminFormSection>

        <div className="admin-actions client-edit__actions">
          {!isNew ? (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void onArchiveToggle()}>
              {client?.status === 'archived' ? 'Restore' : 'Archive'}
            </button>
          ) : null}
          {!isNew ? (
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              disabled={deleting}
              onClick={() => void onDelete()}
            >
              <Trash2 size={14} aria-hidden />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          ) : null}
          <button type="submit" className="admin-btn admin-btn--gold" disabled={saving || deleting}>
            {saving ? 'Saving…' : isNew ? 'Create client' : 'Save changes'}
          </button>
        </div>
      </form>

      {!isNew ? (
        <section className="client-edit__history" aria-label="Enquiry history">
          <div className="client-edit__history-head">
            <p className="client-edit__eyebrow">History</p>
            <h2>Enquiries</h2>
          </div>
          {inquiries.length === 0 ? (
            <p className="admin-empty">No linked website enquiries yet.</p>
          ) : (
            <ul className="client-edit__timeline">
              {inquiries.map((row) => (
                <li key={row.id}>
                  <article className="client-edit__inquiry">
                    <header>
                      <span className="client-edit__inquiry-when">
                        <Clock3 size={13} aria-hidden />
                        {new Intl.DateTimeFormat('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(row.created_at))}
                      </span>
                      <span className={`client-edit__inquiry-status is-${row.status}`}>
                        {row.status}
                      </span>
                    </header>
                    <strong>{row.property_interest || row.subject || 'General enquiry'}</strong>
                    <p>{row.message}</p>
                    <footer>
                      {row.property_id ? (
                        <Link to={`/admin/properties/${row.property_id}/edit`}>Open property</Link>
                      ) : null}
                      <Link to="/admin/enquiries">
                        <MessageSquare size={13} aria-hidden />
                        Inbox
                      </Link>
                    </footer>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  )
}
