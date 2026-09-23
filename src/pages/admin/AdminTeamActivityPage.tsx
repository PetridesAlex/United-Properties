import {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {Activity, Filter} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchClientActivities,
  fetchTeamActivitySummary,
} from '../../lib/clients/activity'
import {CLIENT_ACTIVITY_ACTION_LABELS, formatCrmDate} from '../../lib/clients/crmLabels'
import {fetchStaffProfiles, type StaffProfile} from '../../lib/clients/staff'
import type {ClientActivity} from '../../types/cms'
import '../../components/admin/AdminShell.css'
import './AdminTeamActivityPage.css'

export default function AdminTeamActivityPage() {
  const [rows, setRows] = useState<ClientActivity[]>([])
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actorId, setActorId] = useState('all')
  const [action, setAction] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [clientQuery, setClientQuery] = useState('')
  const [propertyQuery, setPropertyQuery] = useState('')
  const [summary, setSummary] = useState({
    clientsHandled: 0,
    clientsContacted: 0,
    propertiesSuggested: 0,
    followUpsCompleted: 0,
    viewingsScheduled: 0,
    dealsCompleted: 0,
    overdueFollowUps: 0,
  })

  useEffect(() => {
    void fetchStaffProfiles()
      .then(setStaff)
      .catch(() => setStaff([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [activityRows, summaryRows] = await Promise.all([
          fetchClientActivities({
            actorId: actorId === 'all' ? undefined : actorId,
            action: action === 'all' ? undefined : action,
            from: dateFrom ? `${dateFrom}T00:00:00.000Z` : undefined,
            to: dateTo ? `${dateTo}T23:59:59.999Z` : undefined,
            limit: 200,
          }),
          fetchTeamActivitySummary(),
        ])
        if (!cancelled) {
          setRows(activityRows)
          setSummary(summaryRows)
        }
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : 'Failed to load activity')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [actorId, action, dateFrom, dateTo])

  const visible = useMemo(() => {
    const cq = clientQuery.trim().toLowerCase()
    const pq = propertyQuery.trim().toLowerCase()
    return rows.filter((row) => {
      if (cq && !(row.client_name || '').toLowerCase().includes(cq)) return false
      if (pq && !(row.property_ref || '').toLowerCase().includes(pq)) return false
      return true
    })
  }, [rows, clientQuery, propertyQuery])

  const actionOptions = useMemo(() => {
    const keys = Object.keys(CLIENT_ACTIVITY_ACTION_LABELS)
    return keys
  }, [])

  return (
    <div className="admin-page team-activity">
      <header className="team-activity__hero">
        <div>
          <p className="team-activity__eyebrow">
            <Activity size={13} aria-hidden />
            Management
          </p>
          <h1>Team Activity</h1>
          <p className="team-activity__lede">
            Factual CRM actions across employees — who did what, for which client, and when.
          </p>
        </div>
      </header>

      <div className="team-activity__summary">
        {[
          ['Clients handled', summary.clientsHandled],
          ['Clients contacted', summary.clientsContacted],
          ['Properties suggested', summary.propertiesSuggested],
          ['Follow-ups completed', summary.followUpsCompleted],
          ['Viewings scheduled', summary.viewingsScheduled],
          ['Deals completed', summary.dealsCompleted],
          ['Overdue follow-ups', summary.overdueFollowUps],
        ].map(([label, value]) => (
          <article key={String(label)}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="team-activity__filters">
        <p>
          <Filter size={14} aria-hidden /> Filters
        </p>
        <label>
          <span>Employee</span>
          <select value={actorId} onChange={(e) => setActorId(e.target.value)}>
            <option value="all">All</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name?.trim() || s.email}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Action</span>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="all">All</option>
            {actionOptions.map((key) => (
              <option key={key} value={key}>
                {CLIENT_ACTIVITY_ACTION_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>From</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>
        <label>
          <span>Client</span>
          <input
            value={clientQuery}
            onChange={(e) => setClientQuery(e.target.value)}
            placeholder="Filter by client name"
          />
        </label>
        <label>
          <span>Property</span>
          <input
            value={propertyQuery}
            onChange={(e) => setPropertyQuery(e.target.value)}
            placeholder="Filter by reference"
          />
        </label>
      </div>

      {loading ? <p className="admin-empty">Loading activity…</p> : null}

      {!loading ? (
        <div className="team-activity__table-wrap">
          <table className="team-activity__table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Action</th>
                <th>Client</th>
                <th>Property</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const d = new Date(row.created_at)
                return (
                  <tr key={row.id}>
                    <td>{row.actor_name || 'Team'}</td>
                    <td>
                      <strong>
                        {CLIENT_ACTIVITY_ACTION_LABELS[row.action] || row.action}
                      </strong>
                      <span className="team-activity__desc">{row.description}</span>
                    </td>
                    <td>
                      {row.client_id ? (
                        <Link to={`/admin/clients/${row.client_id}`}>{row.client_name || 'Client'}</Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{row.property_ref || '—'}</td>
                    <td>{formatCrmDate(row.created_at)}</td>
                    <td>
                      {new Intl.DateTimeFormat('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(d)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {visible.length === 0 ? (
            <p className="admin-empty">No activity matches these filters.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
