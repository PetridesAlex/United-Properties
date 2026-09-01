import {useEffect, useMemo, useRef, useState} from 'react'
import {ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, FileText, Save} from 'lucide-react'
import toast from 'react-hot-toast'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import {fetchSiteContentMap, savePageContent} from '../../lib/content/api'
import {
  CONTENT_PAGES,
  contentKey,
  countPageFields,
  getContentCatalogGroups,
  getContentPage,
  getDefaultContentMap,
  type ContentPageDef,
} from '../../lib/content/schema'
import '../../components/admin/AdminShell.css'
import './AdminContentPage.css'

const PROGRESS_KEY = 'up.contentCms.v1'

type ContentProgress = {
  activePageId: string | null
  activeSectionId: string | null
  values: Record<string, string>
  savedSnapshot: Record<string, string>
  scrollY: number
  updatedAt: string
}

function readProgress(): ContentProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ContentProgress>
    if (!parsed || typeof parsed !== 'object') return null
    return {
      activePageId: typeof parsed.activePageId === 'string' ? parsed.activePageId : null,
      activeSectionId: typeof parsed.activeSectionId === 'string' ? parsed.activeSectionId : null,
      values: parsed.values && typeof parsed.values === 'object' ? parsed.values : {},
      savedSnapshot:
        parsed.savedSnapshot && typeof parsed.savedSnapshot === 'object' ? parsed.savedSnapshot : {},
      scrollY: typeof parsed.scrollY === 'number' ? parsed.scrollY : 0,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    }
  } catch {
    return null
  }
}

function writeProgress(progress: Omit<ContentProgress, 'updatedAt'>) {
  try {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        ...progress,
        updatedAt: new Date().toISOString(),
      } satisfies ContentProgress),
    )
  } catch {
    // Ignore quota / private mode.
  }
}

export default function AdminContentPage() {
  const {user} = useAdminAuth()
  const defaults = useMemo(() => getDefaultContentMap(), [])
  const cached = useMemo(() => readProgress(), [])

  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...defaults,
    ...(cached?.values ?? {}),
  }))
  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>(() => ({
    ...defaults,
    ...(cached?.savedSnapshot ?? cached?.values ?? {}),
  }))
  const [loading, setLoading] = useState(() => !cached)
  const [saving, setSaving] = useState(false)
  const [activePageId, setActivePageId] = useState<string | null>(() => {
    if (cached?.activePageId && getContentPage(cached.activePageId)) return cached.activePageId
    return null
  })
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    () => cached?.activeSectionId ?? null,
  )

  const activePage = activePageId ? getContentPage(activePageId) : undefined
  const valuesRef = useRef(values)
  const savedRef = useRef(savedSnapshot)
  const pageRef = useRef(activePageId)
  const sectionRef = useRef(activeSectionId)
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restoredScroll = useRef(false)

  valuesRef.current = values
  savedRef.current = savedSnapshot
  pageRef.current = activePageId
  sectionRef.current = activeSectionId

  useEffect(() => {
    let cancelled = false
    async function load() {
      const map = await fetchSiteContentMap()
      if (cancelled) return

      setValues((prev) => {
        // Keep in-progress edits; only fill gaps from the server.
        const next = {...defaults, ...map}
        for (const [key, value] of Object.entries(prev)) {
          const saved = savedRef.current[key] ?? ''
          if (value !== saved) next[key] = value
        }
        return next
      })
      setSavedSnapshot((prev) => {
        const next = {...defaults, ...map}
        // Preserve snapshot keys that still match local drafts so dirty state stays accurate.
        for (const [key, value] of Object.entries(prev)) {
          if ((valuesRef.current[key] ?? '') !== value) next[key] = value
        }
        return next
      })
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [defaults])

  useEffect(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      writeProgress({
        activePageId,
        activeSectionId,
        values,
        savedSnapshot,
        scrollY: window.scrollY || 0,
      })
    }, 400)
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current)
    }
  }, [activePageId, activeSectionId, values, savedSnapshot])

  useEffect(() => {
    function onScroll() {
      if (persistTimer.current) clearTimeout(persistTimer.current)
      persistTimer.current = setTimeout(() => {
        writeProgress({
          activePageId: pageRef.current,
          activeSectionId: sectionRef.current,
          values: valuesRef.current,
          savedSnapshot: savedRef.current,
          scrollY: window.scrollY || 0,
        })
      }, 500)
    }
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (loading || restoredScroll.current) return
    const y = cached?.scrollY ?? 0
    if (y > 0 && cached?.activePageId === activePageId) {
      restoredScroll.current = true
      requestAnimationFrame(() => window.scrollTo(0, y))
    } else {
      restoredScroll.current = true
    }
  }, [loading, activePageId, cached])

  useEffect(() => {
    if (!activePage) return
    const valid = activePage.sections.some((section) => section.id === activeSectionId)
    if (!valid) setActiveSectionId(activePage.sections[0]?.id ?? null)
  }, [activePage, activeSectionId])

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

  const catalogGroups = useMemo(() => getContentCatalogGroups(), [])

  const sectionIndex = useMemo(() => {
    if (!activePage || !activeSectionId) return 0
    const idx = activePage.sections.findIndex((s) => s.id === activeSectionId)
    return idx >= 0 ? idx : 0
  }, [activePage, activeSectionId])

  const activeSection = activePage?.sections[sectionIndex]

  function sectionDirty(page: ContentPageDef, sectionId: string) {
    const section = page.sections.find((s) => s.id === sectionId)
    if (!section) return false
    for (const field of section.fields) {
      const key = contentKey(page.id, section.id, field.key)
      if ((values[key] ?? '') !== (savedSnapshot[key] ?? '')) return true
    }
    return false
  }

  function openPage(pageId: string, sectionId?: string) {
    const page = getContentPage(pageId)
    restoredScroll.current = true
    setActivePageId(pageId)
    setActiveSectionId(sectionId ?? page?.sections[0]?.id ?? null)
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }

  function goToSection(sectionId: string) {
    setActiveSectionId(sectionId)
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }

  function goAdjacentSection(delta: number) {
    if (!activePage) return
    const next = Math.min(Math.max(sectionIndex + delta, 0), activePage.sections.length - 1)
    goToSection(activePage.sections[next].id)
  }

  function backToCatalog() {
    if (dirty && !window.confirm('You have unsaved changes. Leave this page?')) return
    restoredScroll.current = true
    setActivePageId(null)
    setActiveSectionId(null)
    requestAnimationFrame(() => window.scrollTo(0, 0))
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
      writeProgress({
        activePageId,
        activeSectionId,
        values,
        savedSnapshot: nextSnapshot,
        scrollY: window.scrollY || 0,
      })
      toast.success(`${activePage.title} saved`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="admin-empty">Loading website content…</p>

  if (!activePage) {
    const totalFields = CONTENT_PAGES.reduce((sum, page) => sum + countPageFields(page), 0)

    return (
      <div className="admin-page content-admin content-admin--catalog">
        <header className="content-admin__hero">
          <div className="content-admin__hero-copy">
            <p className="content-admin__eyebrow">Website copy</p>
            <h1>Edit page by page</h1>
            <p className="content-admin__lede">
              Choose a page, then walk through each section. Every public page and shared block is listed
              here — save when a page is ready.
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
          {catalogGroups.map((group) => (
            <section key={group.id} className="content-admin__group">
              <header className="content-admin__group-head">
                <div>
                  <h2 className="content-admin__group-title">{group.title}</h2>
                  <p className="content-admin__group-blurb">{group.blurb}</p>
                </div>
                <span className="content-admin__group-count">{group.ids.length} areas</span>
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
                      onClick={() => openPage(page.id)}
                    >
                      <span className="content-admin__page-icon" aria-hidden>
                        <FileText size={18} />
                      </span>
                      <span className="content-admin__page-body">
                        <strong>{page.title}</strong>
                        <span>{page.description}</span>
                        <em>
                          {page.sections.length} sections · {filled}/{total} fields · {page.path}
                        </em>
                      </span>
                      <span className="content-admin__page-cta">Open</span>
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
          <button type="button" className="content-admin__back" onClick={backToCatalog}>
            <ArrowLeft size={16} aria-hidden />
            All pages
          </button>
          <p className="content-admin__eyebrow">Editing</p>
          <h1>{activePage.title}</h1>
          <p className="content-admin__lede">{activePage.description}</p>
          <p className="content-admin__step">
            Editing section {sectionIndex + 1} of {activePage.sections.length}
            {activeSection ? ` — ${activeSection.title}` : ''}
          </p>
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

      <div className="content-admin__editor">
        <aside className="content-admin__rail" aria-label="Page sections">
          <p className="content-admin__rail-label">
            Section {sectionIndex + 1} of {activePage.sections.length}
          </p>
          <ol className="content-admin__rail-list">
            {activePage.sections.map((section, index) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={`content-admin__rail-btn${section.id === activeSection?.id ? ' is-active' : ''}${
                    sectionDirty(activePage, section.id) ? ' is-dirty' : ''
                  }`}
                  onClick={() => goToSection(section.id)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <div className="content-admin__stage">
          {activeSection ? (
            <section className="content-admin__section">
              <header className="content-admin__section-head">
                <span className="content-admin__section-index">
                  {String(sectionIndex + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2>{activeSection.title}</h2>
                  <p>{activeSection.description}</p>
                </div>
              </header>

              <div className="content-admin__fields">
                {activeSection.fields.map((field) => {
                  const key = contentKey(activePage.id, activeSection.id, field.key)
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
                            setField(activePage.id, activeSection.id, field.key, e.target.value)
                          }
                        />
                      ) : (
                        <input
                          id={key}
                          value={value}
                          placeholder={field.defaultValue}
                          onChange={(e) =>
                            setField(activePage.id, activeSection.id, field.key, e.target.value)
                          }
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ) : null}

          <div className="content-admin__section-nav">
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              disabled={sectionIndex <= 0}
              onClick={() => goAdjacentSection(-1)}
            >
              <ChevronLeft size={16} aria-hidden />
              Previous section
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              disabled={sectionIndex >= activePage.sections.length - 1}
              onClick={() => goAdjacentSection(1)}
            >
              Next section
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="content-admin__footer-bar">
        <p>Save when ready — you stay on this page and can keep editing.</p>
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
