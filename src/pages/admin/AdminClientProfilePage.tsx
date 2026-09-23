import {useCallback, useEffect, useMemo, useState, type FormEvent} from 'react'
import {Link, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Building2,
  CalendarClock,
  GitBranch,
  Link2,
  Mail,
  NotebookPen,
  Pencil,
  Phone,
  Plus,
  Search,
  StickyNote,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {WhatsAppBrandIcon} from '../../components/Navbar/SocialBrandIcons'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import {fetchClientActivities} from '../../lib/clients/activity'
import {
  archiveClient,
  fetchClientById,
  fetchClientInquiries,
  restoreClient,
  updateClient,
  updateClientAssignee,
  updateClientStage,
} from '../../lib/clients/api'
import {
  addClientNote,
  fetchClientNotes,
  fetchClientPropertyLinks,
  linkPropertyToClient,
  fetchPropertiesForLink,
  type LinkablePropertyRow,
  unlinkPropertyFromClient,
  updateClientPropertyInterest,
} from '../../lib/clients/links'
import {
  completeFollowUp,
  createFollowUp,
  fetchClientFollowUps,
} from '../../lib/clients/followUps'
import {fetchStaffProfiles, type StaffProfile} from '../../lib/clients/staff'
import {
  CLIENT_FOLLOW_UP_TYPES,
  CLIENT_FOLLOW_UP_TYPE_LABELS,
  CLIENT_FOLLOW_UP_STATUS_LABELS,
  CLIENT_PROCESS_STAGES,
  CLIENT_PROCESS_STAGE_LABELS,
  CLIENT_PROPERTY_INTEREST_STATUSES,
  CLIENT_PROPERTY_INTEREST_LABELS,
  CLIENT_SOURCE_LABELS,
  CLIENT_STATUS_LABELS,
  CLIENT_TYPE_LABELS,
  clientInitials,
  formatClientName,
  formatCrmDate,
  interestLabel,
  stageLabel,
} from '../../lib/clients/types'
import type {
  Client,
  ClientActivity,
  ClientFollowUp,
  ClientFollowUpType,
  ClientNote,
  ClientProcessStage,
  ClientPropertyInterestStatus,
  ClientPropertyLink,
  ClientSource,
  ClientStatus,
  ClientType,
  Inquiry,
} from '../../types/cms'
import '../../components/admin/AdminShell.css'
import './AdminClientProfilePage.css'

type TabKey = 'overview' | 'properties' | 'activity' | 'dates' | 'notes'
type ModalKey = null | 'stage' | 'link' | 'followup' | 'note' | 'edit'

function telHref(phone: string) {
  const normalized = phone.trim().replace(/[^\d+]/g, '')
  return normalized ? `tel:${normalized}` : ''
}

function whatsAppHref(phone: string, firstName: string) {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  return `https://wa.me/${digits}?text=${encodeURIComponent(`Hi ${firstName}, thank you for contacting United Properties. `)}`
}

function replyMailto(email: string, firstName: string) {
  return `mailto:${email}?subject=${encodeURIComponent('United Properties')}&body=${encodeURIComponent(`Hi ${firstName},\n\nKind regards,\nUnited Properties`)}`
}

function toLocalInputValue(iso?: string) {
  const d = iso ? new Date(iso) : new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const PROPERTY_STATUS_TEXT: Record<string, string> = {
  for_sale: 'For sale',
  for_rent: 'For rent',
  sold: 'Sold',
  rented: 'Rented',
}

function isActiveListing(row: LinkablePropertyRow) {
  return row.published && (row.status === 'for_sale' || row.status === 'for_rent')
}

export default function AdminClientProfilePage() {
  const {id = ''} = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const {user, profile} = useAdminAuth()
  const actorId = profile?.id || user?.id || null

  const tab = (searchParams.get('tab') as TabKey) || 'overview'
  const setTab = (next: TabKey) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', next)
    setSearchParams(params, {replace: true})
  }

  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<Client | null>(null)
  const [links, setLinks] = useState<ClientPropertyLink[]>([])
  const [notes, setNotes] = useState<ClientNote[]>([])
  const [followUps, setFollowUps] = useState<ClientFollowUp[]>([])
  const [activities, setActivities] = useState<ClientActivity[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [modal, setModal] = useState<ModalKey>(null)

  const [stageDraft, setStageDraft] = useState<ClientProcessStage>('new_lead')
  const [propertyQuery, setPropertyQuery] = useState('')
  const [propertyFilter, setPropertyFilter] = useState<'active' | 'all'>('active')
  const [allProperties, setAllProperties] = useState<LinkablePropertyRow[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(false)
  const [propertiesError, setPropertiesError] = useState<string | null>(null)
  const [noteBody, setNoteBody] = useState('')
  const [followDraft, setFollowDraft] = useState({
    type: 'follow_up' as ClientFollowUpType,
    title: '',
    startsAt: toLocalInputValue(),
    propertyId: '',
    notes: '',
  })
  const [editDraft, setEditDraft] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    client_type: '' as string,
    assigned_to: '',
  })

  const reload = useCallback(async () => {
    if (!id) return
    const [row, propertyLinks, noteRows, followRows, activityRows, inquiryRows] = await Promise.all([
      fetchClientById(id),
      fetchClientPropertyLinks(id),
      fetchClientNotes(id),
      fetchClientFollowUps(id),
      fetchClientActivities({clientId: id, limit: 100}),
      fetchClientInquiries(id),
    ])
    if (!row) {
      toast.error('Client not found')
      navigate('/admin/clients', {replace: true})
      return
    }
    setClient(row)
    setLinks(propertyLinks)
    setNotes(noteRows)
    setFollowUps(followRows)
    setActivities(activityRows)
    setInquiries(inquiryRows)
    setStageDraft((row.process_stage as ClientProcessStage) || 'new_lead')
    setEditDraft({
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email ?? '',
      phone: row.phone ?? '',
      client_type: (row.client_type as string) || '',
      assigned_to: row.assigned_to || '',
    })
  }, [id, navigate])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      setLoading(true)
      try {
        const staffRows = await fetchStaffProfiles()
        if (!cancelled) setStaff(staffRows)
        await reload()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load client')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void boot()
    return () => {
      cancelled = true
    }
  }, [reload])

  useEffect(() => {
    if (modal !== 'link') return
    let cancelled = false
    setPropertiesLoading(true)
    setPropertiesError(null)
    fetchPropertiesForLink()
      .then((rows) => {
        if (!cancelled) setAllProperties(rows)
      })
      .catch((err) => {
        if (!cancelled) setPropertiesError(err instanceof Error ? err.message : 'Failed to load properties')
      })
      .finally(() => {
        if (!cancelled) setPropertiesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [modal])

  const propertyCounts = useMemo(() => {
    const active = allProperties.filter(isActiveListing).length
    return {active, all: allProperties.length}
  }, [allProperties])

  const visibleProperties = useMemo(() => {
    const q = propertyQuery.trim().toLowerCase()
    return allProperties.filter((row) => {
      if (propertyFilter === 'active' && !isActiveListing(row)) return false
      if (!q) return true
      return [row.reference_number, row.title, row.location, row.city, row.property_type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [allProperties, propertyFilter, propertyQuery])

  const nextFollowUp = useMemo(
    () =>
      followUps.find((f) => ['upcoming', 'today', 'overdue'].includes(String(f.status))) ?? null,
    [followUps],
  )

  const interestedLinks = useMemo(
    () =>
      links.filter((l) =>
        ['interested', 'viewing_requested', 'viewing_scheduled', 'viewed', 'offer_made', 'negotiation'].includes(
          String(l.interest_status),
        ),
      ),
    [links],
  )

  if (loading || !client) return <p className="admin-empty">Loading client profile…</p>

  const name = formatClientName(client)
  const firstName = client.first_name.trim().split(/\s+/)[0] || 'there'
  const phone = client.phone?.trim() || ''
  const email = client.email?.trim() || ''

  async function onSaveStage() {
    try {
      const updated = await updateClientStage({
        clientId: client!.id,
        stage: stageDraft,
        actorId,
        previousStage: client!.process_stage,
      })
      setClient({...client!, ...updated, assigned_name: client!.assigned_name})
      setModal(null)
      toast.success('Stage updated')
      setActivities(await fetchClientActivities({clientId: client!.id, limit: 100}))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update stage')
    }
  }

  async function onLinkProperty(propertyId: string) {
    try {
      await linkPropertyToClient({clientId: client!.id, propertyId, actorId})
      toast.success('Property linked')
      setModal(null)
      setPropertyQuery('')
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not link property')
    }
  }

  async function onInterestChange(link: ClientPropertyLink, status: ClientPropertyInterestStatus) {
    try {
      const updated = await updateClientPropertyInterest({
        linkId: link.id,
        clientId: client!.id,
        propertyId: link.property_id,
        interestStatus: status,
        previousStatus: link.interest_status,
        actorId,
      })
      setLinks((prev) => prev.map((row) => (row.id === link.id ? updated : row)))
      setActivities(await fetchClientActivities({clientId: client!.id, limit: 100}))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function onUnlink(link: ClientPropertyLink) {
    if (!window.confirm('Remove this property from the client?')) return
    try {
      await unlinkPropertyFromClient({
        linkId: link.id,
        clientId: client!.id,
        propertyId: link.property_id,
        actorId,
        propertyLabel: link.property?.reference_number || link.property?.title,
      })
      toast.success('Property removed')
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Remove failed')
    }
  }

  async function onAddNote(event: FormEvent) {
    event.preventDefault()
    try {
      await addClientNote({clientId: client!.id, body: noteBody, actorId})
      setNoteBody('')
      setModal(null)
      toast.success('Note added')
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add note')
    }
  }

  async function onAddFollowUp(event: FormEvent) {
    event.preventDefault()
    try {
      await createFollowUp({
        clientId: client!.id,
        actorId,
        type: followDraft.type,
        title: followDraft.title,
        startsAt: new Date(followDraft.startsAt).toISOString(),
        propertyId: followDraft.propertyId || null,
        notes: followDraft.notes || null,
        assignedTo: client!.assigned_to || actorId,
      })
      setModal(null)
      setFollowDraft({
        type: 'follow_up',
        title: '',
        startsAt: toLocalInputValue(),
        propertyId: '',
        notes: '',
      })
      toast.success('Follow-up created')
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create follow-up')
    }
  }

  async function onCompleteFollowUp(row: ClientFollowUp) {
    try {
      await completeFollowUp(row.id, actorId)
      toast.success('Marked complete')
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function onSaveDetails(event: FormEvent) {
    event.preventDefault()
    try {
      const updated = await updateClient(
        client!.id,
        {
          first_name: editDraft.first_name,
          last_name: editDraft.last_name,
          email: editDraft.email || null,
          phone: editDraft.phone || null,
          notes: client!.notes,
          source: client!.source,
          status: client!.status,
          process_stage: client!.process_stage,
          client_type: (editDraft.client_type as ClientType) || null,
          assigned_to: editDraft.assigned_to || null,
          last_contact_at: client!.last_contact_at,
        },
        actorId,
      )
      if (editDraft.assigned_to !== (client!.assigned_to || '')) {
        await updateClientAssignee({
          clientId: client!.id,
          assignedTo: editDraft.assigned_to || null,
          actorId,
        })
      }
      setClient({
        ...client!,
        ...updated,
        assigned_name:
          staff.find((s) => s.id === (editDraft.assigned_to || ''))?.full_name ||
          staff.find((s) => s.id === (editDraft.assigned_to || ''))?.email ||
          null,
      })
      setModal(null)
      toast.success('Client updated')
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    }
  }

  async function onArchiveToggle() {
    try {
      const updated =
        client!.status === 'archived'
          ? await restoreClient(client!.id, actorId)
          : await archiveClient(client!.id, actorId)
      setClient({...client!, ...updated})
      toast.success(updated.status === 'archived' ? 'Archived' : 'Restored')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return (
    <div className="admin-page client-profile">
      <header className="client-profile__hero">
        <div className="client-profile__hero-bar">
          <Link className="client-profile__back" to="/admin/clients">
            <ArrowLeft size={17} aria-hidden />
            Clients
          </Link>
          <span className={`client-profile__status client-profile__status--${client.status}`}>
            {CLIENT_STATUS_LABELS[(client.status as ClientStatus) || 'active'] ?? client.status}
          </span>
        </div>

        <div className="client-profile__identity">
          <span className="client-profile__avatar" aria-hidden>
            {clientInitials(client)}
          </span>
          <div>
            <h1>{name}</h1>
            <p className="client-profile__sub">
              {client.client_type
                ? CLIENT_TYPE_LABELS[client.client_type as ClientType] || client.client_type
                : 'Client'}
              {' · '}
              {CLIENT_SOURCE_LABELS[(client.source as ClientSource) || 'website'] ?? client.source}
            </p>
          </div>
        </div>

        <div className="client-profile__facts">
          <div>
            <span>Phone</span>
            <strong>{phone || '—'}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{email || '—'}</strong>
          </div>
          <div>
            <span>Assigned</span>
            <strong>{client.assigned_name || 'Unassigned'}</strong>
          </div>
          <div>
            <span>Stage</span>
            <strong>{stageLabel(client.process_stage)}</strong>
          </div>
          <div>
            <span>Date added</span>
            <strong>{formatCrmDate(client.created_at)}</strong>
          </div>
          <div>
            <span>Last contact</span>
            <strong>{formatCrmDate(client.last_contact_at, true)}</strong>
          </div>
          <div>
            <span>Next follow-up</span>
            <strong>{formatCrmDate(nextFollowUp?.starts_at, true)}</strong>
          </div>
        </div>

        <div className="client-profile__actions">
          <div className="client-profile__action-group">
            <p className="client-profile__action-label">Contact</p>
            <div className="client-profile__action-row">
              {phone ? (
                <a className="admin-btn admin-btn--ghost" href={telHref(phone)}>
                  <Phone size={15} aria-hidden /> Call
                </a>
              ) : null}
              {email ? (
                <a className="admin-btn admin-btn--ghost" href={replyMailto(email, firstName)}>
                  <Mail size={15} aria-hidden /> Email
                </a>
              ) : null}
              {phone ? (
                <a
                  className="admin-btn admin-btn--ghost"
                  href={whatsAppHref(phone, firstName)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppBrandIcon size={15} /> WhatsApp
                </a>
              ) : null}
              {!phone && !email ? (
                <span className="client-profile__action-empty">No phone or email saved</span>
              ) : null}
            </div>
          </div>

          <div className="client-profile__action-group">
            <p className="client-profile__action-label">Plan &amp; log</p>
            <div className="client-profile__action-row">
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => {
                  setFollowDraft((d) => ({...d, type: 'follow_up', startsAt: toLocalInputValue()}))
                  setModal('followup')
                }}
              >
                <CalendarClock size={15} aria-hidden /> Follow-Up
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => {
                  setFollowDraft((d) => ({
                    ...d,
                    type: 'viewing',
                    title: 'Property viewing',
                    startsAt: toLocalInputValue(),
                  }))
                  setModal('followup')
                }}
              >
                <Building2 size={15} aria-hidden /> Viewing
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal('note')}>
                <StickyNote size={15} aria-hidden /> Note
              </button>
            </div>
          </div>

          <div className="client-profile__action-group">
            <p className="client-profile__action-label">Deal</p>
            <div className="client-profile__action-row">
              <button type="button" className="admin-btn admin-btn--gold" onClick={() => setModal('link')}>
                <Link2 size={15} aria-hidden /> Link Property
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal('stage')}>
                <GitBranch size={15} aria-hidden /> Change Stage
              </button>
            </div>
          </div>

          <div className="client-profile__action-group client-profile__action-group--manage">
            <p className="client-profile__action-label">Manage</p>
            <div className="client-profile__action-row">
              <button type="button" className="client-profile__action-quiet" onClick={() => setModal('edit')}>
                <Pencil size={14} aria-hidden /> Edit details
              </button>
              <button
                type="button"
                className="client-profile__action-quiet client-profile__action-quiet--danger"
                onClick={() => void onArchiveToggle()}
              >
                {client.status === 'archived' ? (
                  <>
                    <ArchiveRestore size={14} aria-hidden /> Restore
                  </>
                ) : (
                  <>
                    <Archive size={14} aria-hidden /> Archive
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {(() => {
        const pipeline = CLIENT_PROCESS_STAGES.filter((s) => s !== 'lost_inactive')
        const current = (client.process_stage as ClientProcessStage) || 'new_lead'
        const isLost = current === 'lost_inactive'
        const currentIndex = isLost ? -1 : pipeline.indexOf(current)
        const nextStage = isLost ? undefined : pipeline[currentIndex + 1]
        const openStage = (stage: ClientProcessStage) => {
          setStageDraft(stage)
          setModal('stage')
        }

        return (
          <section
            className={`client-profile__pipeline${isLost ? ' is-lost' : ''}`}
            aria-label="Process stage"
          >
            <header className="client-profile__pipeline-head">
              <div>
                <p className="client-profile__pipeline-eyebrow">
                  Process stage
                  {!isLost && currentIndex >= 0 ? ` · Step ${currentIndex + 1} of ${pipeline.length}` : ''}
                </p>
                <h2 className="client-profile__pipeline-current">{CLIENT_PROCESS_STAGE_LABELS[current]}</h2>
              </div>
              <div className="client-profile__pipeline-actions">
                {isLost ? (
                  <button type="button" className="admin-btn admin-btn--gold" onClick={() => openStage('contacted')}>
                    Reopen client
                  </button>
                ) : (
                  <>
                    {nextStage ? (
                      <button
                        type="button"
                        className="admin-btn admin-btn--gold"
                        onClick={() => openStage(nextStage)}
                      >
                        Advance to {CLIENT_PROCESS_STAGE_LABELS[nextStage]}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="client-profile__action-quiet client-profile__action-quiet--danger"
                      onClick={() => openStage('lost_inactive')}
                    >
                      Mark as Lost / Inactive
                    </button>
                  </>
                )}
              </div>
            </header>

            <ol className="client-profile__stepper">
              {pipeline.map((stage, i) => {
                const state = isLost
                  ? 'future'
                  : i < currentIndex
                    ? 'done'
                    : i === currentIndex
                      ? 'current'
                      : 'future'
                return (
                  <li key={stage} className={`client-profile__step is-${state}`}>
                    <button
                      type="button"
                      onClick={() => openStage(stage)}
                      aria-current={state === 'current' ? 'step' : undefined}
                      title={`Set stage: ${CLIENT_PROCESS_STAGE_LABELS[stage]}`}
                    >
                      <span className="client-profile__step-dot">{state === 'done' ? '✓' : i + 1}</span>
                      <span className="client-profile__step-label">{CLIENT_PROCESS_STAGE_LABELS[stage]}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })()}

      <div className="client-profile__tabs" role="tablist">
        {(
          [
            ['overview', 'Overview'],
            ['properties', 'Properties'],
            ['activity', 'Activity'],
            ['dates', 'Dates & Follow-ups'],
            ['notes', 'Notes'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`client-profile__tab${tab === key ? ' is-active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="client-profile__grid">
          <section className="admin-card client-profile__panel">
            <h2>Current stage</h2>
            <p className="client-profile__big">{stageLabel(client.process_stage)}</p>
            <h2>Assigned to</h2>
            <p>{client.assigned_name || 'Unassigned'}</p>
            <h2>Next action</h2>
            {nextFollowUp ? (
              <div className="client-profile__next">
                <strong>{CLIENT_FOLLOW_UP_TYPE_LABELS[nextFollowUp.type as ClientFollowUpType] || nextFollowUp.type}</strong>
                <span>{formatCrmDate(nextFollowUp.starts_at, true)}</span>
                <p>{nextFollowUp.title || nextFollowUp.notes || '—'}</p>
              </div>
            ) : (
              <p className="client-profile__muted">No upcoming follow-up</p>
            )}
            <h2>Linked properties</h2>
            <p className="client-profile__big">{links.length}</p>
            <h2>Last contact</h2>
            <p>{formatCrmDate(client.last_contact_at, true)}</p>
          </section>

          <section className="admin-card client-profile__panel">
            <div className="client-profile__panel-head">
              <h2>Interested properties</h2>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setTab('properties')}>
                View all
              </button>
            </div>
            {interestedLinks.length === 0 ? (
              <p className="client-profile__muted">No interested properties yet.</p>
            ) : (
              <ul className="client-profile__mini-list">
                {interestedLinks.slice(0, 4).map((link) => (
                  <li key={link.id}>
                    <strong>{link.property?.reference_number || '—'}</strong>
                    <span>{link.property?.title}</span>
                    <em>{interestLabel(link.interest_status)}</em>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-card client-profile__panel">
            <div className="client-profile__panel-head">
              <h2>Upcoming dates</h2>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setTab('dates')}>
                Manage
              </button>
            </div>
            <ul className="client-profile__mini-list">
              {followUps
                .filter((f) => ['upcoming', 'today', 'overdue'].includes(String(f.status)))
                .slice(0, 4)
                .map((f) => (
                  <li key={f.id}>
                    <strong>{formatCrmDate(f.starts_at, true)}</strong>
                    <span>{f.title || followUpTypeFallback(f.type)}</span>
                    <em>{CLIENT_FOLLOW_UP_STATUS_LABELS[f.status as keyof typeof CLIENT_FOLLOW_UP_STATUS_LABELS] || f.status}</em>
                  </li>
                ))}
            </ul>
            {followUps.filter((f) => ['upcoming', 'today', 'overdue'].includes(String(f.status))).length === 0 ? (
              <p className="client-profile__muted">No upcoming dates.</p>
            ) : null}
          </section>

          <section className="admin-card client-profile__panel">
            <div className="client-profile__panel-head">
              <h2>Recent activity</h2>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setTab('activity')}>
                Timeline
              </button>
            </div>
            <ActivityList rows={activities.slice(0, 6)} />
          </section>

          <section className="admin-card client-profile__panel client-profile__panel--wide">
            <div className="client-profile__panel-head">
              <h2>Internal notes</h2>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal('note')}>
                <Plus size={14} aria-hidden /> Note
              </button>
            </div>
            {notes[0] ? (
              <blockquote className="client-profile__note-preview">
                <p>{notes[0].body}</p>
                <footer>
                  {notes[0].author_name || 'Team'} · {formatCrmDate(notes[0].created_at, true)}
                </footer>
              </blockquote>
            ) : (
              <p className="client-profile__muted">No notes yet.</p>
            )}
            {inquiries.length > 0 ? (
              <p className="client-profile__muted">
                {inquiries.length} linked website enquir{inquiries.length === 1 ? 'y' : 'ies'} in history.
              </p>
            ) : null}
          </section>
        </div>
      ) : null}

      {tab === 'properties' ? (
        <section className="admin-card client-profile__panel">
          <div className="client-profile__panel-head">
            <h2>{links.length} linked properties</h2>
            <button type="button" className="admin-btn admin-btn--gold" onClick={() => setModal('link')}>
              <Plus size={15} aria-hidden /> Link Property
            </button>
          </div>
          {links.length === 0 ? (
            <p className="client-profile__muted">Link existing inventory properties to this client.</p>
          ) : (
            <ul className="client-profile__property-list">
              {links.map((link) => (
                <li key={link.id} className="client-profile__property-card">
                  <div className="client-profile__property-media">
                    {link.property?.cover_url ? (
                      <img src={link.property.cover_url} alt="" />
                    ) : (
                      <span>No image</span>
                    )}
                  </div>
                  <div className="client-profile__property-body">
                    <p className="client-profile__ref">{link.property?.reference_number || '—'}</p>
                    <h3>{link.property?.title || 'Property'}</h3>
                    <p>
                      {[link.property?.location, link.property?.city].filter(Boolean).join(' · ') || '—'}
                    </p>
                    <p>
                      {link.property?.price != null
                        ? `€${Number(link.property.price).toLocaleString()}`
                        : '—'}
                      {link.property?.status ? ` · ${link.property.status}` : ''}
                    </p>
                    <label className="client-profile__inline-field">
                      <span>Interest status</span>
                      <select
                        value={link.interest_status}
                        onChange={(e) =>
                          void onInterestChange(
                            link,
                            e.target.value as ClientPropertyInterestStatus,
                          )
                        }
                      >
                        {CLIENT_PROPERTY_INTEREST_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {CLIENT_PROPERTY_INTEREST_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="client-profile__muted">
                      Linked {formatCrmDate(link.linked_at)}
                      {link.linked_by_name ? ` by ${link.linked_by_name}` : ''}
                    </p>
                    {link.notes ? <p>{link.notes}</p> : null}
                    <div className="client-profile__row-actions">
                      {link.property?.id ? (
                        <Link
                          className="admin-btn admin-btn--ghost"
                          to={`/admin/properties/${link.property.id}/edit`}
                        >
                          Open property
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        onClick={() => void onUnlink(link)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === 'activity' ? (
        <section className="admin-card client-profile__panel">
          <h2>Activity timeline</h2>
          <ActivityList rows={activities} />
          {activities.length === 0 ? (
            <p className="client-profile__muted">No activity recorded yet.</p>
          ) : null}
        </section>
      ) : null}

      {tab === 'dates' ? (
        <section className="admin-card client-profile__panel">
          <div className="client-profile__panel-head">
            <h2>Dates & follow-ups</h2>
            <button
              type="button"
              className="admin-btn admin-btn--gold"
              onClick={() => {
                setFollowDraft({
                  type: 'follow_up',
                  title: '',
                  startsAt: toLocalInputValue(),
                  propertyId: '',
                  notes: '',
                })
                setModal('followup')
              }}
            >
              <Plus size={15} aria-hidden /> Add
            </button>
          </div>
          {nextFollowUp ? (
            <div className="client-profile__next client-profile__next--banner">
              <span>Next action</span>
              <strong>{formatCrmDate(nextFollowUp.starts_at, true)}</strong>
              <p>
                {nextFollowUp.title || followUpTypeFallback(nextFollowUp.type)}
                {nextFollowUp.property_ref ? ` · ${nextFollowUp.property_ref}` : ''}
              </p>
            </div>
          ) : null}
          <ul className="client-profile__follow-list">
            {followUps.map((row) => (
              <li key={row.id}>
                <div>
                  <strong>{formatCrmDate(row.starts_at, true)}</strong>
                  <span>
                    {CLIENT_FOLLOW_UP_TYPE_LABELS[row.type as ClientFollowUpType] || row.type}
                    {row.property_ref ? ` · ${row.property_ref}` : ''}
                  </span>
                  <p>{row.title || row.notes || '—'}</p>
                  <em>
                    {CLIENT_FOLLOW_UP_STATUS_LABELS[
                      row.status as keyof typeof CLIENT_FOLLOW_UP_STATUS_LABELS
                    ] || row.status}
                    {row.assigned_name ? ` · ${row.assigned_name}` : ''}
                  </em>
                </div>
                {row.status !== 'completed' && row.status !== 'cancelled' ? (
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => void onCompleteFollowUp(row)}
                  >
                    Complete
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {followUps.length === 0 ? (
            <p className="client-profile__muted">No dates yet.</p>
          ) : null}
        </section>
      ) : null}

      {tab === 'notes' ? (
        <section className="admin-card client-profile__panel">
          <div className="client-profile__panel-head">
            <h2>Notes</h2>
            <button type="button" className="admin-btn admin-btn--gold" onClick={() => setModal('note')}>
              <NotebookPen size={15} aria-hidden /> Add note
            </button>
          </div>
          <ul className="client-profile__notes-list">
            {notes.map((note) => (
              <li key={note.id}>
                <p>{note.body}</p>
                <footer>
                  {note.author_name || 'Team'} · {formatCrmDate(note.created_at, true)}
                </footer>
              </li>
            ))}
          </ul>
          {notes.length === 0 ? <p className="client-profile__muted">No notes yet.</p> : null}
        </section>
      ) : null}

      {modal ? (
        <div className="client-profile__overlay" role="presentation" onClick={() => setModal(null)}>
          <div
            className={`client-profile__dialog${modal === 'link' ? ' client-profile__dialog--wide' : ''}`}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {modal === 'stage' ? (
              <>
                <h2>Change stage</h2>
                <label className="client-profile__field">
                  <span>Process stage</span>
                  <select
                    value={stageDraft}
                    onChange={(e) => setStageDraft(e.target.value as ClientProcessStage)}
                  >
                    {CLIENT_PROCESS_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {CLIENT_PROCESS_STAGE_LABELS[stage]}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="admin-actions">
                  <button type="button" className="admin-btn admin-btn--gold" onClick={() => void onSaveStage()}>
                    Save stage
                  </button>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : null}

            {modal === 'link' ? (
              <>
                <h2>Link property</h2>
                <label className="client-profile__search">
                  <Search size={16} aria-hidden />
                  <input
                    value={propertyQuery}
                    onChange={(e) => setPropertyQuery(e.target.value)}
                    placeholder="Search reference, title, area, city…"
                    autoFocus
                  />
                </label>
                <div className="client-profile__link-filters" role="tablist" aria-label="Property filter">
                  {(
                    [
                      ['active', 'Active listings', propertyCounts.active],
                      ['all', 'All uploaded', propertyCounts.all],
                    ] as const
                  ).map(([key, label, count]) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={propertyFilter === key}
                      className={`client-profile__link-filter${propertyFilter === key ? ' is-active' : ''}`}
                      onClick={() => setPropertyFilter(key)}
                    >
                      {label}
                      <span>{count}</span>
                    </button>
                  ))}
                </div>

                {propertiesLoading ? (
                  <p className="client-profile__muted">Loading properties…</p>
                ) : propertiesError ? (
                  <p className="client-profile__muted">{propertiesError}</p>
                ) : visibleProperties.length === 0 ? (
                  <p className="client-profile__muted">
                    {propertyQuery.trim()
                      ? 'No properties match your search.'
                      : propertyFilter === 'active'
                        ? 'No active listings. Switch to “All uploaded” to see every property.'
                        : 'No properties uploaded yet.'}
                  </p>
                ) : (
                  <ul className="client-profile__link-list">
                    {visibleProperties.map((row) => {
                      const already = links.some((l) => l.property_id === row.id)
                      const statusText = row.status
                        ? PROPERTY_STATUS_TEXT[row.status] ?? row.status
                        : null
                      return (
                        <li key={row.id} className={already ? 'is-linked' : undefined}>
                          <span className="client-profile__link-thumb">
                            {row.cover_url ? <img src={row.cover_url} alt="" loading="lazy" /> : <Building2 size={18} aria-hidden />}
                          </span>
                          <div className="client-profile__link-body">
                            <div className="client-profile__link-top">
                              <strong>{row.reference_number || '—'}</strong>
                              {statusText ? (
                                <span className={`client-profile__link-badge is-${row.status}`}>{statusText}</span>
                              ) : null}
                              {!row.published ? (
                                <span className="client-profile__link-badge is-draft">Draft</span>
                              ) : null}
                            </div>
                            <span className="client-profile__link-title">{row.title}</span>
                            <em>
                              {[
                                [row.location, row.city].filter(Boolean).join(', '),
                                row.bedrooms != null ? `${row.bedrooms} bed` : null,
                                row.price != null ? `€${row.price.toLocaleString()}` : null,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </em>
                          </div>
                          <button
                            type="button"
                            className={`admin-btn ${already ? 'admin-btn--ghost' : 'admin-btn--gold'}`}
                            disabled={already}
                            onClick={() => void onLinkProperty(row.id)}
                          >
                            {already ? 'Linked' : 'Link'}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </>
            ) : null}

            {modal === 'note' ? (
              <form onSubmit={onAddNote}>
                <h2>Add note</h2>
                <label className="client-profile__field">
                  <span>Internal note</span>
                  <textarea
                    rows={5}
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                    required
                  />
                </label>
                <div className="admin-actions">
                  <button type="submit" className="admin-btn admin-btn--gold">
                    Save note
                  </button>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            {modal === 'followup' ? (
              <form onSubmit={onAddFollowUp}>
                <h2>
                  {followDraft.type === 'viewing' ? 'Schedule viewing' : 'Add follow-up'}
                </h2>
                <label className="client-profile__field">
                  <span>Type</span>
                  <select
                    value={followDraft.type}
                    onChange={(e) =>
                      setFollowDraft((d) => ({...d, type: e.target.value as ClientFollowUpType}))
                    }
                  >
                    {CLIENT_FOLLOW_UP_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {CLIENT_FOLLOW_UP_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="client-profile__field">
                  <span>Date & time</span>
                  <input
                    type="datetime-local"
                    value={followDraft.startsAt}
                    onChange={(e) => setFollowDraft((d) => ({...d, startsAt: e.target.value}))}
                    required
                  />
                </label>
                <label className="client-profile__field">
                  <span>Title</span>
                  <input
                    value={followDraft.title}
                    onChange={(e) => setFollowDraft((d) => ({...d, title: e.target.value}))}
                    placeholder="Optional title"
                  />
                </label>
                <label className="client-profile__field">
                  <span>Related property</span>
                  <select
                    value={followDraft.propertyId}
                    onChange={(e) => setFollowDraft((d) => ({...d, propertyId: e.target.value}))}
                  >
                    <option value="">None</option>
                    {links.map((link) => (
                      <option key={link.id} value={link.property_id}>
                        {link.property?.reference_number || link.property?.title || link.property_id}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="client-profile__field">
                  <span>Notes</span>
                  <textarea
                    rows={3}
                    value={followDraft.notes}
                    onChange={(e) => setFollowDraft((d) => ({...d, notes: e.target.value}))}
                  />
                </label>
                <div className="admin-actions">
                  <button type="submit" className="admin-btn admin-btn--gold">
                    Save
                  </button>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            {modal === 'edit' ? (
              <form onSubmit={onSaveDetails}>
                <h2>Edit client details</h2>
                <div className="client-profile__form-grid">
                  <label className="client-profile__field">
                    <span>First name</span>
                    <input
                      value={editDraft.first_name}
                      onChange={(e) => setEditDraft((d) => ({...d, first_name: e.target.value}))}
                      required
                    />
                  </label>
                  <label className="client-profile__field">
                    <span>Last name</span>
                    <input
                      value={editDraft.last_name}
                      onChange={(e) => setEditDraft((d) => ({...d, last_name: e.target.value}))}
                    />
                  </label>
                  <label className="client-profile__field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={editDraft.email}
                      onChange={(e) => setEditDraft((d) => ({...d, email: e.target.value}))}
                    />
                  </label>
                  <label className="client-profile__field">
                    <span>Phone / WhatsApp</span>
                    <input
                      value={editDraft.phone}
                      onChange={(e) => setEditDraft((d) => ({...d, phone: e.target.value}))}
                    />
                  </label>
                  <label className="client-profile__field">
                    <span>Client type</span>
                    <select
                      value={editDraft.client_type}
                      onChange={(e) => setEditDraft((d) => ({...d, client_type: e.target.value}))}
                    >
                      <option value="">Not set</option>
                      {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="client-profile__field">
                    <span>Assigned employee</span>
                    <select
                      value={editDraft.assigned_to}
                      onChange={(e) => setEditDraft((d) => ({...d, assigned_to: e.target.value}))}
                    >
                      <option value="">Unassigned</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name?.trim() || s.email}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="admin-actions">
                  <button type="submit" className="admin-btn admin-btn--gold">
                    Save
                  </button>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function followUpTypeFallback(type: string) {
  return CLIENT_FOLLOW_UP_TYPE_LABELS[type as ClientFollowUpType] || type
}

function ActivityList({rows}: {rows: ClientActivity[]}) {
  if (!rows.length) return null
  return (
    <ol className="client-profile__timeline">
      {rows.map((row) => (
        <li key={row.id}>
          <time>{formatCrmDate(row.created_at, true)}</time>
          <div>
            <strong>{row.actor_name || 'Team'}</strong>
            <p>{row.description}</p>
            {row.previous_value && row.new_value ? (
              <em>
                {row.previous_value} → {row.new_value}
              </em>
            ) : null}
            {row.property_ref ? <span className="client-profile__ref-chip">{row.property_ref}</span> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
