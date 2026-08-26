import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {fetchAdminProperties} from '../../lib/properties/api'
import {validatePropertyForBazaraki} from '../../lib/integrations/bazaraki/validatePropertyForBazaraki'
import type {Property} from '../../types/cms'
import '../../components/admin/AdminShell.css'

export default function AdminBazarakiPage() {
  const [rows, setRows] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const {rows: list} = await fetchAdminProperties({tab: 'bazaraki', pageSize: 100})
      if (!cancelled) {
        setRows(list)
        setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Bazaraki</h1>
          <p className="admin-page__lede">
            Readiness checks for a future XML feed. Sold, rented, and draft listings are never
            ready for the active feed.
          </p>
        </div>
      </header>
      <div className="admin-card admin-table-wrap">
        {loading ? (
          <p className="admin-empty">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="admin-empty">No properties marked for Bazaraki.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Status</th>
                <th>Ready</th>
                <th>Missing</th>
                <th>Issues</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const v = validatePropertyForBazaraki(p)
                return (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/admin/properties/${p.id}/edit`}>
                        {p.reference_number} — {p.title}
                      </Link>
                    </td>
                    <td>{p.status}</td>
                    <td>{v.ready ? 'Ready' : 'Not ready'}</td>
                    <td>{v.missingFields.join(', ') || '—'}</td>
                    <td>{[...v.errors, ...v.warnings].join(' · ') || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
