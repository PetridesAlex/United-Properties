import {useEffect, useState, type FormEvent} from 'react'
import toast from 'react-hot-toast'
import {supabase} from '../../lib/supabase/client'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import {BAZARAKI_FEED_URL} from '../../lib/integrations/bazaraki/mappings'
import {DEFAULT_BAZARAKI_RUBRICS} from '../../lib/integrations/bazaraki/rubricMappings'
import type {SiteSettings} from '../../types/cms'
import '../../components/admin/AdminShell.css'

const defaults: SiteSettings = {
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

export default function AdminSettingsPage() {
  const {user} = useAdminAuth()
  const [form, setForm] = useState<SiteSettings>(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!supabase) {
        setLoading(false)
        return
      }
      const {data, error} = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      if (error) toast.error(error.message)
      if (!cancelled && data) setForm({...defaults, ...(data as SiteSettings)})
      if (!cancelled) setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!supabase) return
    setSaving(true)
    try {
      const {error} = await supabase
        .from('site_settings')
        .update({
          ...form,
          updated_by: user?.id ?? null,
        })
        .eq('id', 1)
      if (error) throw new Error(error.message)
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function copyFeedUrl() {
    void navigator.clipboard.writeText(BAZARAKI_FEED_URL).then(() => {
      toast.success('Feed URL copied')
    })
  }

  if (loading) return <p className="admin-empty">Loading settings…</p>

  function field(label: string, key: keyof SiteSettings) {
    return (
      <div className="admin-field">
        <label>{label}</label>
        <input
          value={(form[key] as string) || ''}
          onChange={(e) => setForm((prev) => ({...prev, [key]: e.target.value || null}))}
        />
      </div>
    )
  }

  function rubricField(
    label: string,
    key:
      | 'bazaraki_rubric_apartments_sale'
      | 'bazaraki_rubric_apartments_rent'
      | 'bazaraki_rubric_houses_sale'
      | 'bazaraki_rubric_houses_rent'
      | 'bazaraki_rubric_residential_buildings_sale'
      | 'bazaraki_rubric_prefabricated_houses_sale'
      | 'bazaraki_rubric_other_sale'
      | 'bazaraki_rubric_other_rent'
      | 'bazaraki_rubric_commercial_sale'
      | 'bazaraki_rubric_commercial_rent'
      | 'bazaraki_rubric_plots_sale'
      | 'bazaraki_rubric_plots_rent',
  ) {
    return (
      <div className="admin-field">
        <label>{label}</label>
        <input
          type="number"
          value={form[key] ?? ''}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              [key]: e.target.value ? Number(e.target.value) : null,
            }))
          }
        />
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Settings</h1>
          <p className="admin-page__lede">Company details, SEO defaults, social links, and Bazaraki feed.</p>
        </div>
      </header>
      <form className="admin-card admin-form" onSubmit={(e) => void onSubmit(e)}>
        <section className="admin-form__section">
          <h2>Company</h2>
          <div className="admin-form__grid">
            {field('Company name', 'company_name')}
            {field('Logo URL', 'company_logo_url')}
            {field('Phone', 'phone')}
            {field('Email', 'email')}
            {field('Address', 'address')}
            {field('Opening hours', 'opening_hours')}
            {field('Company registration', 'company_registration')}
          </div>
        </section>

        <section className="admin-form__section">
          <h2>Social &amp; maps</h2>
          <div className="admin-form__grid">
            {field('Instagram', 'social_instagram')}
            {field('LinkedIn', 'social_linkedin')}
            {field('Facebook', 'social_facebook')}
            {field('WhatsApp URL', 'social_whatsapp')}
            {field('Telegram URL', 'social_telegram')}
            {field('Google Maps link', 'google_maps_link')}
            {field('Google Maps embed URL', 'google_maps_embed_url')}
          </div>
        </section>

        <section className="admin-form__section">
          <h2>SEO defaults</h2>
          <div className="admin-form__grid">
            {field('Default SEO title', 'default_seo_title')}
            {field('Default SEO description', 'default_seo_description')}
          </div>
        </section>

        <section className="admin-form__section">
          <h2>Bazaraki integration</h2>
          <p className="admin-page__lede">
            Register the feed URL in your{' '}
            <a href="https://www.bazaraki.com/profile/settings/" target="_blank" rel="noreferrer">
              Bazaraki profile settings
            </a>
            . Bazaraki pulls this file every hour.
          </p>
          <div className="admin-field admin-field--full">
            <label>XML feed URL</label>
            <div className="admin-feed-url">
              <input readOnly value={BAZARAKI_FEED_URL} />
              <button type="button" className="admin-btn admin-btn--ghost" onClick={copyFeedUrl}>
                Copy
              </button>
              <a
                className="admin-btn admin-btn--ghost"
                href={BAZARAKI_FEED_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open
              </a>
            </div>
          </div>
          <div className="admin-form__grid">
            <label>
              <input
                type="checkbox"
                checked={form.bazaraki_feed_enabled}
                onChange={(e) =>
                  setForm((prev) => ({...prev, bazaraki_feed_enabled: e.target.checked}))
                }
              />{' '}
              Feed enabled
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.bazaraki_phone_hide}
                onChange={(e) =>
                  setForm((prev) => ({...prev, bazaraki_phone_hide: e.target.checked}))
                }
              />{' '}
              Hide phone on Bazaraki ads
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.bazaraki_negotiable_price}
                onChange={(e) =>
                  setForm((prev) => ({...prev, bazaraki_negotiable_price: e.target.checked}))
                }
              />{' '}
              Show negotiable price label
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.bazaraki_exchange}
                onChange={(e) =>
                  setForm((prev) => ({...prev, bazaraki_exchange: e.target.checked}))
                }
              />{' '}
              Show swap / exchange label
            </label>
            {rubricField('Apartments — For Sale', 'bazaraki_rubric_apartments_sale')}
            {rubricField('Apartments — For Rent', 'bazaraki_rubric_apartments_rent')}
            {rubricField('Houses — For Sale', 'bazaraki_rubric_houses_sale')}
            {rubricField('Houses — For Rent', 'bazaraki_rubric_houses_rent')}
            {rubricField('Residential buildings — For Sale', 'bazaraki_rubric_residential_buildings_sale')}
            {rubricField('Prefabricated houses — For Sale', 'bazaraki_rubric_prefabricated_houses_sale')}
            {rubricField('Other — For Sale', 'bazaraki_rubric_other_sale')}
            {rubricField('Other — For Rent', 'bazaraki_rubric_other_rent')}
            {rubricField('Commercial — For Sale', 'bazaraki_rubric_commercial_sale')}
            {rubricField('Commercial — For Rent', 'bazaraki_rubric_commercial_rent')}
            {rubricField('Plots of land — For Sale', 'bazaraki_rubric_plots_sale')}
            {rubricField('Plots of land — For Rent', 'bazaraki_rubric_plots_rent')}
          </div>
        </section>

        <button className="admin-btn admin-btn--gold" type="submit" disabled={saving}>
          Save settings
        </button>
      </form>
    </div>
  )
}
