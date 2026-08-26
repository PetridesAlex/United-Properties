import {useEffect, useState, type FormEvent} from 'react'
import toast from 'react-hot-toast'
import {supabase} from '../../lib/supabase/client'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
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
      if (!cancelled && data) setForm(data as SiteSettings)
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

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Settings</h1>
          <p className="admin-page__lede">Company details, SEO defaults, and social links.</p>
        </div>
      </header>
      <form className="admin-card admin-form" onSubmit={(e) => void onSubmit(e)}>
        <div className="admin-form__grid">
          {field('Company name', 'company_name')}
          {field('Logo URL', 'company_logo_url')}
          {field('Phone', 'phone')}
          {field('Email', 'email')}
          {field('Address', 'address')}
          {field('Opening hours', 'opening_hours')}
          {field('Instagram', 'social_instagram')}
          {field('LinkedIn', 'social_linkedin')}
          {field('Facebook', 'social_facebook')}
          {field('WhatsApp URL', 'social_whatsapp')}
          {field('Telegram URL', 'social_telegram')}
          {field('Google Maps link', 'google_maps_link')}
          {field('Google Maps embed URL', 'google_maps_embed_url')}
          {field('Default SEO title', 'default_seo_title')}
          {field('Default SEO description', 'default_seo_description')}
          {field('Company registration', 'company_registration')}
        </div>
        <button className="admin-btn admin-btn--gold" type="submit" disabled={saving}>
          Save settings
        </button>
      </form>
    </div>
  )
}
