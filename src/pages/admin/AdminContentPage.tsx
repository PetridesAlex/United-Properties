import {useEffect, useMemo, useState} from 'react'
import {ArrowLeft, ExternalLink, FileText, Save} from 'lucide-react'
import toast from 'react-hot-toast'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import {fetchSiteContentMap, savePageContent} from '../../lib/content/api'
import {
  CONTENT_PAGES,
  contentKey,
  countPageFields,
  getContentPage,
  getDefaultContentMap,
  type ContentPageDef,
} from '../../lib/content/schema'
import '../../components/admin/AdminShell.css'
import './AdminContentPage.css'

export default function AdminContentPage() {
  const {user} = useAdminAuth()
  const [values, setValues] = useState<Record<string, string>>({})
  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activePageId, setActivePageId] = useState<string | null>(null)

  const defaults = useMemo(() => getDefaultContentMap(), [])
  const activePage = activePageId ? getContentPage(activePageId) : undefined

  useEffect(() => {
    let cancelled = false
    async function load() {
      const map = await fetchSiteContentMap()
      if (cancelled) return
      const merged = {...defaults, ...map}
      setValues(merged)
      setSavedSnapshot(merged)
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [defaults])

  const dirty = useMemo(() => {
    if (!activePage) return false
    for (const section of activePage.sections) {
      for (const field of section.fields) {
        const key = contentKey(activePage.id, section.id, field.key)
        if ((values[key] ?? '') !== (savedSnapshot[key] ?? '')) return true
      }
    }
    return false
  }, [activePage, values, savedSnapshot])

  function setField(pageId: string, sectionId: string, fieldKey: string, next: string) {
    const key = contentKey(pageId, sectionId, fieldKey)
    setValues((prev) => ({...prev, [key]: next}))
  }

  function filledCount(page: ContentPageDef) {
    let filled = 0
    for (const section of page.sections) {
      for (const field of section.fields) {
        const key = contentKey(page.id, section.id, field.key)
        if ((values[key] ?? '').trim()) filled += 1
      }
    }
    return filled
  }

  async function onSavePage() {
    if (!activePage) return
    setSaving(true)
    try {
      await savePageContent(activePage, values, user?.id)
      const nextSnapshot = {...savedSnapshot}
      for (const section of activePage.sections) {
        for (const field of section.fields) {
          const key = contentKey(activePage.id, section.id, field.key)
          nextSnapshot[key] = values[key] ?? ''
        }
      }
      setSavedSnapshot(nextSnapshot)
      toast.success(`${activePage.title} updated — live on the website`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="admin-empty">Loading website content…</p>

  if (!activePage) {
    const websitePages = [
      'home',
      'about',
      'contact',
      'services',
      'sell',
      'properties',
      'agents',
      'property',
      'not-found',
    ] as const
    const siteWidePages = ['inquiry', 'navbar', 'footer', 'search'] as const
    const totalFields = CONTENT_PAGES.reduce((sum, page) => sum + countPageFields(page), 0)

    return (
      <div className="admin-page content-admin content-admin--catalog">
        <header className="content-admin__hero">
          <div className="content-admin__hero-copy">
            <p className="content-admin__eyebrow">Website copy</p>
            <h1>Edit by page</h1>
            <p className="content-admin__lede">
              Choose a page, update the text section by section, then save. Changes go live on the
              website immediately.
            </p>
          </div>
          <div className="content-admin__hero-meta" aria-label="Content overview">
            <div>
              <span>Pages</span>
              <strong>{CONTENT_PAGES.length}</strong>
            </div>
            <div>
              <span>Editable fields</span>
              <strong>{totalFields}</strong>
            </div>
          </div>
        </header>

        <div className="content-admin__catalog">
          {(
            [
              {
                title: 'Website pages',
                blurb: 'Marketing pages your visitors see first.',
                ids: websitePages,
              },
              {
                title: 'Site-wide & forms',
                blurb: 'Shared navigation, footer, search, and enquiry copy.',
                ids: siteWidePages,
              },
            ] as const
          ).map((group) => (
            <section key={group.title} className="content-admin__group">
              <header className="content-admin__group-head">
                <div>
                  <h2 className="content-admin__group-title">{group.title}</h2>
                  <p className="content-admin__group-blurb">{group.blurb}</p>
                </div>
                <span className="content-admin__group-count">
                  {group.ids.length} area{group.ids.length === 1 ? '' : 's'}
                </span>
              </header>
              <div className="content-admin__pages">
                {group.ids.map((id) => {
                  const page = CONTENT_PAGES.find((p) => p.id === id)
                  if (!page) return null
                  const total = countPageFields(page)
                  const filled = filledCount(page)
                  return (
                    <button
                      key={page.id}
                      type="button"
                      className="content-admin__page-card"
                      onClick={() => setActivePageId(page.id)}
                    >
                      <span className="content-admin__page-icon" aria-hidden>
                        <FileText size={18} />
                      </span>
                      <span className="content-admin__page-body">
                        <strong>{page.title}</strong>
                        <span>{page.description}</span>
                        <em>
                          {filled}/{total} fields · {page.path}
                        </em>
                      </span>
                      <span className="content-admin__page-cta">Edit</span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page content-admin">
      <header className="admin-page__header content-admin__header">
        <div className="content-admin__editor-intro">
          <button
            type="button"
            className="content-admin__back"
            onClick={() => {
              if (dirty && !window.confirm('You have unsaved changes. Leave this page?')) return
              setActivePageId(null)
            }}
          >
            <ArrowLeft size={16} aria-hidden />
            All pages
          </button>
          <p className="content-admin__eyebrow">Editing</p>
          <h1>{activePage.title}</h1>
          <p className="content-admin__lede">{activePage.description}</p>
        </div>
        <div className="admin-actions content-admin__actions">
          {dirty ? <span className="content-admin__dirty">Unsaved changes</span> : null}
          <a
            className="admin-btn admin-btn--ghost"
            href={activePage.path}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} aria-hidden />
            Preview
          </a>
          <button
            type="button"
            className="admin-btn admin-btn--gold"
            disabled={saving || !dirty}
            onClick={() => void onSavePage()}
          >
            <Save size={15} aria-hidden />
            {saving ? 'Saving…' : 'Save this page'}
          </button>
        </div>
      </header>

      <div className="content-admin__sections">
        {activePage.sections.map((section, index) => (
          <section key={section.id} className="content-admin__section">
            <header className="content-admin__section-head">
              <span className="content-admin__section-index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>
            </header>

            <div className="content-admin__fields">
              {section.fields.map((field) => {
                const key = contentKey(activePage.id, section.id, field.key)
                const value = values[key] ?? ''
                return (
                  <div className="admin-field content-admin__field" key={key}>
                    <label htmlFor={key}>{field.label}</label>
                    {field.help ? <p className="content-admin__help">{field.help}</p> : null}
                    {field.type === 'textarea' ? (
                      <textarea
                        id={key}
                        rows={field.rows ?? 4}
                        value={value}
                        placeholder={field.defaultValue}
                        onChange={(e) =>
                          setField(activePage.id, section.id, field.key, e.target.value)
                        }
                      />
                    ) : (
                      <input
                        id={key}
                        value={value}
                        placeholder={field.defaultValue}
                        onChange={(e) =>
                          setField(activePage.id, section.id, field.key, e.target.value)
                        }
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="content-admin__footer-bar">
        <p>Changes go live on the website as soon as you save.</p>
        <button
          type="button"
          className="admin-btn admin-btn--gold"
          disabled={saving || !dirty}
          onClick={() => void onSavePage()}
        >
          {saving ? 'Saving…' : 'Save this page'}
        </button>
      </div>
    </div>
  )
}
