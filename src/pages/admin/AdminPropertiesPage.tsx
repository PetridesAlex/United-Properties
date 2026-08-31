import {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {Plus, Search, Sparkles} from 'lucide-react'
import {countPropertiesByTab, fetchAdminProperties} from '../../lib/properties/api'
import {PROPERTY_STATUS_LABELS, type Property, type PropertyStatus} from '../../types/cms'
import '../../components/admin/AdminShell.css'
import './AdminPropertiesPage.css'

const TABS = [
  'all',
  'active',
  'for_sale',
  'for_rent',
  'sold',
  'rented',
  'drafts',
  'featured',
  'bazaraki',
] as const

const TAB_LABELS: Record<(typeof TABS)[number], string> = {
  all: 'All',
  active: 'Active',
  for_sale: 'For Sale',
  for_rent: 'For Rent',
  sold: 'Sold',
  rented: 'Rented',
  drafts: 'Drafts',
  featured: 'Featured',
  bazaraki: 'Bazaraki',
}

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

function formatPrice(property: Property) {
  if (property.price == null) return 'Price on request'
  const amount = Number(property.price).toLocaleString('en-GB')
  const suffix = property.status === 'for_rent' || property.status === 'rented' ? ' / mo' : ''
  return `€${amount}${suffix}`
}

function formatLocation(property: Property) {
  return [property.area, property.city].filter(Boolean).join(', ') || 'Location TBC'
}

export default function AdminPropertiesPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('all')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<Property[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [list, nextCounts] = await Promise.all([
          fetchAdminProperties({tab, search, pageSize: 50}),
          countPropertiesByTab(),
        ])
        if (cancelled) return
        setRows(list.rows)
        setCounts(nextCounts)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load properties')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [tab, search])

  const countFor = useMemo(() => (key: string) => counts[key] ?? 0, [counts])

  return (
    <div className="admin-page props-admin">
      <header className="admin-page__header props-admin__header">
        <div>
          <p className="props-admin__eyebrow">Inventory</p>
          <h1>Properties</h1>
          <p className="admin-page__lede">
            Curate and manage every United Properties listing from one place.
          </p>
        </div>
        <Link className="admin-btn admin-btn--gold props-admin__add" to="/admin/properties/new">
          <Plus size={16} aria-hidden />
          Add Property
        </Link>
      </header>

      <div className="props-admin__toolbar">
        <div className="props-admin__tabs" role="tablist" aria-label="Property filters">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`props-admin__tab${tab === key ? ' is-active' : ''}`}
              onClick={() => setTab(key)}
            >
              <span>{TAB_LABELS[key]}</span>
              <em>{countFor(key)}</em>
            </button>
          ))}
        </div>

        <label className="props-admin__search" htmlFor="property-search">
          <Search size={16} aria-hidden />
          <span className="visually-hidden">Search properties</span>
          <input
            id="property-search"
            placeholder="Search title, reference, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {error ? <p className="admin-login__error">{error}</p> : null}

      <section className="props-admin__panel" aria-live="polite">
        {loading ? (
          <p className="admin-empty">Loading properties…</p>
        ) : rows.length === 0 ? (
          <div className="props-admin__empty">
            <p>No properties in this view.</p>
            <Link className="admin-btn admin-btn--gold" to="/admin/properties/new">
              Add your first listing
            </Link>
          </div>
        ) : (
          <ul className="props-admin__list">
            {rows.map((p) => {
              const image = thumb(p)
              return (
                <li key={p.id} className="props-admin__row">
                  <div className="props-admin__media">
                    {image ? (
                      <img src={image} alt="" />
                    ) : (
                      <div className="props-admin__media-fallback" aria-hidden>
                        UP
                      </div>
                    )}
                  </div>

                  <div className="props-admin__body">
                    <div className="props-admin__meta-top">
                      <span className="props-admin__ref">{p.reference_number}</span>
                      <span className={`admin-badge ${statusBadgeClass(p.status)}`}>
                        {PROPERTY_STATUS_LABELS[p.status]}
                      </span>
                      <span
                        className={`admin-badge ${p.published ? 'admin-badge--published' : 'admin-badge--draft'}`}
                      >
                        {p.published ? 'Published' : 'Draft'}
                      </span>
                      {p.featured ? (
                        <span className="admin-badge admin-badge--featured">
                          <Sparkles size={11} aria-hidden /> Featured
                        </span>
                      ) : null}
                    </div>

                    <h2 className="props-admin__title">
                      <Link to={`/admin/properties/${p.id}/edit`}>{p.title}</Link>
                    </h2>

                    <p className="props-admin__location">{formatLocation(p)}</p>

                    <div className="props-admin__meta-bottom">
                      <strong className="props-admin__price">{formatPrice(p)}</strong>
                      <span>{p.property_type || 'Property'}</span>
                      <span>
                        Updated{' '}
                        {new Date(p.updated_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className={p.publish_to_bazaraki ? 'is-on' : 'is-off'}>
                        Bazaraki {p.publish_to_bazaraki ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>

                  <div className="props-admin__actions">
                    <Link
                      className="admin-btn admin-btn--gold props-admin__edit"
                      to={`/admin/properties/${p.id}/edit`}
                    >
                      {p.published ? 'Edit' : 'Continue'}
                    </Link>
                    {p.published && p.slug ? (
                      <a
                        className="admin-btn admin-btn--ghost"
                        href={`/properties/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
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
