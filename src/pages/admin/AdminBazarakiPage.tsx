import {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import toast from 'react-hot-toast'
import {fetchAdminProperties} from '../../lib/properties/api'
import {supabase} from '../../lib/supabase/client'
import {BAZARAKI_FEED_URL} from '../../lib/integrations/bazaraki/mappings'
import {DEFAULT_BAZARAKI_RUBRICS} from '../../lib/integrations/bazaraki/rubricMappings'
import {resolveBazarakiRubric} from '../../lib/integrations/bazaraki/rubricMappings'
import {validatePropertyForBazaraki} from '../../lib/integrations/bazaraki/validatePropertyForBazaraki'
import {getBazarakiDistrictById} from '../../lib/integrations/bazaraki/districts'
import type {Property, SiteSettings} from '../../types/cms'
import '../../components/admin/AdminShell.css'

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

  const stats = useMemo(() => {
    let ready = 0
    let notReady = 0
    for (const p of rows) {
      const v = validatePropertyForBazaraki(p, settings)
      if (v.ready) ready += 1
      else notReady += 1
    }
    return {ready, notReady, total: rows.length}
  }, [rows, settings])

  function copyFeedUrl() {
    void navigator.clipboard.writeText(BAZARAKI_FEED_URL).then(() => {
      toast.success('Feed URL copied')
    })
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Bazaraki</h1>
          <p className="admin-page__lede">
            XML feed for Bazaraki integration. Only published, active listings marked for Bazaraki
            and passing readiness checks appear in the feed.
          </p>
        </div>
        <div className="admin-actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={copyFeedUrl}>
            Copy feed URL
          </button>
          <a
            className="admin-btn admin-btn--gold"
            href={BAZARAKI_FEED_URL}
            target="_blank"
            rel="noreferrer"
          >
            Open feed
          </a>
        </div>
      </header>

      <div className="admin-bazaraki-stats">
        <div className="admin-bazaraki-stats__card">
          <strong>{stats.ready}</strong>
          <span>Ready for feed</span>
        </div>
        <div className="admin-bazaraki-stats__card">
          <strong>{stats.notReady}</strong>
          <span>Need fixes</span>
        </div>
        <div className="admin-bazaraki-stats__card">
          <strong>{stats.total}</strong>
          <span>Marked for Bazaraki</span>
        </div>
        <div className="admin-bazaraki-stats__card">
          <strong>{settings.bazaraki_feed_enabled ? 'On' : 'Off'}</strong>
          <span>Feed status</span>
        </div>
      </div>

      <div className="admin-card admin-field admin-field--full" style={{marginBottom: '1rem'}}>
        <label>Feed URL (register in Bazaraki settings)</label>
        <div className="admin-feed-url">
          <input readOnly value={BAZARAKI_FEED_URL} />
          <button type="button" className="admin-btn admin-btn--ghost" onClick={copyFeedUrl}>
            Copy
          </button>
        </div>
      </div>

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
                <th>Schema</th>
                <th>District</th>
                <th>Rubric</th>
                <th>Feed</th>
                <th>Issues</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const v = validatePropertyForBazaraki(p, settings)
                const district = getBazarakiDistrictById(p.bazaraki_district_id)
                const rubric =
                  p.status === 'for_sale' || p.status === 'for_rent'
                    ? resolveBazarakiRubric(p.property_type, p.status, settings)
                    : null
                return (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/admin/properties/${p.id}/edit`}>
                        {p.reference_number} — {p.title}
                      </Link>
                    </td>
                    <td>{p.status}</td>
                    <td>{v.attrsSchema ?? '—'}</td>
                    <td>
                      {district ? `${district.name} (${p.bazaraki_district_id})` : '—'}
                    </td>
                    <td>{rubric ?? '—'}</td>
                    <td>{v.ready ? 'In feed' : 'Excluded'}</td>
                    <td>
                      {[...v.missingFields, ...v.errors, ...v.warnings].join(' · ') || '—'}
                    </td>
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
