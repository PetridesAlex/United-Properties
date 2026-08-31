import {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {CheckCircle2, CircleAlert, Copy, ExternalLink, MapPin, Radio} from 'lucide-react'
import toast from 'react-hot-toast'
import {fetchAdminProperties} from '../../lib/properties/api'
import {supabase} from '../../lib/supabase/client'
import {BAZARAKI_FEED_URL} from '../../lib/integrations/bazaraki/mappings'
import {DEFAULT_BAZARAKI_RUBRICS} from '../../lib/integrations/bazaraki/rubricMappings'
import {resolveBazarakiRubric} from '../../lib/integrations/bazaraki/rubricMappings'
import {validatePropertyForBazaraki} from '../../lib/integrations/bazaraki/validatePropertyForBazaraki'
import {getBazarakiDistrictById} from '../../lib/integrations/bazaraki/districts'
import {PROPERTY_STATUS_LABELS, type Property, type PropertyStatus, type SiteSettings} from '../../types/cms'
import '../../components/admin/AdminShell.css'
import './AdminBazarakiPage.css'

const defaultSettings: SiteSettings = {
  id: 1,
  company_name: 'United Properties',
  company_logo_url: null,
  phone: null,
  email: null,
  address: null,
  opening_hours: null,
  social_instagram: null,
  social_linkedin: null,
  social_facebook: null,
  social_whatsapp: null,
  social_telegram: null,
  google_maps_embed_url: null,
  google_maps_link: null,
  default_seo_title: null,
  default_seo_description: null,
  company_registration: null,
  bazaraki_feed_enabled: true,
  bazaraki_rubric_for_sale: null,
  bazaraki_rubric_for_rent: 681,
  bazaraki_rubric_apartments_sale: DEFAULT_BAZARAKI_RUBRICS.apartments_sale,
  bazaraki_rubric_apartments_rent: DEFAULT_BAZARAKI_RUBRICS.apartments_rent,
  bazaraki_rubric_houses_sale: DEFAULT_BAZARAKI_RUBRICS.houses_sale,
  bazaraki_rubric_houses_rent: DEFAULT_BAZARAKI_RUBRICS.houses_rent,
  bazaraki_rubric_residential_buildings_sale: DEFAULT_BAZARAKI_RUBRICS.residential_buildings_sale,
  bazaraki_rubric_prefabricated_houses_sale: DEFAULT_BAZARAKI_RUBRICS.prefabricated_houses_sale,
  bazaraki_rubric_other_sale: DEFAULT_BAZARAKI_RUBRICS.other_sale,
  bazaraki_rubric_other_rent: DEFAULT_BAZARAKI_RUBRICS.other_rent,
  bazaraki_rubric_commercial_sale: DEFAULT_BAZARAKI_RUBRICS.commercial_sale,
  bazaraki_rubric_commercial_rent: DEFAULT_BAZARAKI_RUBRICS.commercial_rent,
  bazaraki_rubric_plots_sale: DEFAULT_BAZARAKI_RUBRICS.plots_sale,
  bazaraki_rubric_plots_rent: DEFAULT_BAZARAKI_RUBRICS.plots_rent,
  bazaraki_phone_hide: false,
  bazaraki_negotiable_price: false,
  bazaraki_exchange: false,
  updated_at: '',
  updated_by: null,
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

function statusBadgeClass(status: PropertyStatus) {
  if (status === 'for_sale') return 'admin-badge--sale'
  if (status === 'for_rent') return 'admin-badge--rent'
  if (status === 'sold') return 'admin-badge--sold'
  return 'admin-badge--rented'
}

function schemaLabel(schema: string | null | undefined) {
  if (!schema) return null
  const map: Record<string, string> = {
    apartment: 'Apartments, flats',
    houses: 'Houses',
    commercial: 'Commercial',
    plotsOfLand: 'Plots of land',
    residentialBuildings: 'Residential buildings',
    prefabricatedHouses: 'Prefabricated houses',
    other: 'Other',
  }
  return map[schema] ?? schema
}

export default function AdminBazarakiPage() {
  const [rows, setRows] = useState<Property[]>([])
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [{rows: list}] = await Promise.all([
        fetchAdminProperties({tab: 'bazaraki', pageSize: 200}),
      ])
      if (supabase) {
        const {data} = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
        if (!cancelled && data) setSettings({...defaultSettings, ...(data as SiteSettings)})
      }
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

  const enriched = useMemo(
    () =>
      rows.map((p) => {
        const validation = validatePropertyForBazaraki(p, settings)
        const district = getBazarakiDistrictById(p.bazaraki_district_id)
        const rubric =
          p.status === 'for_sale' || p.status === 'for_rent'
            ? resolveBazarakiRubric(p.property_type, p.status, settings)
            : null
        const issues = [...validation.missingFields, ...validation.errors, ...validation.warnings]
        return {property: p, validation, district, rubric, issues}
      }),
    [rows, settings],
  )

  const stats = useMemo(() => {
    let ready = 0
    let notReady = 0
    for (const row of enriched) {
      if (row.validation.ready) ready += 1
      else notReady += 1
    }
    return {ready, notReady, total: enriched.length}
  }, [enriched])

  function copyFeedUrl() {
    void navigator.clipboard.writeText(BAZARAKI_FEED_URL).then(() => {
      toast.success('Feed URL copied')
    })
  }

  return (
    <div className="admin-page bazaraki-admin">
      <header className="admin-page__header bazaraki-admin__header">
        <div>
          <p className="bazaraki-admin__eyebrow">Syndication</p>
          <h1>Bazaraki listings</h1>
          <p className="admin-page__lede">
            Premium view of every listing marked for Bazaraki — readiness, district, and feed status
            at a glance.
          </p>
        </div>
        <div className="admin-actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={copyFeedUrl}>
            <Copy size={15} aria-hidden />
            Copy feed URL
          </button>
          <a
            className="admin-btn admin-btn--gold"
            href={BAZARAKI_FEED_URL}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} aria-hidden />
            Open feed
          </a>
        </div>
      </header>

      <div className="bazaraki-admin__stats" role="list">
        <div className="bazaraki-admin__stat bazaraki-admin__stat--ready" role="listitem">
          <span className="bazaraki-admin__stat-label">In the live feed</span>
          <strong>{stats.ready}</strong>
        </div>
        <div className="bazaraki-admin__stat bazaraki-admin__stat--fix" role="listitem">
          <span className="bazaraki-admin__stat-label">Need attention</span>
          <strong>{stats.notReady}</strong>
        </div>
        <div className="bazaraki-admin__stat" role="listitem">
          <span className="bazaraki-admin__stat-label">Marked for Bazaraki</span>
          <strong>{stats.total}</strong>
        </div>
        <div
          className={`bazaraki-admin__stat ${settings.bazaraki_feed_enabled ? 'bazaraki-admin__stat--on' : 'bazaraki-admin__stat--off'}`}
          role="listitem"
        >
          <span className="bazaraki-admin__stat-label">Feed switch</span>
          <strong>{settings.bazaraki_feed_enabled ? 'On' : 'Off'}</strong>
        </div>
      </div>

      <section className="bazaraki-admin__feed-card">
        <div className="bazaraki-admin__feed-copy">
          <p className="bazaraki-admin__eyebrow">XML feed</p>
          <h2>Register this URL in Bazaraki</h2>
          <p>Paste it under your Bazaraki XML feed settings. Only ready listings are exported.</p>
        </div>
        <div className="bazaraki-admin__feed-url">
          <input readOnly value={BAZARAKI_FEED_URL} aria-label="Bazaraki feed URL" />
          <button type="button" className="admin-btn admin-btn--ghost" onClick={copyFeedUrl}>
            Copy
          </button>
        </div>
      </section>

      <section className="bazaraki-admin__panel" aria-live="polite">
        <div className="bazaraki-admin__panel-head">
          <div>
            <p className="bazaraki-admin__eyebrow">Catalogue</p>
            <h2>How listings appear for Bazaraki</h2>
          </div>
          <span className="bazaraki-admin__count">{stats.total} listing{stats.total === 1 ? '' : 's'}</span>
        </div>

        {loading ? (
          <p className="admin-empty">Loading Bazaraki listings…</p>
        ) : enriched.length === 0 ? (
          <div className="bazaraki-admin__empty">
            <Radio size={22} aria-hidden />
            <p>No properties marked for Bazaraki yet.</p>
            <Link className="admin-btn admin-btn--gold" to="/admin/properties">
              Browse listings
            </Link>
          </div>
        ) : (
          <ul className="bazaraki-admin__list">
            {enriched.map(({property: p, validation, district, rubric, issues}) => {
              const image = thumb(p)
              const location =
                district?.areaName ||
                [p.area, p.city || p.district].filter(Boolean).join(', ') ||
                'Location TBC'
              return (
                <li
                  key={p.id}
                  className={`bazaraki-admin__card${validation.ready ? ' is-ready' : ' is-pending'}`}
                >
                  <div className="bazaraki-admin__media">
                    {image ? (
                      <img src={image} alt="" />
                    ) : (
                      <div className="bazaraki-admin__media-fallback" aria-hidden>
                        UP
                      </div>
                    )}
                    <span
                      className={`bazaraki-admin__feed-pill${validation.ready ? ' is-ready' : ' is-pending'}`}
                    >
                      {validation.ready ? (
                        <>
                          <CheckCircle2 size={13} aria-hidden /> In feed
                        </>
                      ) : (
                        <>
                          <CircleAlert size={13} aria-hidden /> Excluded
                        </>
                      )}
                    </span>
                  </div>

                  <div className="bazaraki-admin__body">
                    <div className="bazaraki-admin__meta-top">
                      <span className="bazaraki-admin__ref">{p.reference_number}</span>
                      <span className={`admin-badge ${statusBadgeClass(p.status)}`}>
                        {PROPERTY_STATUS_LABELS[p.status]}
                      </span>
                      {schemaLabel(validation.attrsSchema) ? (
                        <span className="bazaraki-admin__chip">{schemaLabel(validation.attrsSchema)}</span>
                      ) : null}
                    </div>

                    <h3 className="bazaraki-admin__title">
                      <Link to={`/admin/properties/${p.id}/edit`}>{p.title}</Link>
                    </h3>

                    <p className="bazaraki-admin__location">
                      <MapPin size={14} aria-hidden />
                      <span>
                        {location}
                        {p.bazaraki_district_id != null ? (
                          <em> · ID {p.bazaraki_district_id}</em>
                        ) : null}
                      </span>
                    </p>

                    <div className="bazaraki-admin__meta-bottom">
                      <strong className="bazaraki-admin__price">{formatPrice(p)}</strong>
                      <span>{p.property_type || 'Property'}</span>
                      {rubric != null ? <span>Rubric {rubric}</span> : <span>No rubric</span>}
                      {p.latitude != null && p.longitude != null ? (
                        <span className="is-on">Map pin set</span>
                      ) : (
                        <span className="is-off">No map pin</span>
                      )}
                    </div>

                    {issues.length ? (
                      <ul className="bazaraki-admin__issues">
                        {issues.slice(0, 4).map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                        {issues.length > 4 ? <li>+{issues.length - 4} more</li> : null}
                      </ul>
                    ) : (
                      <p className="bazaraki-admin__ok">All checks passed — included in the XML feed.</p>
                    )}
                  </div>

                  <div className="bazaraki-admin__actions">
                    <Link
                      className="admin-btn admin-btn--gold"
                      to={`/admin/properties/${p.id}/edit`}
                    >
                      Edit listing
                    </Link>
                    {p.published && p.slug ? (
                      <a
                        className="admin-btn admin-btn--ghost"
                        href={`/properties/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View site
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
