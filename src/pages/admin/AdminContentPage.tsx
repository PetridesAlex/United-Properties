import {useEffect, useState} from 'react'
import toast from 'react-hot-toast'
import {supabase} from '../../lib/supabase/client'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import type {SiteContentRow} from '../../types/cms'
import '../../components/admin/AdminShell.css'

type FieldDef = {
  page: string
  section: string
  content_key: string
  label: string
  content_type: 'text' | 'textarea'
}

const FIELDS: FieldDef[] = [
  {page: 'home', section: 'hero', content_key: 'heading', label: 'Hero heading', content_type: 'text'},
  {page: 'home', section: 'hero', content_key: 'subtitle', label: 'Hero subtitle', content_type: 'text'},
  {page: 'home', section: 'hero', content_key: 'paragraph', label: 'Hero paragraph', content_type: 'textarea'},
  {page: 'home', section: 'hero', content_key: 'cta_text', label: 'CTA text', content_type: 'text'},
  {page: 'home', section: 'hero', content_key: 'cta_link', label: 'CTA link', content_type: 'text'},
  {page: 'home', section: 'featured', content_key: 'heading', label: 'Featured section heading', content_type: 'text'},
  {page: 'home', section: 'featured', content_key: 'description', label: 'Featured section description', content_type: 'textarea'},
  {page: 'about', section: 'main', content_key: 'heading', label: 'About heading', content_type: 'text'},
  {page: 'about', section: 'main', content_key: 'intro', label: 'About intro', content_type: 'textarea'},
  {page: 'about', section: 'main', content_key: 'story', label: 'About story', content_type: 'textarea'},
  {page: 'contact', section: 'main', content_key: 'heading', label: 'Contact heading', content_type: 'text'},
  {page: 'contact', section: 'main', content_key: 'description', label: 'Contact description', content_type: 'textarea'},
]

function keyOf(f: FieldDef) {
  return `${f.page}.${f.section}.${f.content_key}`
}

export default function AdminContentPage() {
  const {user} = useAdminAuth()
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!supabase) {
        setLoading(false)
        return
      }
      const {data, error} = await supabase.from('site_content').select('*')
      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      if (cancelled) return
      const map: Record<string, string> = {}
      for (const row of (data ?? []) as SiteContentRow[]) {
        map[`${row.page}.${row.section}.${row.content_key}`] = row.value
      }
      setValues(map)
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSave() {
    if (!supabase) return
    setSaving(true)
    try {
      const rows = FIELDS.map((f) => ({
        page: f.page,
        section: f.section,
        content_key: f.content_key,
        content_type: f.content_type,
        value: values[keyOf(f)] ?? '',
        updated_by: user?.id ?? null,
      }))
      const {error} = await supabase
        .from('site_content')
        .upsert(rows, {onConflict: 'page,section,content_key'})
      if (error) throw new Error(error.message)
      toast.success('Website content updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="admin-empty">Loading content…</p>

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Website Content</h1>
          <p className="admin-page__lede">Edit key website copy without touching code.</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--gold"
          disabled={saving}
          onClick={() => void onSave()}
        >
          Save content
        </button>
      </header>

      <section className="admin-card admin-form__section">
        <h2>Homepage Hero</h2>
        {FIELDS.filter((f) => f.page === 'home' && f.section === 'hero').map((f) => (
          <div className="admin-field" key={keyOf(f)}>
            <label>{f.label}</label>
            {f.content_type === 'textarea' ? (
              <textarea
                value={values[keyOf(f)] ?? ''}
                onChange={(e) => setValues((v) => ({...v, [keyOf(f)]: e.target.value}))}
              />
            ) : (
              <input
                value={values[keyOf(f)] ?? ''}
                onChange={(e) => setValues((v) => ({...v, [keyOf(f)]: e.target.value}))}
              />
            )}
          </div>
        ))}
      </section>

      <section className="admin-card admin-form__section">
        <h2>Featured property section</h2>
        {FIELDS.filter((f) => f.page === 'home' && f.section === 'featured').map((f) => (
          <div className="admin-field" key={keyOf(f)}>
            <label>{f.label}</label>
            {f.content_type === 'textarea' ? (
              <textarea
                value={values[keyOf(f)] ?? ''}
                onChange={(e) => setValues((v) => ({...v, [keyOf(f)]: e.target.value}))}
              />
            ) : (
              <input
                value={values[keyOf(f)] ?? ''}
                onChange={(e) => setValues((v) => ({...v, [keyOf(f)]: e.target.value}))}
              />
            )}
          </div>
        ))}
      </section>

      <section className="admin-card admin-form__section">
        <h2>About</h2>
        {FIELDS.filter((f) => f.page === 'about').map((f) => (
          <div className="admin-field" key={keyOf(f)}>
            <label>{f.label}</label>
            <textarea
              value={values[keyOf(f)] ?? ''}
              onChange={(e) => setValues((v) => ({...v, [keyOf(f)]: e.target.value}))}
            />
          </div>
        ))}
      </section>

      <section className="admin-card admin-form__section">
        <h2>Contact</h2>
        {FIELDS.filter((f) => f.page === 'contact').map((f) => (
          <div className="admin-field" key={keyOf(f)}>
            <label>{f.label}</label>
            {f.content_type === 'textarea' ? (
              <textarea
                value={values[keyOf(f)] ?? ''}
                onChange={(e) => setValues((v) => ({...v, [keyOf(f)]: e.target.value}))}
              />
            ) : (
              <input
                value={values[keyOf(f)] ?? ''}
                onChange={(e) => setValues((v) => ({...v, [keyOf(f)]: e.target.value}))}
              />
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
